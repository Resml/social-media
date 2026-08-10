const fs = require('fs');
const path = require('path');

const hiData = {
  "session1": {
    "topic": "वार्ड विकास प्रगति अपडेट",
    "notes": "अच्छी उपस्थिति"
  },
  "session2": {
    "topic": "जल संकट: खुली चर्चा"
  },
  "session3": {
    "topic": "सामाजिक सांस्कृतिक कार्यक्रम की झलकियाँ"
  },
  "session4": {
    "topic": "सड़क कार्य निरीक्षण लाइव",
    "notes": "ग्रुप में शेयर किया गया"
  }
};

const mrData = {
  "session1": {
    "topic": "प्रभाग विकास प्रगती अपडेट",
    "notes": "चांगली उपस्थिती"
  },
  "session2": {
    "topic": "पाणी टंचाई: खुली चर्चा"
  },
  "session3": {
    "topic": "सामाजिक सांस्कृतिक कार्यक्रमाची ठळक वैशिष्ट्ये"
  },
  "session4": {
    "topic": "रस्ता काम पाहणी लाईव्ह",
    "notes": "गटात सामायिक केले"
  }
};

function patch(lang, data) {
  const p = path.join(__dirname, 'frontend/src/locales', lang, 'translation.json');
  const json = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  if (!json.liveTracker) json.liveTracker = {};
  if (!json.liveTracker.mockData) json.liveTracker.mockData = {};
  
  Object.assign(json.liveTracker.mockData, data);
  
  // also add missing statuses if they use lower case keys sometimes
  json.liveTracker.status = {
    ...json.liveTracker.status,
    "scheduled": json.liveTracker.status?.SCHEDULED || (lang === 'hi' ? "शेड्यूल किया गया" : "नियोजित"),
    "live": json.liveTracker.status?.LIVE || (lang === 'hi' ? "लाइव" : "लाईव्ह"),
    "done": json.liveTracker.status?.DONE || (lang === 'hi' ? "पूरा हुआ" : "पूर्ण"),
    "cancelled": json.liveTracker.status?.CANCELLED || (lang === 'hi' ? "रद्द" : "रद्द")
  };
  
  fs.writeFileSync(p, JSON.stringify(json, null, 2), 'utf8');
}

patch('hi', hiData);
patch('mr', mrData);
console.log('Patched LiveTracker mockData keys!');
