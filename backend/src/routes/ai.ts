import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import OpenAI from 'openai';

const router = Router();
router.use(authMiddleware);

// Configures silently if the key is missing entirely, allowing graceful degradation
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

router.post('/suggest-reply', async (req: AuthRequest, res) => {
  const { inboxItemId, tone } = req.body;
  
  if (!inboxItemId || !tone) {
    return res.status(400).json({ error: 'Missing inboxItemId or tone definitions.' });
  }

  try {
    const item = await prisma.inboxItem.findUnique({
      where: { id: inboxItemId },
      include: { socialAccount: { select: { platform: true, accountHandle: true } } }
    });

    if (!item) return res.status(404).json({ error: 'Message context unavailable' });

    // Fallback Mock Payload if API Config runs null during testing phases
    if (!openai) {
      console.warn('[AI Service] OPENAI_API_KEY not defined. Generating internal fallback predictions.', tone);
      await new Promise(r => setTimeout(r, 1000));
      return res.json({
        suggestions: [
          `[${tone.toUpperCase()} Mock] Thanks for reaching out ${item.authorHandle}! We really appreciate the ${item.type.toLowerCase()}.`,
          `[${tone.toUpperCase()} Mock] Absolutely brilliant point. Let's touch base on this!`,
          `[${tone.toUpperCase()} Mock] Have you checked out our latest post regarding this?`
        ]
      });
    }

    const systemPrompt = `
      You are an automated social media manager managing the ${item.socialAccount.platform} account for ${item.socialAccount.accountHandle}.
      The user ${item.authorHandle} left the following ${item.type.toLowerCase()}: "${item.content}"
      
      Generate exactly 3 diverse replies matching the requested tone: ${tone}.
      Rules:
      1. Keep it strictly under 150 characters per reply.
      2. Keep it natural natively parsing internal context.
      3. Return ONLY a valid stringified JSON array wrapping exactly 3 distinct strings. No markdown wrapping.
      Format: ["reply 1", "reply 2", "reply 3"]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
      max_tokens: 150
    });

    const rawMsg = completion.choices[0].message?.content || '[]';
    let parsedArr = [];
    try {
      parsedArr = JSON.parse(rawMsg);
    } catch(e) {
      parsedArr = ["Thanks!", "Great catch, will consider.", "Interesting perspective!"];
    }

    res.json({ suggestions: parsedArr.slice(0,3) });

  } catch(err) {
    console.error('[AI Routing] OpenAI generation crash:', err);
    res.status(500).json({ error: 'Failed validating LLM outputs' });
  }
});

export default router;
