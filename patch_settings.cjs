const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

mrData.settings = {
  "loading": "सेटिंग्ज लोड करत आहे…",
  "title": "सेटिंग्ज",
  "description": "तुमचे कनेक्शन, सुरक्षितता नियम, सूचना आणि कृती इतिहास व्यवस्थापित करा.",
  "saving": "सेव्ह करत आहे…",
  "tabs": {
    "connections": "कनेक्शन",
    "safety": "सुरक्षितता",
    "notifications": "सूचना",
    "auditLog": "ऑडिट लॉग"
  },
  "connections": {
    "disconnectConfirm": "@{{handle}} डिस्कनेक्ट करायचे? सर्व संबंधित डेटा काढला जाईल.",
    "noAccounts": "अद्याप कोणतीही खाती जोडलेली नाहीत.",
    "noAccountsHint": "सुरू करण्यासाठी खालील प्लॅटफॉर्म कनेक्ट करा.",
    "tokenExpired": "टोकन कालबाह्य झाले",
    "expires": "कालबाह्य होणार: {{date}}",
    "active": "सक्रिय",
    "disconnect": "डिस्कनेक्ट करा",
    "connectNewAccount": "नवीन खाते कनेक्ट करा",
    "connectApify": "सार्वजनिक प्रोफाइल कनेक्ट करा (Apify क्लाउड प्रॉक्सी)",
    "apifyHint": "वैयक्तिक प्रोफाइलवरील API ब्लॉक्स टाळण्यासाठी तुमची सार्वजनिक फेसबुक किंवा इंस्टाग्राम URL खाली पेस्ट करा. OAuth डेव्हलपर टोकनची आवश्यकता न ठेवता तुमची सार्वजनिक टाइमलाइन सुरक्षितपणे मिळवण्यासाठी आमचे बॅकएंड एंटरप्राइझ Apify प्रॉक्सी वापरेल.",
    "linking": "लिंक करत आहे...",
    "syncProxy": "प्रॉक्सी द्वारे सिंक करा"
  },
  "safety": {
    "pauseAll": "सर्व स्वयंचलित क्रिया थांबवा",
    "pauseHint": "प्रत्येक खात्यावरील सर्व एआय प्रत्युत्तरे आणि एंगेजमेंट पोस्ट त्वरित थांबवते.",
    "pauseWarning": "⛔ हे बंद करेपर्यंत सर्व स्वयंचलित क्रिया अवरोधित केल्या जातील.",
    "dailyCap": "दैनिक कृती मर्यादा",
    "actionGap": "किमान कृती अंतर",
    "blackoutStart": "ब्लॅकआउट सुरू (UTC तास)",
    "blackoutEnd": "ब्लॅकआउट समाप्त (UTC तास)",
    "saveSettings": "सुरक्षितता सेटिंग्ज सेव्ह करा"
  },
  "notifications": {
    "alertTypes": "अॅलर्ट प्रकार",
    "newComments": "💬 नवीन टिप्पण्या",
    "newMentions": "@ नवीन उल्लेखी",
    "newTags": "🏷️ नवीन टॅग",
    "digestFreq": "डायजेस्ट वारंवारता",
    "freqOpts": {
      "IMMEDIATE": "त्वरित",
      "HOURLY": "दर तासाला",
      "DAILY": "दररोज",
      "OFF": "बंद"
    },
    "digestEmail": "डायजेस्ट ईमेल",
    "savePrefs": "सूचना प्राधान्ये सेव्ह करा"
  },
  "audit": {
    "allAccounts": "सर्व खाती",
    "allActionTypes": "सर्व कृती प्रकार",
    "allOutcomes": "सर्व परिणाम",
    "clear": "✕ साफ करा",
    "tableHeaders": {
      "date": "तारीख",
      "account": "खाते",
      "action": "कृती",
      "targetId": "लक्ष्य आयडी",
      "outcome": "परिणाम"
    },
    "noEntries": "कोणत्याही ऑडिट नोंदी आढळल्या नाहीत.",
    "pagination": "पृष्ठ {{page}} दाखवत आहे (एकूण {{totalPages}} पैकी {{total}} नोंदी)",
    "prev": "← मागील",
    "next": "पुढील →"
  }
};

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json with settings');
