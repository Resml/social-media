import axios from 'axios';
import { prisma } from '../db';
import { decryptToken } from '../utils/crypto';

export const postCommentToUrl = async (url: string, message: string, userId: string): Promise<{ id: string }> => {
  const isInstagram = url.includes('instagram.com');
  const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');

  if (!isInstagram && !isFacebook) {
    throw new Error('Unsupported URL. Please provide an Instagram or Facebook post link.');
  }

  if (isInstagram) {
    return postInstagramComment(url, message, userId);
  } else {
    return postFacebookComment(url, message, userId);
  }
};

const postInstagramComment = async (url: string, message: string, userId: string): Promise<{ id: string }> => {
  // 1. Extract shortcode
  const match = url.match(/\/(?:p|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (!match) throw new Error('Could not parse Instagram shortcode from URL.');
  const shortcode = match[1];

  // 2. Get connected Instagram account
  const account = await prisma.socialAccount.findFirst({
    where: { userId, platform: 'INSTAGRAM' }
  });

  if (!account) throw new Error('No connected Instagram account found. Please connect one in Settings first.');
  const token = decryptToken(account.accessTokenEncrypted);
  const handle = account.accountHandle; // IG User ID

  // 3. Find the media ID by shortcode
  const mediaResp = await axios.get(`https://graph.facebook.com/v19.0/${handle}/media?fields=shortcode,id&limit=50&access_token=${token}`);
  const media = mediaResp.data.data.find((m: any) => m.shortcode === shortcode);

  if (!media) {
    throw new Error('Post not found in your recent media. Note: Graph API only allows commenting on posts owned by your connected business account.');
  }

  // 4. Post comment
  try {
    const postResp = await axios.post(`https://graph.facebook.com/v19.0/${media.id}/comments`, {
      message,
      access_token: token
    });
    return { id: postResp.data.id };
  } catch (err: any) {
    const igError = err.response?.data?.error?.message || err.message;
    console.error('[IG Comment Error]', igError);
    throw new Error(`Instagram API Error: ${igError}`);
  }
};

const postFacebookComment = async (url: string, message: string, userId: string): Promise<{ id: string }> => {
  let objectId: string | null = null;
  let resolvedUrl = url;

  // Get connected Facebook account
  const account = await prisma.socialAccount.findFirst({
    where: { userId, platform: 'FACEBOOK' }
  });

  if (!account) throw new Error('No connected Facebook account found. Please connect Facebook in Settings first.');
  
  let token: string;
  try {
    token = decryptToken(account.accessTokenEncrypted);
    if (!token) throw new Error('Empty token after decryption.');
  } catch (err) {
    throw new Error('Failed to decrypt Facebook access token. Please Disconnect and Reconnect Facebook in Settings.');
  }

  // 1. Resolve short URLs to get true URL
  if (url.includes('facebook.com/share/') || url.includes('fb.watch/')) {
    try {
      const res = await axios.get(url, { 
        maxRedirects: 5,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36' },
        validateStatus: (s) => s < 400
      });
      resolvedUrl = res.request?.res?.responseUrl || res.request?.path || url;
      if (!resolvedUrl.startsWith('http')) resolvedUrl = 'https://www.facebook.com' + resolvedUrl;
    } catch (err) { }
  }

  // 2. Extract Object ID
  try {
    const urlResp = await axios.get(`https://graph.facebook.com/v19.0/`, {
      params: { id: resolvedUrl, fields: 'id', access_token: token }
    });
    objectId = urlResp.data.id;
  } catch (err) {
    const urlObj = new URL(resolvedUrl);
    if (urlObj.searchParams.has('story_fbid')) {
      objectId = urlObj.searchParams.get('story_fbid');
    } else if (urlObj.searchParams.has('fbid')) {
      objectId = urlObj.searchParams.get('fbid');
    } else {
      const paths = urlObj.pathname.split('/').filter(Boolean);
      const idx = paths.findIndex(p => ['posts', 'p', 'reels', 'videos', 'permalink'].includes(p));
      objectId = idx !== -1 && paths[idx + 1] ? paths[idx + 1] : paths[paths.length - 1];
    }
  }

  if (!objectId || objectId.includes('share')) {
     throw new Error('Could not extract a valid Post ID. The post might be private, or requires higher permissions.');
  }

  // 3. Post comment
  try {
    const postResp = await axios.post(`https://graph.facebook.com/v19.0/${objectId}/comments`, {
      message,
      access_token: token
    });
    return { id: postResp.data.id };
  } catch (err: any) {
    const fbError = err.response?.data?.error?.message || err.message;
    console.error('[Facebook API Comment Error]', fbError);
    throw new Error(`Facebook API Error: ${fbError}`);
  }
};
