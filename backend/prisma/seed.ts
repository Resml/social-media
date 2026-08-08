import { PrismaClient, Platform, InboxItemType, ScheduledPostStatus, ActionType, ActionOutcome } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create User
  const passwordHash = await hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { id: 'demo-user-id' },
    update: { email: 'demo-user-id@socialhub.com' },
    create: {
      id: 'demo-user-id',
      email: 'demo-user-id@socialhub.com',
      passwordHash,
    },
  });

  // Create Social Accounts
  const fbAccount = await prisma.socialAccount.upsert({
    where: {
      userId_platform_accountHandle: {
        userId: user.id,
        platform: Platform.FACEBOOK,
        accountHandle: 'demopage_fb'
      }
    },
    update: {},
    create: {
      userId: user.id,
      platform: Platform.FACEBOOK,
      accountHandle: 'demopage_fb',
      accessTokenEncrypted: 'mock_token',
      followersCount: 15420,
    }
  });

  const igAccount = await prisma.socialAccount.upsert({
    where: {
      userId_platform_accountHandle: {
        userId: user.id,
        platform: Platform.INSTAGRAM,
        accountHandle: 'demo_insta'
      }
    },
    update: {},
    create: {
      userId: user.id,
      platform: Platform.INSTAGRAM,
      accountHandle: 'demo_insta',
      accessTokenEncrypted: 'mock_token',
      followersCount: 22100,
    }
  });

  // Create Posts (to show in Post Search / Analytics)
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < 5; i++) {
    await prisma.post.upsert({
      where: {
        socialAccountId_platformPostId: {
          socialAccountId: fbAccount.id,
          platformPostId: `fb_post_${i}`
        }
      },
      update: {},
      create: {
        socialAccountId: fbAccount.id,
        platformPostId: `fb_post_${i}`,
        caption: `This is an amazing Facebook post number ${i}!`,
        publishedAt: new Date(now.getTime() - i * oneDayMs * 2),
        metrics: { likes: 120 + i * 15, comments: 20 + i * 5, shares: 10 + i * 2 }
      }
    });

    await prisma.post.upsert({
      where: {
        socialAccountId_platformPostId: {
          socialAccountId: igAccount.id,
          platformPostId: `ig_post_${i}`
        }
      },
      update: {},
      create: {
        socialAccountId: igAccount.id,
        platformPostId: `ig_post_${i}`,
        caption: `Great Instagram post ${i}! 📸✨ #socialmedia`,
        publishedAt: new Date(now.getTime() - i * oneDayMs * 1.5),
        metrics: { likes: 300 + i * 40, comments: 45 + i * 8 }
      }
    });
  }

  // Create Inbox Items
  const inboxData = [
    { type: InboxItemType.COMMENT, authorHandle: '@johndoe', content: 'Great post! I love the insights.' },
    { type: InboxItemType.MENTION, authorHandle: '@marketing_guru', content: 'Check out this post by @demo_insta' },
    { type: InboxItemType.TAG, authorHandle: '@samanthasmith', content: 'Look at this amazing photo' },
    { type: InboxItemType.COMMENT, authorHandle: '@tech_enthusiast', content: 'When is the next update coming?' }
  ];

  for (let i = 0; i < inboxData.length; i++) {
    await prisma.inboxItem.upsert({
      where: {
        socialAccountId_platformItemId: {
          socialAccountId: igAccount.id,
          platformItemId: `ig_item_${i}`
        }
      },
      update: {},
      create: {
        socialAccountId: igAccount.id,
        type: inboxData[i].type,
        authorHandle: inboxData[i].authorHandle,
        content: inboxData[i].content,
        platformItemId: `ig_item_${i}`,
        isRead: false,
        isResolved: false,
        receivedAt: new Date(now.getTime() - i * oneDayMs * 0.5)
      }
    });
  }

  // Create Scheduled Posts
  await prisma.scheduledPost.create({
    data: {
      socialAccountId: fbAccount.id,
      content: 'Excited to announce our upcoming feature rollout!',
      scheduledAt: new Date(now.getTime() + oneDayMs * 2),
      status: ScheduledPostStatus.QUEUED
    }
  });

  await prisma.scheduledPost.create({
    data: {
      socialAccountId: igAccount.id,
      content: 'Behind the scenes at the office today 🏢',
      scheduledAt: new Date(now.getTime() + oneDayMs * 3),
      status: ScheduledPostStatus.DRAFT
    }
  });

  // Create Action Logs
  await prisma.actionLog.create({
    data: {
      socialAccountId: igAccount.id,
      actionType: ActionType.REPLY,
      targetId: 'ig_item_0',
      outcome: ActionOutcome.SUCCESS
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
