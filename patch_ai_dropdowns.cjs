const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (!mrData.ai) mrData.ai = {};

mrData.ai.types = {
  "Social Media Caption": "कॅप्शन",
  "Speech": "भाषण",
  "Press Release": "प्रेस रिलीज",
  "Article": "लेख",
  "Letter/Notice": "पत्र/सूचना",
  "Email": "ईमेल"
};

mrData.ai.tones = {
  "Enthusiastic": "उत्साही",
  "Professional": "व्यावसायिक",
  "Formal": "औपचारिक",
  "Witty": "चतुर",
  "Emotional": "भावनिक",
  "Urgent": "तातडीचे"
};

mrData.ai.languages = {
  "English": "इंग्रजी",
  "Marathi": "मराठी",
  "Hindi": "हिंदी"
};

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json with AI Assistant dropdowns');
