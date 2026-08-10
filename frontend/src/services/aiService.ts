import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export type ContentType = 'Speech' | 'Social Media Caption' | 'Press Release' | 'Letter/Notice' | 'Email' | 'Article';
export type ToneType = 'Formal' | 'Enthusiastic' | 'Professional' | 'Emotional' | 'Urgent' | 'Witty';
export type LanguageType = 'Marathi' | 'English' | 'Hindi';

export const AIService = {
  generateContent: async (
    topic: string,
    type: ContentType,
    tone: ToneType,
    language: LanguageType
  ): Promise<string> => {
    if (!API_KEY) {
      throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env");
    }

    try {
      // Using gemini-1.5-flash for fast and reliable content generation
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Act as a professional Social Media Content Strategist and Copywriter.
        
        Write a ${type} about: "${topic}".
        
        Tone: ${tone}
        Language: ${language}
        
        Requirements:
        - Keep it engaging, relevant, and impactful for the target audience.
        - Maintain cultural relevance based on the language and topic.
        - For Social Media Captions, include relevant emojis and hashtags.
        - For Speeches, include appropriate salutations and a structured flow.
        - For Letters/Notices, follow a formal structure if tone is Formal/Professional.
        - Return ONLY the generated content, no conversational filler or markdown markers like \`\`\`.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Clean up any potential markdown code block markers
      text = text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '');
      
      return text;

    } catch (error: any) {
      console.error("AI Generation Error:", error);
      
      // Fallback logic if API fails
      const isMarathi = language === 'Marathi';
      const isHindi = language === 'Hindi';

      if (type === 'Social Media Caption') {
        if (isMarathi) {
          return `📢 **महत्त्वाची घोषणा: ${topic}**\n\nआज '${topic}' संदर्भात महत्त्वपूर्ण माहिती शेअर करत आहोत. तुमच्या प्रतिसादाची वाट पाहत आहोत! 💪\n\n#SocialMedia #Update #Marathi #Content`;
        }
        if (isHindi) {
          return `📢 **महत्वपूर्ण अपडेट: ${topic}**\n\nआज हम '${topic}' के बारे में कुछ खास साझा कर रहे हैं। आपकी प्रतिक्रिया का इंतज़ार रहेगा! 💪\n\n#ContentUpdate #Hindi #SocialMedia`;
        }
        return `📢 **Update: ${topic}**\n\nSharing some important progress regarding '${topic}' today! We'd love to hear your thoughts. 💪\n\n#Update #ContentStrategy #Engagement`;
      }

      if (type === 'Speech') {
        if (isMarathi) {
          return `नमस्कार मित्रांनो आणि मान्यवरांनो,\n\nआज आपण एका अत्यंत महत्त्वाच्या विषयावर चर्चा करण्यासाठी येथे जमलो आहोत - '${topic}'.\n\nया विषयाचे गांभीर्य लक्षात घेता, आपण सर्वांनी मिळून यावर विचार करणे गरजेचे आहे. मला खात्री आहे की आपले सहकार्य नक्कीच मिळेल.\n\nधन्यवाद.\n- आपला स्नेही.`;
        }
        if (isHindi) {
          return `नमस्कार मित्रों और आदरणीय अतिथियों,\n\nआज हम एक बेहद महत्वपूर्ण विषय पर चर्चा करने के लिए यहाँ एकत्र हुए हैं - '${topic}'.\n\nइस विषय की गंभीरता को ध्यान में रखते हुए, हम सभी को मिलकर इस पर विचार करने की आवश्यकता है। मुझे विश्वास है कि आप सभी का सहयोग मिलेगा।\n\nधन्यवाद।`;
        }
        return `Hello everyone and respected guests,\n\nWe have gathered here today to talk about an important topic: '${topic}'.\n\nUnderstanding the importance of this, I believe we all need to work together for progress. I'm confident in our collective efforts.\n\nThank you.`;
      }

      return isMarathi 
        ? `विषय: ${topic}\n\nमहोदय/महोदया,\n\nआपल्या विनंतीनुसार, आम्ही '${topic}' या विषयावर अधिक माहिती लवकरच उपलब्ध करून देऊ. \n\nधन्यवाद.`
        : isHindi
        ? `विषय: ${topic}\n\nमहोदय/महोदया,\n\nआपके अनुरोध के अनुसार, हम जल्द ही '${topic}' विषय पर अधिक जानकारी उपलब्ध कराएंगे।\n\nधन्यवाद।`
        : `Subject: Update on ${topic}\n\nDear recipient,\n\nRegarding '${topic}', we are currently processing your request and will provide more details soon.\n\nBest regards.`;
    }
  },
  generateQuickComment: async (
    targetName: string,
    targetId: string,
    language: any
  ): Promise<string> => {
    if (!API_KEY) throw new Error("Gemini API Key is missing.");
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Act as a friendly social media user. Generate a short, engaging, and positive comment for a post by "${targetName}" (ID: ${targetId}). Language: ${language}. Requirements: Keep it under 20 words. Be supportive and genuine. Return ONLY the comment text.`;
      const result = await model.generateContent(prompt);
      return (await result.response).text().trim().replace(/^"|"$/g, '');
    } catch (error) {
      console.error("AI Quick Comment Error:", error);
      return language === 'Hindi' ? "बहुत बढ़िया पोस्ट!" : language === 'Marathi' ? "छान पोस्ट!" : "Great post!";
    }
  }
};
