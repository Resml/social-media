import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { postSyncQueue } from '../workers/postSyncWorker';

const router = Router();
router.use(authMiddleware);

// Manual trigger for post synchronization
router.post('/sync/:accountId', async (req: AuthRequest, res) => {
  const { accountId } = req.params;
  
  try {
    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, userId: req.userId }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Social account not found' });
    }
    
    // Add to queue for immediate processing
    await postSyncQueue.add('sync-posts', { accountId });
    
    res.json({ message: 'Synchronization triggered', status: 'PENDING' });
  } catch (error) {
    console.error('[Social Sync] Error triggering sync:', error);
    res.status(500).json({ error: 'Failed to trigger synchronization' });
  }
});

// Check sync status (simple heuristic based on latest post or similar)
router.get('/sync-status/:accountId', async (req: AuthRequest, res) => {
  try {
    const account = await prisma.socialAccount.findFirst({
      where: { id: req.params.accountId, userId: req.userId },
      include: { 
        _count: { select: { posts: true } }
      }
    });
    
    if (!account) return res.status(404).json({ error: 'Account not found' });
    
    res.json({ 
      postCount: account._count.posts,
      lastSyncAt: account.createdAt // Fallback, could be more sophisticated
    });
  } catch (error) {
    res.status(500).json({ error: 'Status check failed' });
  }
});

export default router;
