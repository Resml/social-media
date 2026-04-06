import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import { ScheduledPostStatus } from '@prisma/client';

const router = Router();
router.use(authMiddleware);

// Multer Storage configured perfectly handling native local storage logic for the development MVP
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    // Generate secure randomized strings securely appending authentic filename extensions natively
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded natively' });
  // Pass the locally accessible path back to map heavily onto frontend image attributes cleanly
  res.json({ url: `http://localhost:3001/uploads/${req.file.filename}` });
});

router.post('/', async (req: AuthRequest, res) => {
  const { socialAccountId, content, mediaUrls, scheduledAt, status } = req.body;
  if (!socialAccountId || !content || !scheduledAt) return res.status(400).json({ error: 'Missing defined variables' });

  try {
    const post = await prisma.scheduledPost.create({
      data: {
        socialAccountId,
        content,
        mediaUrls: mediaUrls || [],
        scheduledAt: new Date(scheduledAt),
        status: status || ScheduledPostStatus.QUEUED
      }
    });
    res.json(post);
  } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { content, mediaUrls, scheduledAt, status } = req.body;

  try {
    const data: any = {};
    if (content !== undefined) data.content = content;
    if (mediaUrls !== undefined) data.mediaUrls = mediaUrls;
    if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt);
    if (status !== undefined) data.status = status;

    const post = await prisma.scheduledPost.update({
      where: { id },
      data
    });
    res.json(post);
  } catch(err) { res.status(500).json({ error: 'Server error tracking Auto Saves' }); }
});

router.get('/', async (req: AuthRequest, res) => {
  try {
    const posts = await prisma.scheduledPost.findMany({
      where: { socialAccount: { userId: req.userId } },
      include: { socialAccount: { select: { platform: true, accountHandle: true } } },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json(posts);
  } catch(err) { res.status(500).json({ error: 'Server error mapping Scheduled payloads' }); }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.scheduledPost.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: 'Server error deleting post' }); }
});

export default router;
