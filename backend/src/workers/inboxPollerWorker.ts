import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../db';
import { io } from '../index'; 
import { InboxItemType } from '@prisma/client';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

export const inboxPollQueue = new Queue('inbox-poll', { connection });

function generateMockItem(socialAccountId: string, platform: string) {
  const types: InboxItemType[] = ['COMMENT', 'MENTION', 'TAG'];
  const type = types[Math.floor(Math.random() * types.length)];
  const hash = Math.random().toString(36).substring(2, 9);
  
  return {
    socialAccountId,
    type,
    authorHandle: `@user_${hash}`,
    content: `Simulated live ${type.toLowerCase()} triggered purely for validating socket realtime updates! 📱🚀`,
    platformItemId: `mock_${platform}_${hash}`,
  };
}

export const inboxPollerWorker = new Worker('inbox-poll', async (job: Job) => {
  if (job.name === 'fetch-inbox-items') {
    const activeAccounts = await prisma.socialAccount.findMany();
    
    for (const account of activeAccounts) {
      try {
        // Here we would normally connect exactly via Meta Webhooks or long-polling Apify logic
        /* DISABLED: Mock Inbox Generator causes fake inbox items and analytics errors
        const isLucky = Math.random() > 0.4; 
        
        if (isLucky) {
          const newItemPayload = generateMockItem(account.id, account.platform);
          
          const upserted = await prisma.inboxItem.upsert({
            where: {
              socialAccountId_platformItemId: {
                socialAccountId: account.id,
                platformItemId: newItemPayload.platformItemId,
              }
            },
            update: {}, 
            create: newItemPayload
          });
          
          const payloadItem = await prisma.inboxItem.findUnique({
            where: { id: upserted.id },
            include: { socialAccount: { select: { platform: true } } }
          });

          if (payloadItem) {
             io.emit(`inbox:new_item:${account.userId}`, payloadItem);
          }
        }
        */
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
