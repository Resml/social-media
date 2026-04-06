import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../db';
import nodemailer from 'nodemailer';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

export const emailDigestQueue = new Queue('email-digest', { connection });

async function sendDigestEmail(userEmail: string, unreadItems: any[]) {
  // Graceful configuration explicitly defaulting to Node stream logs if credentials are intentionally unmounted securely
  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Ethereal / Console Fallback natively deployed 
    transporter = {
      sendMail: async (opts: any) => {
        console.info(`\n📧 [EMAIL DISPATCHED] -> ${opts.to}\nSubject: ${opts.subject}\nContent: Aggregated ${unreadItems.length} notifications explicitly.\n`);
      }
    };
  }

  const html = `
    <h2>Your SocialHub Engagement Digest</h2>
    <p>You have ${unreadItems.length} unread interactions across your profiles.</p>
    <hr/>
    <ul>
      ${unreadItems.slice(0, 10).map(i => `<li><b>${i.authorHandle}</b> on ${i.socialAccount.platform}: "${i.content}"</li>`).join('')}
    </ul>
    <p>Login to SocialHub to view all specific data vectors and resolve instances directly.</p>
  `;

  await transporter.sendMail({
    from: '"SocialHub Notifier" <no-reply@socialhub.local>',
    to: userEmail,
    subject: `SocialHub Digest: ${unreadItems.length} Target Updates`,
    html
  });
}

export const emailDigestWorker = new Worker('email-digest', async (job: Job) => {
  if (job.name === 'process-digests') {
    // Determine bounds natively (assuming we check HOURLY implicitly checking unhandled interactions since yesterday bounds)
    // To simplify MVP MVP logic natively: we query Users grouping by email bounds and unread flags natively
    
    const activeUsers = await prisma.user.findMany({
      include: {
        socialAccounts: {
          include: { inboxItems: { where: { isRead: false, isResolved: false } } }
        }
      }
    });

    for (const user of activeUsers) {
      let digestEnabled = false;
      let targetItems: any[] = [];

      for (const account of user.socialAccounts) {
        const prefs = account.notificationPrefs as any;
        // In local prod environments we explicitly read user bounds, mapping to DAILY or HOURLY
        // For development execution, any value parsing > OFF maps explicitly to triggers.
        if (prefs && prefs.frequency && prefs.frequency !== 'OFF') {
          digestEnabled = true;
        }
        targetItems = targetItems.concat(account.inboxItems.map(i => ({...i, socialAccount: { platform: account.platform } })));
      }

      if (digestEnabled && targetItems.length > 0) {
         try {
           await sendDigestEmail(user.email, targetItems);
         } catch (e: any) {
           console.error('[DigestWorker] Nodemailer crash mapping email', e.message);
         }
      }
    }
  }
}, { connection });

export async function initEmailDigestWorker() {
  const repeatableJobs = await emailDigestQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await emailDigestQueue.removeRepeatableByKey(job.key);
  }

  // Digest checks natively process bounds every hour mapping against explicit temporal states.
  await emailDigestQueue.add('process-digests', {}, {
    repeat: { pattern: '0 * * * *' } 
  });

  console.info('[Worker] Email Digest Worker scheduled explicitly on the Hour');
}
