const fs = require('fs');
const path = require('path');

const hiTranslations = {
  "postSearch": {
    "breadcrumbs": {
      "dashboard": "प्रोफेशनल डैशबोर्ड",
      "content": "कंटेंट"
    },
    "headerContent": "कंटेंट",
    "subtitle": "कंटेंट लाइब्रेरी",
    "tabs": {
      "published": "प्रकाशित",
      "scheduled": "शेड्यूल किया गया",
      "drafts": "ड्राफ्ट"
    },
    "reelsAlert": {
      "title": "फेसबुक पर आपके द्वारा पोस्ट किए गए वीडियो अब रील्स हैं",
      "desc": "आप अभी भी अपने पहले पोस्ट किए गए वीडियो देख सकते हैं, लेकिन वे रील्स फ़िल्टर के अंतर्गत संयोजित किए जाएंगे।"
    },
    "searchPlaceholder": "पोस्ट खोजें",
    "actions": {
      "create": "बनाएं"
    },
    "postsSelected": "पोस्ट चुने गए",
    "table": {
      "preview": "पूर्वावलोकन",
      "views": "दृश्यों",
      "viewers": "दर्शक",
      "interactions": "इंटरैक्शन",
      "netFollows": "नेट फॉलोअर्स",
      "impressions": "इंप्रेशन"
    },
    "analyzing": "विश्लेषण हो रहा है...",
    "noPosts": "कोई पोस्ट नहीं मिली",
    "noPostsTab": "कोई {{tab}} पोस्ट नहीं मिली",
    "noPostsHint": "पोस्ट देखने के लिए अपना खोज फ़िल्टर बदलें।"
  }
};

const mrTranslations = {
  "postSearch": {
    "breadcrumbs": {
      "dashboard": "प्रोफेशनल डॅशबोर्ड",
      "content": "कंटेंट"
    },
    "headerContent": "कंटेंट",
    "subtitle": "कंटेंट लायब्ररी",
    "tabs": {
      "published": "प्रकाशित",
      "scheduled": "नियोजित",
      "drafts": "मसुदा"
    },
    "reelsAlert": {
      "title": "फेसबुकवर तुम्ही पोस्ट केलेले व्हिडिओ आता रील्स आहेत",
      "desc": "तुम्ही अद्याप तुमचे पूर्वी पोस्ट केलेले व्हिडिओ पाहू शकता, परंतु ते रील्स फिल्टर अंतर्गत एकत्रित केले जातील."
    },
    "searchPlaceholder": "पोस्ट शोधा",
    "actions": {
      "create": "तयार करा"
    },
    "postsSelected": "पोस्ट निवडल्या",
    "table": {
      "preview": "पूर्वावलोकन",
      "views": "व्ह्यूज",
      "viewers": "प्रेक्षक",
      "interactions": "संवाद",
      "netFollows": "नेट फॉलोअर्स",
      "impressions": "इंप्रेशन्स"
    },
    "analyzing": "विश्लेषण करत आहे...",
    "noPosts": "कोणत्याही पोस्ट आढळल्या नाहीत",
    "noPostsTab": "कोणत्याही {{tab}} पोस्ट आढळल्या नाहीत",
    "noPostsHint": "पोस्ट पाहण्यासाठी तुमचा शोध फिल्टर बदला."
  }
};

function inject(langPath, dataToInject) {
  const p = path.join(__dirname, 'frontend/src/locales', langPath, 'translation.json');
  const json = JSON.parse(fs.readFileSync(p, 'utf8'));
  Object.assign(json, dataToInject);
  fs.writeFileSync(p, JSON.stringify(json, null, 2), 'utf8');
}

inject('hi', hiTranslations);
inject('mr', mrTranslations);

console.log('Successfully added postSearch to both Hindi and Marathi translations!');
