import axios from 'axios';
import { prisma } from '../db';
import { decryptToken } from '../utils/crypto';

import { scrapePublicComments } from './scraperService';

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface ExportResult {
  comments: Comment[];
  source: string;
}

export const fetchCommentsFromUrl = async (url: string, userId: string): Promise<ExportResult> => {
  const isInstagram = url.includes('instagram.com');
  const isFacebook = url.includes('facebook.com');

  if (!isInstagram && !isFacebook) {
    throw new Error('Unsupported URL. Please provide an Instagram or Facebook post link.');
  }

  try {
    // Attempt Official API First
    let comments: Comment[] = [];
    if (isInstagram) {
      comments = await fetchInstagramComments(url, userId);
    } else {
      comments = await fetchFacebookComments(url, userId);
    }
    return { comments, source: 'Official Graph API' };
  } catch (err: any) {
    console.info(`[exportService] Official API failed or skipped (${err.message}). Falling back to Public Scraper.`);
    // Fallback to our new public scraper
    return await scrapePublicComments(url);
  }
};

const fetchInstagramComments = async (url: string, userId: string): Promise<Comment[]> => {
  // 1. Extract shortcode
  // Patterns: /p/SHORTCODE/, /reels/SHORTCODE/, /tv/SHORTCODE/
  const match = url.match(/\/(?:p|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (!match) throw new Error('Could not parse Instagram shortcode from URL.');
  const shortcode = match[1];

  // 2. Get connected Instagram account
  const account = await prisma.socialAccount.findFirst({
    where: { userId, platform: 'INSTAGRAM' }
  });

  if (!account) throw new Error('No connected Instagram account found. Please connect one in Settings first.');
  const token = decryptToken(account.accessTokenEncrypted);

  // 3. Get the IG Business Account ID (usually needed to list media)
  // Note: We assume the connected account is the business account itself
  const handle = account.accountHandle; // This is the IG User ID we stored

  // 4. Find the media ID by shortcode
  // We fetch the last 50 media to find a match. 
  // If not found, we might need deeper pagination or the post is not owned by the user.
  const mediaResp = await axios.get(`https://graph.facebook.com/v19.0/${handle}/media?fields=shortcode,id&limit=50&access_token=${token}`);
  const media = mediaResp.data.data.find((m: any) => m.shortcode === shortcode);

  if (!media) {
    throw new Error('Post not found in your recent media. Note: This tool currently only works for posts on your own business account.');
  }

  // 5. Fetch comments
  let comments: Comment[] = [];
  let nextUrl = `https://graph.facebook.com/v19.0/${media.id}/comments?fields=from{username,id},text,timestamp&limit=50&access_token=${token}`;

  while (nextUrl) {
    const resp = await axios.get(nextUrl);
    const data = resp.data;
    
    if (data.data) {
      comments = [...comments, ...data.data.map((c: any) => ({
        id: c.id,
        username: c.from?.username || 'unknown',
        text: c.text,
        timestamp: c.timestamp
      }))];
    }
    
    nextUrl = data.paging?.next || null;
    // Limit to 500 for demo safety
    if (comments.length >= 500) break;
  }

  return comments;
};

const fetchFacebookComments = async (url: string, userId: string): Promise<Comment[]> => {
  let objectId: string | null = null;
  let targetUrl = url;

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
    throw new Error('Failed to decrypt Facebook access token. This usually happens if the security keys were recently changed. Please Disconnect and Reconnect Facebook in Settings.');
  }

  // 1. Resolve short URLs (like /share/p/) to their canonical form
  let resolvedUrl = url;
  if (url.includes('facebook.com/share/') || url.includes('fb.watch/')) {
    try {
      const res = await axios.get(url, { 
        maxRedirects: 5,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' },
        validateStatus: (s) => s < 400
      });
      resolvedUrl = res.request?.res?.responseUrl || res.request?.path || url;
      if (!resolvedUrl.startsWith('http')) resolvedUrl = 'https://www.facebook.com' + resolvedUrl;
    } catch (err) {
      console.warn('[Redirect Follow Failed]', err);
    }
  }

  // 2. Try Graph API resolution (Best for Page Posts)
  try {
    const urlResp = await axios.get(`https://graph.facebook.com/v19.0/`, {
      params: { id: resolvedUrl, fields: 'id', access_token: token }
    });
    objectId = urlResp.data.id;
  } catch (err) {
    // API lookup failed or no permission, fallback to regex on resolved URL
    const urlObj = new URL(resolvedUrl);
    if (urlObj.searchParams.has('story_fbid')) {
      objectId = urlObj.searchParams.get('story_fbid');
    } else if (urlObj.searchParams.has('fbid')) {
      objectId = urlObj.searchParams.get('fbid');
    } else {
      const paths = urlObj.pathname.split('/').filter(Boolean);
      // Modern FB IDs are usually after 'posts', 'reels', or the last segment
      const idx = paths.findIndex(p => ['posts', 'p', 'reels', 'videos', 'permalink'].includes(p));
      objectId = idx !== -1 && paths[idx + 1] ? paths[idx + 1] : paths[paths.length - 1];
    }
  }

  if (!objectId || objectId.includes('share')) {
     throw new Error('Could not extract a valid Post ID. This post might be private, from a personal profile, or require Page Public Content Access.');
  }

  // Fetch comments
  let comments: Comment[] = [];
  try {
    let nextUrl = `https://graph.facebook.com/v19.0/${objectId}/comments?fields=from{name,id},message,created_time&limit=50&access_token=${token}`;

    while (nextUrl) {
      const resp = await axios.get(nextUrl);
      const data = resp.data;
      
      if (data.data) {
        comments = [...comments, ...data.data.map((c: any) => ({
          id: c.id,
          username: c.from?.name || 'unknown',
          text: c.message,
          timestamp: c.created_time
        }))];
      }
      
      nextUrl = data.paging?.next || null;
      if (comments.length >= 500) break;
    }
  } catch (err: any) {
    const fbError = err.response?.data?.error?.message || err.message;
    console.error('[Facebook API Error]', fbError);
    throw new Error(`Facebook API Error: ${fbError}`);
  }

  return comments;
};
