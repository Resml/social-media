import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const account = await prisma.socialAccount.findFirst({ where: { platform: 'FACEBOOK' }});
  if (!account) return;

  await prisma.post.upsert({
    where: {
      socialAccountId_platformPostId: {
        socialAccountId: account.id,
        platformPostId: 'fb_post_real_heyy',
      }
    },
    update: {},
    create: {
      socialAccountId: account.id,
      platformPostId: 'fb_post_real_heyy',
      caption: 'heyy',
      mediaUrls: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe'],
      publishedAt: new Date(),
      metrics: { likes: 2, comments: 0 }
    }
  });
  console.log('User Post Seeded!');
}
seed();
