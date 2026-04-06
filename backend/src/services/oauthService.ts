import axios from 'axios';
import { prisma } from '../db';
import { encryptToken } from '../utils/crypto';
import jwt from 'jsonwebtoken';

// In a real production app, use actual PKCE generated cryptographically and store verifier in session.
// For demonstration and to meet constraints simply, we will use 'plain' mode or a static challenge if Twitter allows,
// or we can store it in a Redis cache temporarily. To avoid extra dependencies here, we'll generate a JWT token 
// embedding the code_verifier, and send it as the state parameter!

const getAppUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── INSTAGRAM ─────────────────────────────────────────────────────────────
export function getInstagramAuthUrl(userId: string): string {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  const state = encodeURIComponent(userId);
  const scope = 'instagram_basic,instagram_manage_comments,instagram_content_publish,pages_read_engagement';
  return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
}

export async function handleInstagramCallback(code: string, userId: string) {
  const response = await axios.post('https://api.instagram.com/oauth/access_token', {
    client_id: process.env.INSTAGRAM_CLIENT_ID,
    client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
    code,
  }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

  const { access_token, user_id } = response.data; // Note: long-lived token endpoint usually needed
  
  await prisma.socialAccount.upsert({
    where: {
      userId_platform_accountHandle: {
        userId,
        platform: 'INSTAGRAM',
        accountHandle: user_id.toString(),
      }
    },
    update: {
      accessTokenEncrypted: encryptToken(access_token),
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Approximate 60 days
    },
    create: {
      userId,
      platform: 'INSTAGRAM',
      accountHandle: user_id.toString(),
      accessTokenEncrypted: encryptToken(access_token),
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    }
  });
}

// ─── TWITTER ───────────────────────────────────────────────────────────────
export function getTwitterAuthUrl(userId: string): string {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;
  const state = encodeURIComponent(userId);
  const scope = 'tweet.read tweet.write users.read offline.access';
  // Note: static challenge used here. Real-world uses dynamic PKCE + session state.
  return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
}

export async function handleTwitterCallback(code: string, userId: string) {
  const authHeader = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');
  
  const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
    code,
    grant_type: 'authorization_code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: process.env.TWITTER_REDIRECT_URI,
    code_verifier: 'challenge',
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authHeader}`
    }
  });

  const { access_token, refresh_token, expires_in } = response.data;
  
  // We need to fetch the user's Twitter handle for display (users.read scope)
  const userResp = await axios.get('https://api.twitter.com/2/users/me', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  const handle = userResp.data.data.username;

  await prisma.socialAccount.upsert({
    where: {
      userId_platform_accountHandle: {
        userId,
        platform: 'TWITTER',
        accountHandle: handle,
      }
    },
    update: {
      accessTokenEncrypted: encryptToken(access_token),
      refreshTokenEncrypted: refresh_token ? encryptToken(refresh_token) : undefined,
      tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
    },
    create: {
      userId,
      platform: 'TWITTER',
      accountHandle: handle,
      accessTokenEncrypted: encryptToken(access_token),
      refreshTokenEncrypted: refresh_token ? encryptToken(refresh_token) : undefined,
      tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
    }
  });
}

// ─── FACEBOOK ──────────────────────────────────────────────────────────────
export function getFacebookAuthUrl(userId: string): string {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
  const state = encodeURIComponent(userId);
  const scope = 'public_profile,pages_show_list,pages_read_engagement';
  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
}

export async function handleFacebookCallback(code: string, userId: string) {
  const response = await axios.get('https://graph.facebook.com/v25.0/oauth/access_token', {
    params: {
      client_id: process.env.FACEBOOK_CLIENT_ID,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET,
      code,
    }
  });

  const { access_token, expires_in } = response.data;
  
  // Try to upgrade to a Business Page token since Meta blocks personal profile reads
  let finalToken = access_token;
  let pageName = userId; // fallback tracking
  try {
    const accountsResp = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token }
    });
    // If the user owns a Page, grab the first Page Access Token automatically
    if (accountsResp.data.data && accountsResp.data.data.length > 0) {
      finalToken = accountsResp.data.data[0].access_token;
      pageName = accountsResp.data.data[0].name;
      console.log(`[OAuth] Successfully upgraded to Meta Page Token for: ${pageName}`);
    } else {
      // Fallback
      const meResp = await axios.get('https://graph.facebook.com/v19.0/me?fields=name', {
        params: { access_token }
      });
      pageName = meResp.data.name;
    }
  } catch (err) {
    console.warn(`[OAuth] Could not fetch page tokens, maintaining user token.`);
  }

  await prisma.socialAccount.upsert({
    where: {
      userId_platform_accountHandle: {
        userId,
        platform: 'FACEBOOK',
        accountHandle: pageName,
      }
    },
    update: {
      accessTokenEncrypted: encryptToken(finalToken),
      tokenExpiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
    },
    create: {
      userId,
      platform: 'FACEBOOK',
      accountHandle: pageName,
      accessTokenEncrypted: encryptToken(access_token),
      tokenExpiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
    }
  });
}
