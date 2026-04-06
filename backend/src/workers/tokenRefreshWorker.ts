import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../db';
import { encryptToken, decryptToken } from '../utils/crypto';
import axios from 'axios';

// Connect BullMQ to local Redis instance
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

export const tokenRefreshQueue = new Queue('token-refresh', { connection });

export const tokenRefreshWorker = new Worker('token-refresh', async (job: Job) => {
  if (job.name === 'scan-expiring-tokens') {
    // Look for tokens expiring within the next 24 hours
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const expiringAccounts = await prisma.socialAccount.findMany({
      where: {
        tokenExpiresAt: {
          lte: tomorrow,
          not: null
        }
      }
    });

    for (const account of expiringAccounts) {
      try {
        if (account.platform === 'INSTAGRAM') {
          // Instagram long-lived token refresh
          const accessToken = decryptToken(account.accessTokenEncrypted);
          const response = await axios.get(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`);
          const { access_token, expires_in } = response.data;
          
          await prisma.socialAccount.update({
            where: { id: account.id },
            data: {
              accessTokenEncrypted: encryptToken(access_token),
              tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            }
          });
        }
        else if (account.platform === 'TWITTER' && account.refreshTokenEncrypted) {
          // Twitter OAuth 2.0 refresh
          const refreshToken = decryptToken(account.refreshTokenEncrypted);
          const authHeader = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');
          
          const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.TWITTER_CLIENT_ID,
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${authHeader}`
            }
          });
          
          const { access_token, refresh_token, expires_in } = response.data;
          await prisma.socialAccount.update({
            where: { id: account.id },
            data: {
              accessTokenEncrypted: encryptToken(access_token),
              refreshTokenEncrypted: refresh_token ? encryptToken(refresh_token) : account.refreshTokenEncrypted,
              tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
            }
          });
        }
      } catch (err: any) {
        console.error(`[Worker] Failed to refresh token for account ${account.id}`, err?.response?.data || err.message);
      }
    }
  }
}, { connection });

// Handle worker startup logic
export async function initTokenRefreshWorker() {
  const repeatableJobs = await tokenRefreshQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await tokenRefreshQueue.removeRepeatableByKey(job.key);
  }

  // Schedule the scan to run every hour
  await tokenRefreshQueue.add('scan-expiring-tokens', {}, {
    repeat: {
      pattern: '0 * * * *' // At minute 0
    }
  });
  
  console.info('[Worker] Token Refresh Worker started & scheduled');
}
