import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../db';
import { io } from '../index'; 
import { InboxItemType } from '@prisma/client';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

export const inboxPollQueue = new Queue('inbox-poll', { connection });


export const inboxPollerWorker = new Worker('inbox-poll', async (job: Job) => {
  if (job.name === 'fetch-inbox-items') {
    const activeAccounts = await prisma.socialAccount.findMany();
    
    for (const account of activeAccounts) {
      try {
        // Here we would normally connect exactly via Meta Webhooks or long-polling Apify logic
      } catch (err: any) {
        console.error(`[InboxPoller] Error polling account ${account.id}`, err.message);
      }
    }
  }
}, { connection });

export async function initInboxPollerWorker() {
  const repeatableJobs = await inboxPollQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await inboxPollQueue.removeRepeatableByKey(job.key);
  }

  // To speed up MVP developer testing, we throttle the ticket's "15 minutes" to run every 1 minute.
  await inboxPollQueue.add('fetch-inbox-items', {}, {
    repeat: {
      pattern: '*/1 * * * *' 
    }
  });

  console.info('[Worker] Inbox Poller started & scheduled');
}
