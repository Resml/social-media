import { Router } from 'express';
import { getCache, setCache } from '../utils/redis';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { fetchAccountSummary, fetchEngagementBreakdown, fetchFollowerGrowth, fetchTopPosts } from '../services/analyticsService';

const router = Router();

// Define generic caching middleware helper for analytics routes
const cacheMiddleware = async (req: AuthRequest, res: any, next: any) => {
  const platform = req.query.platform || 'ALL';
  const key = `analytics:${req.userId}:${req.path}:${platform}`;
  try {
    const cached = await getCache(key);
    if (cached) {
      return res.json(cached);
    }
    // Bind cacheKey to req context so route handler can set it
    (req as any).cacheKey = key;
    next();
  } catch (err) {
    next();
  }
};

router.use(authMiddleware);

router.get('/summary', cacheMiddleware, async (req: AuthRequest, res) => {
  const platform = req.query.platform as string;
  try {
    const data = await fetchAccountSummary(req.userId!, platform);
    await setCache((req as any).cacheKey, data, 300); // 5 min TTL
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/growth', cacheMiddleware, async (req: AuthRequest, res) => {
  const platform = req.query.platform as string;
  try {
    const data = await fetchFollowerGrowth(req.userId!, platform);
    await setCache((req as any).cacheKey, data, 300); 
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/top-posts', cacheMiddleware, async (req: AuthRequest, res) => {
  const platform = req.query.platform as string;
  try {
    const data = await fetchTopPosts(req.userId!, platform);
    await setCache((req as any).cacheKey, data, 300); 
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/engagement-trend', cacheMiddleware, async (req: AuthRequest, res) => {
  const platform = req.query.platform as string;
  try {
    const data = await fetchEngagementBreakdown(req.userId!, platform);
    await setCache((req as any).cacheKey, data, 300); 
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
