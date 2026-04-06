import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../db';
import { Platform } from '@prisma/client';
import axios from 'axios';
import { decryptToken } from '../utils/crypto';
import { ApifyClient } from 'apify-client';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

export const postSyncQueue = new Queue('post-sync', { connection });

export const postSyncWorker = new Worker('post-sync', async (job: Job) => {
  if (job.name === 'sync-posts') {
    const activeAccounts = await prisma.socialAccount.findMany();
    
    for (const account of activeAccounts) {
      try {
        let postsToSync: any[] = [];
        
        // ─── APIFY PROXY SCRAPER (For Manual URLs without OAuth tokens) ───
        if (!account.accessTokenEncrypted || account.accessTokenEncrypted === '') {
          const apifyToken = process.env.APIFY_API_TOKEN;
          if (!apifyToken) throw new Error('Missing Apify Token for scraper');
          
          const client = new ApifyClient({ token: apifyToken });
          const url = account.accountHandle; // URL is stored here
          
          if (account.platform === 'FACEBOOK') {
            console.log(`[Worker] Triggering Apify Proxy for FB Profile: ${url}`);
            // Use the Apify actor for page/profile posts (this works for public profiles)
            const run = await client.actor("apify/facebook-posts-scraper").call({ startUrls: [{ url }], maxPosts: 5 });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            
            postsToSync = items.map((p: any, idx) => ({
              platformPostId: p.id || p.node?.id || p.post_id || `apify_fb_${Date.now()}_${idx}`,
              caption: p.text || p.message || '',
              mediaUrls: (p.media || []).map((m: any) => m.image || m.url).filter(Boolean),
              publishedAt: p.date ? new Date(p.date) : new Date(),
              metrics: { likes: p.likes || 0, comments: p.comments || 0, shares: p.shares || 0 }
            })).filter((p) => p.caption || p.mediaUrls.length > 0);
            
          } else if (account.platform === 'INSTAGRAM') {
            console.log(`[Worker] Triggering Apify Proxy for IG Profile: ${url}`);
            const run = await client.actor("apify/instagram-profile-scraper").call({ usernames: [url.split('instagram.com/')[1]?.replace('/','')], resultsLimit: 5 });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            
            postsToSync = items.map((p: any, idx) => ({
              platformPostId: p.id || `apify_ig_${Date.now()}_${idx}`,
              caption: p.caption || '',
              mediaUrls: p.displayUrl ? [p.displayUrl] : [],
              publishedAt: p.timestamp ? new Date(p.timestamp) : new Date(),
              metrics: { likes: p.likesCount || 0, comments: p.commentsCount || 0 }
            }));
          }

        } else {
          // ─── ORGANIC GRAPH API (For Valid OAuth Tokens) ───
          const token = decryptToken(account.accessTokenEncrypted);

          // ─── Meta Graph API (Facebook) ───
          if (account.platform === 'FACEBOOK') {
          const res = await axios.get(`https://graph.facebook.com/v25.0/me/posts?fields=id,message,full_picture,created_time,shares,likes.summary(true),comments.summary(true)&access_token=${token}`);
          
          postsToSync = (res.data.data || []).map((p: any) => {
            const likes = p.likes?.summary?.total_count || 0;
            const comments = p.comments?.summary?.total_count || 0;
            return {
              platformPostId: p.id,
              caption: p.message || '',
              mediaUrls: p.full_picture ? [p.full_picture] : [],
              publishedAt: new Date(p.created_time),
              metrics: { likes, comments }
            };
          });

        // ─── Meta Graph API (Instagram) ───
        } else if (account.platform === 'INSTAGRAM') {
          const res = await axios.get(`https://graph.facebook.com/v25.0/me/media?fields=id,caption,media_url,timestamp,like_count,comments_count&access_token=${token}`);
          
          postsToSync = (res.data.data || []).map((p: any) => ({
            platformPostId: p.id,
            caption: p.caption || '',
            mediaUrls: p.media_url ? [p.media_url] : [],
            publishedAt: new Date(p.timestamp),
            metrics: { likes: p.like_count || 0, comments: p.comments_count || 0 }
          }));

        // ─── X / Twitter API ───
        } else if (account.platform === 'TWITTER') {
          const res = await axios.get(`https://api.twitter.com/2/users/me/tweets?tweet.fields=created_at,public_metrics,entities&max_results=20`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          postsToSync = (res.data.data || []).map((p: any) => {
            const media = p.entities?.urls?.map((u: any) => u.images?.[0]?.url).filter(Boolean) || [];
            return {
              platformPostId: p.id,
              caption: p.text || '',
              mediaUrls: media,
              publishedAt: new Date(p.created_at),
              metrics: { 
                likes: p.public_metrics?.like_count || 0, 
                comments: p.public_metrics?.reply_count || 0,
                retweets: p.public_metrics?.retweet_count || 0
              }
            };
          });
        }

        }
        
        // Upsert all successfully fetched posts natively into Postgres
        for (const post of postsToSync) {
          await prisma.post.upsert({
            where: {
              socialAccountId_platformPostId: {
                socialAccountId: account.id,
                platformPostId: post.platformPostId,
              }
            },
            update: {
              caption: post.caption,
              metrics: post.metrics,
              mediaUrls: post.mediaUrls
            },
            create: {
              socialAccountId: account.id,
              platformPostId: post.platformPostId,
              caption: post.caption,
              metrics: post.metrics,
              mediaUrls: post.mediaUrls,
              publishedAt: post.publishedAt
            }
          });
        }

      } catch (err: any) {
        if (err.response?.data?.error?.code === 200 || err.response?.data?.error?.message?.includes('blocked')) {
          console.warn(`[Sync Worker] Safe-Skipped: Social API blocked request for account ${account.id}. The Application requires official Developer Platform Auth App Review approval.`);
        } else {
          console.error(`[PostSyncPoller] Error syncing real data for account ${account.id}`, err.response?.data || err.message);
        }
      }
    }
  }
}, { connection });

export async function initPostSyncWorker() {
  const repeatableJobs = await postSyncQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await postSyncQueue.removeRepeatableByKey(job.key);
  }

  // Background sweep every 6 hours as demanded by UX
  await postSyncQueue.add('sync-posts', {}, {
    repeat: { pattern: '0 */6 * * *' } 
  });
  
  // Hack: Trigger an implicit sync immediately at server boot so we have data available instantly allowing Frontend Validation 
  await postSyncQueue.add('sync-posts', {}, { delay: 2000 });

  console.info('[Worker] Post Sync Worker started & scheduled');
}
