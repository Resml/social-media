import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);

// ─── GET all settings for the current user ────────────────────────────────────
router.get('/', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        globalSafetyPause: true,
        socialAccounts: {
          select: {
            id: true,
            platform: true,
            accountHandle: true,
            tokenExpiresAt: true,
            notificationPrefs: true,
            safetyPrefs: true,
            createdAt: true,
          },
        },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// ─── PUT /settings/safety ─────────────────────────────────────────────────────
// Body: { globalSafetyPause?: boolean, accounts?: [{ id, safetyPrefs }] }
router.put('/safety', async (req: AuthRequest, res) => {
  const { globalSafetyPause, accounts } = req.body;
  try {
    // Update global pause flag on the user
    if (typeof globalSafetyPause === 'boolean') {
      await prisma.user.update({
        where: { id: req.userId },
        data: { globalSafetyPause },
      });
    }

    // Update per-account safety prefs
    if (Array.isArray(accounts)) {
      for (const { id, safetyPrefs } of accounts) {
        // Verify account belongs to this user
        const account = await prisma.socialAccount.findFirst({
          where: { id, userId: req.userId },
        });
        if (!account) continue;

        await prisma.socialAccount.update({
          where: { id },
          data: { safetyPrefs },
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save safety settings' });
  }
});

// ─── PUT /settings/notifications ─────────────────────────────────────────────
// Body: { accounts: [{ id, notificationPrefs }] }
router.put('/notifications', async (req: AuthRequest, res) => {
  const { accounts } = req.body;
  if (!Array.isArray(accounts)) return res.status(400).json({ error: 'accounts array required' });

  try {
    for (const { id, notificationPrefs } of accounts) {
      const account = await prisma.socialAccount.findFirst({
        where: { id, userId: req.userId },
      });
      if (!account) continue;

      await prisma.socialAccount.update({
        where: { id },
        data: { notificationPrefs },
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save notification preferences' });
  }
});

// ─── DELETE /settings/accounts/:id ───────────────────────────────────────────
router.delete('/accounts/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const account = await prisma.socialAccount.findFirst({
      where: { id, userId: req.userId },
    });
    if (!account) return res.status(404).json({ error: 'Account not found' });

    await prisma.socialAccount.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

// ─── POST /settings/accounts/manual ──────────────────────────────────────────
router.post('/accounts/manual', async (req: AuthRequest, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const platform = url.toLowerCase().includes('instagram') ? 'INSTAGRAM' : 'FACEBOOK';
    const userId = req.userId!;

    await prisma.socialAccount.upsert({
      where: {
        userId_platform_accountHandle: {
          userId,
          platform,
          accountHandle: url,
        }
      },
      update: {
        accessTokenEncrypted: '', // Empty token flags it for Apify scraping
      },
      create: {
        userId,
        platform,
        accountHandle: url,
        accessTokenEncrypted: '',
        notificationPrefs: {},
        safetyPrefs: {}
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save manual account' });
  }
});

export default router;
