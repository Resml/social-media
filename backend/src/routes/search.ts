import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/posts', async (req: AuthRequest, res) => {
  const { q, status = 'PUBLISHED', page = '1', limit = '20' } = req.query;
  
  try {
    const userId = req.userId!;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (status === 'PUBLISHED') {
      const where: any = { socialAccount: { userId } };
      
      if (q) {
        where.caption = { contains: q as string, mode: 'insensitive' };
      }

      const [items, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: { 
            socialAccount: { 
              select: { platform: true, accountHandle: true } 
            } 
          },
          orderBy: { publishedAt: 'desc' },
          skip,
          take,
        }),
        prisma.post.count({ where })
      ]);

      return res.json({ items, total, page: Number(page), limit: take });

    } else {
      // Mapping for Scheduled and Drafts
      const statusMap: Record<string, any> = {
        'SCHEDULED': 'QUEUED',
        'DRAFTS': 'DRAFT'
      };
      
      const dbStatus = statusMap[status as string] || 'QUEUED';
      
      const where: any = { 
        socialAccount: { userId },
        status: dbStatus
      };
      
      if (q) {
        where.content = { contains: q as string, mode: 'insensitive' };
      }

      const [items, total] = await Promise.all([
        prisma.scheduledPost.findMany({
          where,
          include: { 
            socialAccount: { 
              select: { platform: true, accountHandle: true } 
            } 
          },
          orderBy: { scheduledAt: 'desc' },
          skip,
          take,
        }),
        prisma.scheduledPost.count({ where })
      ]);

      // Normalize fields for frontend (content -> caption, scheduledAt -> publishedAt)
      const normalizedItems = items.map(item => ({
        ...item,
        caption: item.content,
        publishedAt: item.scheduledAt,
        metrics: {} // Future posts don't have historical metrics yet
      }));

      return res.json({ 
        items: normalizedItems, 
        total, 
        page: Number(page), 
        limit: take 
      });
    }

  } catch (error: any) {
    console.error('[Search] Error fetching content:', error);
    res.status(500).json({ error: 'Server error fetching content' });
  }
});

export default router;
