import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { getFacebookAuthUrl, getInstagramAuthUrl, getTwitterAuthUrl, handleFacebookCallback, handleInstagramCallback, handleTwitterCallback } from '../services/oauthService';

const router = Router();

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// ─── App Auth ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash }
    });

    res.json(generateTokens(user.id));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    res.json(generateTokens(user.id));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const secret = process.env.JWT_REFRESH_SECRET!;
    const payload = jwt.verify(refreshToken, secret) as { sub: string };

    res.json(generateTokens(payload.sub));
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// Accounts query
router.get('/accounts', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: req.userId },
      select: { id: true, platform: true, accountHandle: true, createdAt: true, tokenExpiresAt: true }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/social/:accountId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.socialAccount.deleteMany({
      where: { id: req.params.accountId, userId: req.userId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── OAuth Social Account Connection ─────────────────────────────────────────

// Generic helper to get base frontend URL
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Instagram
router.get('/instagram', authMiddleware, (req: AuthRequest, res) => {
  res.redirect(getInstagramAuthUrl(req.userId!));
});
router.get('/instagram/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    await handleInstagramCallback(code as string, decodeURIComponent(state as string));
    res.redirect(`${frontendUrl}/settings?social_success=instagram`);
  } catch (error) {
    res.redirect(`${frontendUrl}/settings?social_error=instagram`);
  }
});

// Twitter
router.get('/twitter', authMiddleware, (req: AuthRequest, res) => {
  res.redirect(getTwitterAuthUrl(req.userId!));
});
router.get('/twitter/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    await handleTwitterCallback(code as string, decodeURIComponent(state as string));
    res.redirect(`${frontendUrl}/settings?social_success=twitter`);
  } catch (error) {
    res.redirect(`${frontendUrl}/settings?social_error=twitter`);
  }
});

// Facebook
router.get('/facebook', authMiddleware, (req: AuthRequest, res) => {
  res.redirect(getFacebookAuthUrl(req.userId!));
});
router.get('/facebook/callback', async (req, res) => {
  const { code, state } = req.query;
  try {
    await handleFacebookCallback(code as string, decodeURIComponent(state as string));
    res.redirect(`${frontendUrl}/settings?social_success=facebook`);
  } catch (error: any) {
    console.error('[Facebook Auth Error]', error?.response?.data || error.message);
    res.redirect(`${frontendUrl}/settings?social_error=facebook`);
  }
});

export default router;
