import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { getHolidaysForYear } from './holidaysService';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const prisma = new PrismaClient();

/**
 * Placeholder function for AI generation.
 * This is where the OpenAI / Gemini API integration goes.
 */
async function generateHolidayPost(eventName: string): Promise<string> {
  // TODO: Add API key and call LLM API here.
  // const prompt = `Write an engaging, respectful social media post for ${eventName}. Include 2-3 relevant hashtags.`;
  // const response = await openai.chat.completions.create({ ... });
  
  return `Wishing everyone a very happy and prosperous ${eventName}! May this day bring joy, peace, and success to all. ✨🎉 #${eventName.replace(/\s+/g, '')} #Celebration`;
}

/**
 * Placeholder function for AI Image generation (e.g. DALL-E 3 / Midjourney API / Cloudinary template).
 */
async function generateHolidayImage(eventName: string, accountDetails: any): Promise<string> {
  // TODO: Add Image Generation API integration here.
  // 1. Analyze accountDetails (e.g. accountDetails.accountHandle, platform, logo if available)
  // 2. Pass this context along with eventName to an image generator (like OpenAI DALL-E)
  // const prompt = `Create a high quality social media festival greeting image for ${eventName}. Include subtle branding text for '@${accountDetails.accountHandle}'.`;
  // const response = await openai.images.generate({ prompt, ... });
  // const imageUrl = response.data[0].url;

  console.log(`[AI Image Gen] Generating image for ${eventName} tailored for @${accountDetails.accountHandle}...`);
  // Returning a placeholder image URL for now
  const imageUrl = `https://placehold.co/1080x1080/0f172a/ffffff.png?text=${encodeURIComponent(eventName + '\\n@' + accountDetails.accountHandle)}`;

  try {
    // Download and save locally because remote URLs (like DALL-E) expire
    const uploadDir = path.join(__dirname, '../../uploads/holidays');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${accountDetails.accountHandle}_${Date.now()}.png`;
    const filepath = path.join(uploadDir, filename);

    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`[AI Image Gen] Saved locally to ${filepath}`);
    return `/uploads/holidays/${filename}`;
  } catch (error) {
    console.error('[AI Image Gen] Failed to download image, returning direct URL fallback:', error);
    return imageUrl;
  }
}

export const startAutoScheduler = () => {
  // Run every day at 08:00 AM server time
  // cron.schedule('0 8 * * *', async () => { ... })
  
  // For development/testing, running it every minute or on boot is easier to verify,
  // but we'll set it to daily 08:00 AM as requested, and also execute once immediately for safety/testing if needed.
  cron.schedule('0 8 * * *', runAutoScheduler);
  
  console.log('🗓️  Auto-Scheduler Service initialized. Checking for holidays daily at 08:00 AM.');
};

export const runAutoScheduler = async () => {
  try {
    console.log('🔄 Running daily holiday auto-scheduler check...');
    
    // Calculate target date: Today + 3 Days
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);
    
    // Format target date to YYYY-MM-DD
    const targetDateStr = targetDate.toISOString().split('T')[0];
    const targetYear = targetDate.getFullYear();

    // Fetch holidays for the target year
    const holidays = getHolidaysForYear(targetYear);

    // Check if targetDate matches any holiday
    const matchingHoliday = holidays.find(h => h.fullDateStr === targetDateStr);

    if (!matchingHoliday) {
      console.log(`✅ No holidays found for target date (${targetDateStr}). Skipping.`);
      return;
    }

    console.log(`🎉 Upcoming Holiday Detected: ${matchingHoliday.name} on ${targetDateStr}. Generating posts...`);

    // Fetch all active social accounts
    const activeAccounts = await prisma.socialAccount.findMany();
    
    if (activeAccounts.length === 0) {
      console.log('⚠️ No active social media accounts found. Skipping post generation.');
      return;
    }

    // Generate content (AI Placeholder)
    const generatedContent = await generateHolidayPost(matchingHoliday.name);

    // Create scheduled posts for all accounts
    let createdCount = 0;
    for (const account of activeAccounts) {
      // Determine the scheduling time based on user settings, default to 07:00 AM
      const prefs = account.safetyPrefs as any;
      const holidayTime = prefs?.holidayPostTime || '07:00';
      const [hourStr, minStr] = holidayTime.split(':');
      
      const scheduledTime = new Date(targetDate);
      scheduledTime.setHours(parseInt(hourStr) || 7, parseInt(minStr) || 0, 0, 0);

      // Check if we already scheduled a post for this holiday to prevent duplicates
      // (Using a simple 24-hour window check around the scheduled time)
      const startOfDay = new Date(scheduledTime);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(scheduledTime);
      endOfDay.setHours(23,59,59,999);

      const existing = await prisma.scheduledPost.findFirst({
        where: {
          socialAccountId: account.id,
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay
          },
          content: {
            contains: matchingHoliday.name
          }
        }
      });

      if (!existing) {
        // Generate personalized image
        const generatedImageUrl = await generateHolidayImage(matchingHoliday.name, account);

        await prisma.scheduledPost.create({
          data: {
            socialAccountId: account.id,
            content: generatedContent,
            scheduledAt: scheduledTime,
            status: 'QUEUED',
            mediaUrls: [generatedImageUrl]
          }
        });
        createdCount++;
      }
    }

    console.log(`✅ Successfully queued ${createdCount} posts for ${matchingHoliday.name}.`);

  } catch (error) {
    console.error('❌ Error in auto-scheduler:', error);
  }
};
