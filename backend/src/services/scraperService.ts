import { Comment } from './exportService';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ApifyClient } from 'apify-client';
import * as dotenv from 'dotenv';
import path from 'path';

// Add stealth plugin to avoid basic bot detection
puppeteer.use(StealthPlugin());

export const scrapePublicComments = async (url: string): Promise<{ comments: Comment[], source: string }> => {
  // Force reload .env directly from the parent directory disk where the real .env file actually is.
  dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });
  
  const apifyToken = process.env.APIFY_API_TOKEN;
  
  if (apifyToken && apifyToken.trim() !== '') {
    console.info(`[Scraper API] Apify Token found! Routing request to Apify proxy network for production-grade scraping...`);
    try {
      const client = new ApifyClient({ token: apifyToken });
      
      if (url.includes('instagram.com')) {
        // Run standard Apify Instagram Comment Scraper Actor
        console.info(`[Scraper API: Apify] Running instagram-comment-scraper...`);
        const run = await client.actor("apify/instagram-comment-scraper").call({ directUrls: [url], limit: 1000 });
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        const mappedComments = items.map((i: any, idx) => ({
          id: i.id || `apify_ig_${Date.now()}_${idx}`,
          username: i.ownerUsername || i.username || 'AnonymousUser',
          text: i.text || '',
          timestamp: i.timestamp || new Date().toISOString()
        })).filter(c => c.text);
        
        return { comments: mappedComments, source: 'Apify Enterprise Scraper' };
        
      } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
        // Run standard Apify Facebook Comment Scraper Actor
        console.info(`[Scraper API: Apify] Running facebook-comments-scraper...`);
        const run = await client.actor("apify/facebook-comments-scraper").call({ startUrls: [{ url }], maxComments: 1000 });
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        const mappedComments = items.map((i: any, idx) => ({
          id: i.id || `apify_fb_${Date.now()}_${idx}`,
          username: i.profileName || i.name || 'AnonymousUser',
          text: i.text || i.message || '',
          timestamp: i.date || new Date().toISOString()
        })).filter(c => c.text);
        
        return { comments: mappedComments, source: 'Apify Enterprise Scraper' };
      }
    } catch (apifyError: any) {
      console.error(`[Scraper API: Apify Error]`, apifyError);
      throw new Error(`Apify Integration Failed: ${apifyError.message}`);
    }
  }

  console.info(`[Scraper API] Launching local Puppeteer fallback to scrape URL: ${url}`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // true to not block the server visualization
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-notifications']
    });

    const page = await browser.newPage();
    
    // Set a realistic viewport and user-agent
    await page.setViewport({ width: 1280, height: 800 });
    
    console.info(`[Scraper API] Navigating to ${url}...`);
    // Navigate and wait for the network to idle
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

    // Wait a few seconds for dynamic React elements to render
    await new Promise(r => setTimeout(r, 6000));

    console.info(`[Scraper API] Scrolling and loading hidden comments...`);
    // Scroll and click "View more comments" or "View previous comments" to load pagination
    for (let i = 0; i < 4; i++) {
      // Scroll down repeatedly
      await page.evaluate(() => {
         const win = (globalThis as any).window;
         const doc = (globalThis as any).document;
         win.scrollTo(0, doc.body.scrollHeight);
      });
      await new Promise(r => setTimeout(r, 1500));
      
      const clicked = await page.evaluate(() => {
         const doc = (globalThis as any).document;
         let clickedSomething = false;
         // Find all text blocks to see if they are a "load more" button
         const textBlocks = Array.from(doc.querySelectorAll('span[dir="auto"], div[dir="auto"]'));
         for (const block of textBlocks as any[]) {
            const txt = block.textContent?.toLowerCase().trim() || '';
            // Facebook buttons like "View 12 more comments", "View previous comments"
            if (txt.includes('view') && txt.includes('comments') && !txt.includes('hide')) {
               block.click();
               clickedSomething = true;
            }
         }
         return clickedSomething;
      });
      
      // If we found and clicked a button, wait for the spinner to finish and comments to load
      if (clicked) {
         console.info(`[Scraper API] Clicked a 'load comments' button. Waiting for data...`);
         await new Promise(r => setTimeout(r, 4000));
      } else {
         // Stop looping early if there's no more buttons
         break;
      }
    }
    
    console.info(`[Scraper API] Extracting DOM elements...`);
    const extractedComments = await page.evaluate(() => {
      const doc = (globalThis as any).document;
      const win = (globalThis as any).window;
      
      const results: { id: string, username: string, text: string, timestamp: string }[] = [];
      const isFacebook = win.location.hostname.includes('facebook') || win.location.hostname.includes('fb');
      
      let counter = 0;
      const seenTexts = new Set();
      
      const garbageUI = [
        'like', 'reply', 'share', 'follow', 'menu', 'more', 'log in', 'forgotten account?', 
        'create new account', 'most relevant', 'top comments', 'write a comment', 'see more', 
        'comments', 'shares', 'hide', 'report', 'view previous', 'all comments', 'sends',
        'sign up', 'not now', 'forgot password?'
      ];

      if (isFacebook) {
        // Find adjacent text nodes. Since FB wildly obfuscates class names, we search for dir="auto"
        const potentialBlocks = Array.from(doc.querySelectorAll('div[dir="auto"], span[dir="auto"]'));
        
        let lastUsername = 'AnonymousFB_User';

        for (const block of potentialBlocks as any[]) {
           const text = block.textContent?.trim();
           if (!text || text.length < 2 || seenTexts.has(text)) continue;
           
           const textLower = text.toLowerCase();
           // Aggressive filter against Facebook UI elements
           if (garbageUI.some(garbage => textLower.includes(garbage)) || textLower.match(/^[0-9]+ (comments|shares|views)$/)) {
             continue;
           }
           
           // Heuristic: If it's a short text (2-25 chars) without ending punctuation, it's likely the username.
           if (text.length <= 30 && !text.match(/[.!?]$/)) {
             // Treat it as a potential author name for the *next* comment text
             lastUsername = text;
             continue;
           }
           
           // Otherwise, it's a comment body!
           seenTexts.add(text);
           results.push({
               id: `scraped_fb_${Date.now()}_${counter++}`,
               username: lastUsername.replace(/ /g, '_'),
               text: text,
               timestamp: new Date().toISOString()
           });
           
           // Reset username after consuming
           lastUsername = 'AnonymousFB_User';
        }
      } else {
        // Instagram fallback logic
        const spans = Array.from(doc.querySelectorAll('span'));
        
        for (const span of spans as any[]) {
          const text = span.textContent?.trim();
          if (text && text.length > 5 && !seenTexts.has(text)) {
            if (garbageUI.some(g => text.toLowerCase().includes(g))) continue;
            seenTexts.add(text);
            results.push({
               id: `scraped_ig_${Date.now()}_${counter++}`,
               username: 'AnonymousIG_User',
               text: text,
               timestamp: new Date().toISOString()
            });
          }
        }
      }
      
      return results;
    });

    console.info(`[Scraper API] Successfully extracted ${extractedComments.length} text fragments.`);
    
    return {
      comments: extractedComments,
      source: 'Puppeteer Headless Browser'
    };
    
  } catch (error: any) {
    console.error('[Scraper API Error]', error.message);
    throw new Error('Puppeteer Scraper failed. URL may be entirely blocked behind login wall: ' + error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
