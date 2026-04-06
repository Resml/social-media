import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../db';
import { ScheduledPostStatus } from '@prisma/client';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

export const schedulerQueue = new Queue('post-scheduler', { connection });

export const schedulerWorker = new Worker('post-scheduler', async (job: Job) => {
  if (job.name === 'process-scheduled-posts') {
    const now = new Date();

    // Bound exclusively to posts sitting in the Queued state perfectly aligning passing clock vectors
    const pendingPosts = await prisma.scheduledPost.findMany({
      where: {
        status: ScheduledPostStatus.QUEUED,
        scheduledAt: { lte: now }
      }
    });
    
    for (const post of pendingPosts) {
      try {
        // [Integration Boundary] — Platform POST simulated directly simulating Graph API integration.
        // We will pause 2 secs mimicking native TLS handshake uploads.
        await new Promise(r => setTimeout(r, 2000));
        
        // Finalize state updating internally
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: ScheduledPostStatus.PUBLISHED }
        });
        
        // Insert standard post to feed explicitly allowing internal Analytics engines to bind against it
        await prisma.post.create({
            data: {
              socialAccountId: post.socialAccountId,
              platformPostId: `pub_${Math.random().toString(36).substring(7)}`,
              caption: post.content,
              mediaUrls: post.mediaUrls,
              publishedAt: new Date(),
              metrics: { likes: 0, comments: 0 }
            }
        });

      } catch (err: any) {
        console.error(`[Scheduler] Failed deploying post ${post.id}`, err.message);
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: { status: ScheduledPostStatus.FAILED }
        });
      }
    }
  }
}, { connection });

export async function initSchedulerWorker() {
  const repeatableJobs = await schedulerQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await schedulerQueue.removeRepeatableByKey(job.key);
  }

  // Bind chron job parsing DB bounds purely identically spaced at exactly 60 seconds.
  await schedulerQueue.add('process-scheduled-posts', {}, {
    repeat: { pattern: '*/1 * * * *' } 
  });

  console.info('[Worker] Standard Post Scheduler started');
}
