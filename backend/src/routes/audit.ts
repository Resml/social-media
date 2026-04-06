import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { ActionType, ActionOutcome } from '@prisma/client';

const router = Router();
router.use(authMiddleware);

// GET /audit?accountId=&actionType=&outcome=&from=&to=&page=1
router.get('/', async (req: AuthRequest, res) => {
  const {
    accountId,
    actionType,
    outcome,
    from,
    to,
    page = '1',
  } = req.query as Record<string, string>;

  const PAGE_SIZE = 20;
  const skip = (parseInt(page) - 1) * PAGE_SIZE;

  try {
    // Build the where clause dynamically
    const where: any = {
      socialAccount: { userId: req.userId },
    };

    if (accountId) where.socialAccountId = accountId;
    if (actionType && Object.values(ActionType).includes(actionType as ActionType)) {
      where.actionType = actionType as ActionType;
    }
    if (outcome && Object.values(ActionOutcome).includes(outcome as ActionOutcome)) {
      where.outcome = outcome as ActionOutcome;
    }
    if (from || to) {
      where.executedAt = {};
      if (from) where.executedAt.gte = new Date(from);
      if (to) where.executedAt.lte = new Date(to);
    }

    const [logs, total] = await prisma.$transaction([
      prisma.actionLog.findMany({
        where,
        include: {
          socialAccount: {
            select: { platform: true, accountHandle: true },
          },
        },
        orderBy: { executedAt: 'desc' },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.actionLog.count({ where }),
    ]);

    res.json({
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load audit log' });
  }
});

export default router;
