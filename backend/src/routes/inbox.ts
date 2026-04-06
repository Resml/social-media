import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { InboxItemType } from '@prisma/client';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const { type, platform, unreadOnly, page = '1', limit = '20' } = req.query;
  try {
    const where: any = {
      socialAccount: { userId: req.userId },
      isResolved: false
    };

    if (type && type !== 'ALL') where.type = type as InboxItemType;
    if (platform && platform !== 'ALL') where.socialAccount = { ...where.socialAccount, platform: platform as string };
    if (unreadOnly === 'true') where.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [items, total] = await Promise.all([
      prisma.inboxItem.findMany({
        where,
        include: { socialAccount: { select: { platform: true, accountHandle: true } } },
        orderBy: { receivedAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.inboxItem.count({ where })
    ]);

    const unreadCount = await prisma.inboxItem.count({
      where: { socialAccount: { userId: req.userId }, isResolved: false, isRead: false }
    });

    res.json({ items, total, page: Number(page), limit: Number(limit), unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/read', async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.inboxItem.updateMany({
      where: { id: req.params.id, socialAccount: { userId: req.userId } },
      data: { isRead: true }
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/resolve', async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.inboxItem.updateMany({
      where: { id: req.params.id, socialAccount: { userId: req.userId } },
      data: { isResolved: true }
    });
    if (updated.count === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
