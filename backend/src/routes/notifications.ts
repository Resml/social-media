import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/preferences', async (req: AuthRequest, res) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.userId },
      select: { id: true, platform: true, accountHandle: true, notificationPrefs: true }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving preferences.' });
  }
});

router.put('/preferences', async (req: AuthRequest, res) => {
  const { accountId, frequency } = req.body;
  
  if (!accountId || !frequency) return res.status(400).json({ error: 'Missing defined variables' });

  try {
    // Validate bounds cleanly against active user token inherently protecting cross-tenant corruption
    const account = await prisma.socialAccount.findFirst({
       where: { id: accountId, userId: req.userId }
    });
    
    if (!account) return res.status(403).json({ error: 'Tenant boundary error' });

    await prisma.socialAccount.update({
      where: { id: accountId },
      data: { notificationPrefs: { frequency } }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating dynamic preferences.' });
  }
});

export default router;
