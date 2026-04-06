import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { fetchCommentsFromUrl } from '../services/exportService';

const router = Router();

/**
 * POST /comments
 * Body: { url: string }
 */
router.post('/comments', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Post URL is required' });
    }

    const userId = req.userId!;
    const result = await fetchCommentsFromUrl(url, userId);
    
    res.json({
      success: true,
      count: result.comments.length,
      source: result.source,
      data: result.comments
    });
  } catch (error: any) {
    console.error('[Export Error Details]:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch comments',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
