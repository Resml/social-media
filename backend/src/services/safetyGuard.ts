import { prisma } from '../db';
import crypto from 'crypto';
import { ActionType } from '@prisma/client';

interface SafetyPrefs {
  dailyCap: number;
  gapSeconds: number;
  blackoutStart: number; // UTC hour 0-23
  blackoutEnd: number;   // UTC hour 0-23
}

interface NotificationPrefs {
  frequency: string;
  email?: string;
  notifyComments?: boolean;
  notifyMentions?: boolean;
  notifyTags?: boolean;
}

export const safetyGuard = {
  checkActionValid: async (
    socialAccountId: string,
    _actionType: ActionType,
    contentText: string
  ): Promise<{ valid: boolean; reason?: string; hash?: string }> => {
    const now = new Date();
    const contentHash = crypto
      .createHash('sha256')
      .update(contentText.trim().toLowerCase())
      .digest('hex');

    // Load account with user (for global pause) and safetyPrefs
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
      include: { user: { select: { globalSafetyPause: true } } },
    });

    if (!account) {
      return { valid: false, reason: 'Social account not found.' };
    }

    // Rule 0: Global kill switch
    if (account.user.globalSafetyPause) {
      return { valid: false, reason: 'All automated actions are currently paused globally.' };
    }

    // Parse per-account prefs (fall back to safe defaults)
    const prefs = (account.safetyPrefs as SafetyPrefs) ?? {
      dailyCap: 15,
      gapSeconds: 60,
      blackoutStart: 0,
      blackoutEnd: 6,
    };

    // Rule 4: Blackout hours (UTC)
    const utcHour = now.getUTCHours();
    const { blackoutStart, blackoutEnd } = prefs;
    const inBlackout =
      blackoutStart < blackoutEnd
        ? utcHour >= blackoutStart && utcHour < blackoutEnd
        : utcHour >= blackoutStart || utcHour < blackoutEnd; // handles overnight ranges

    if (inBlackout) {
      return {
        valid: false,
        reason: `Blackout hours (${blackoutStart}:00–${blackoutEnd}:00 UTC) restrict engagements.`,
      };
    }

    // Fetch recent action logs for this account (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActions = await prisma.actionLog.findMany({
      where: {
        socialAccountId,
        executedAt: { gte: sevenDaysAgo },
      },
      orderBy: { executedAt: 'desc' },
    });

    // Rule 1: Daily action cap (configurable per account)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaysActions = recentActions.filter((a) => a.executedAt >= todayStart);
    if (todaysActions.length >= prefs.dailyCap) {
      return {
        valid: false,
        reason: `Daily interaction limit (${prefs.dailyCap} max) reached for this account.`,
      };
    }

    // Rule 2: Minimum time gap between actions (configurable)
    if (recentActions.length > 0) {
      const msSinceLast = now.getTime() - recentActions[0].executedAt.getTime();
      if (msSinceLast < prefs.gapSeconds * 1000) {
        const remaining = Math.ceil((prefs.gapSeconds * 1000 - msSinceLast) / 1000);
        return {
          valid: false,
          reason: `Please wait ${remaining}s before the next action (min gap: ${prefs.gapSeconds}s).`,
        };
      }
    }

    // Rule 3: Duplicate content check (SHA-256, last 7 days)
    const hasDuplicate = recentActions.some((a) => a.contentHash === contentHash);
    if (hasDuplicate) {
      return {
        valid: false,
        reason: 'Identical phrasing was already used within the last 7 days.',
      };
    }

    // Rule 5: Burst prevention (max 3 actions in 5 minutes)
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const burstCount = recentActions.filter((a) => a.executedAt >= fiveMinAgo).length;
    if (burstCount >= 3) {
      return {
        valid: false,
        reason: 'Cooldown active: maximum 3 engagements per 5 minutes.',
      };
    }

    return { valid: true, hash: contentHash };
  },
};
