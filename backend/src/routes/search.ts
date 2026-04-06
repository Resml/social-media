import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/posts', async (req: AuthRequest, res) => {
  const { q, hashtag, from, to, platform, page = '1', limit = '20' } = req.query;
  
  try {
    const userId = req.userId!;
    
    let whereClauses: string[] = [`sa."userId" = '${userId}'`];
    
    if (platform && platform !== 'ALL') {
      whereClauses.push(`sa."platform" = '${platform}'`);
    }
    
    if (from) {
      whereClauses.push(`p."publishedAt" >= '${new Date(from as string).toISOString()}'`);
    }
    
    if (to) {
      // Pin to end of day if specific TO date requested
      const toDate = new Date(to as string);
      toDate.setHours(23, 59, 59, 999);
      whereClauses.push(`p."publishedAt" <= '${toDate.toISOString()}'`);
    }
    
    if (hashtag) {
      const sanitizedHash = (hashtag as string).replace(/'/g, "");
      whereClauses.push(`p."caption" ILIKE '%#${sanitizedHash.replace(/^#/, '')}%'`);
    }
    
    let rankSelect = '1 AS rank';
    let orderByClause = 'p."publishedAt" DESC';
    
    if (q) {
      const sanitizedQuery = (q as string).replace(/'/g, "");
      whereClauses.push(`p."captionTsv" @@ websearch_to_tsquery('english', '${sanitizedQuery}')`);
      rankSelect = `ts_rank(p."captionTsv", websearch_to_tsquery('english', '${sanitizedQuery}')) AS rank`;
      orderByClause = 'rank DESC, p."publishedAt" DESC';
    }
    
    const whereSql = whereClauses.join(' AND ');
    const skip = (Number(page) - 1) * Number(limit);
    
    // Explicit Raw execution bypassing ORM bounds mapping dynamic Postgres search indexes
    const rawSql = `
      SELECT 
        p.id, p.caption, p."mediaUrls", p."publishedAt", p.metrics, 
        sa.platform, sa."accountHandle",
        ${rankSelect}
      FROM "Post" p
      JOIN "SocialAccount" sa ON sa.id = p."socialAccountId"
      WHERE ${whereSql}
      ORDER BY ${orderByClause}
      LIMIT ${Number(limit)} OFFSET ${skip}
    `;

    const countSql = `
      SELECT COUNT(p.id) AS total
      FROM "Post" p
      JOIN "SocialAccount" sa ON sa.id = p."socialAccountId"
      WHERE ${whereSql}
    `;

    const [items, countResult]: any = await Promise.all([
      prisma.$queryRawUnsafe(rawSql),
      prisma.$queryRawUnsafe(countSql)
    ]);

    const total = Number(countResult[0]?.total || 0);

    res.json({
      items,
      total,
      page: Number(page),
      limit: Number(limit)
    });

  } catch (error: any) {
    console.error('[Search] Error mapping vector queries:', error);
    res.status(500).json({ error: 'Server error parsing vector queries' });
  }
});

export default router;
