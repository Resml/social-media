const fs = require('fs');
const path = require('path');

const hiTranslations = {
  "videoTracker": {
    "title": "वीडियो उत्पादन ट्रैकर",
    "subtitle": "सभी वीडियो की योजना बनाएं, शूट करें और ट्रैक करें — वर्गाकार प्रारूप, 60–90 सेकंड",
    "addVideo": "वीडियो जोड़ें",
    "guidelinesTitle": "वीडियो दिशानिर्देश (दस्तावेज़ से)",
    "noVideos": "अभी तक पाइपलाइन में कोई वीडियो नहीं है।",
    "documentSaysLandscape": "दस्तावेज़ कहता है: लैंडस्केप (आड़ा) प्रारूप से बचें!",
    "moveTo": "स्थानांतरित करें",
    "durationMsgs": {
      "tooShort": "बहुत छोटा — 60–90 सेकंड का लक्ष्य रखें",
      "perfect": "सही लंबाई — 60–90 सेकंड",
      "good": "अच्छा — डॉक्यूमेंट्री लंबाई (1–2 मिनट)",
      "gettingLong": "लंबा हो रहा है — अधिकतम 180 सेकंड है",
      "tooLong": "बहुत लंबा! दस्तावेज़ कहता है: अधिकतम 180 सेकंड"
    },
    "guidelines": {
      "rule1": "अवधि",
      "detail1": "60–90 सेकंड आदर्श है। अधिकतम 180 सेकंड। कभी अधिक न करें।",
      "rule2": "केवल वर्गाकार प्रारूप",
      "detail2": "हमेशा वर्गाकार (1:1) बनाएं",
      "rule3": "सामग्री के प्रकार",
      "detail3": "सेवा अद्यतन, सामाजिक मुद्दे, नेता के निर्णय, प्रेरक, लाइव रीकैप।",
      "rule4": "अक्सर लाइव जाएं",
      "detail4": "फेसबुक लाइव को अधिकतम करें — एल्गोरिदम इसे उच्च प्राथमिकता देता है।",
      "rule5": "डॉक्यूमेंट्री विज्ञापन",
      "detail5": "आपके काम के बारे में 1–2 मिनट की डॉक्यूमेंट्री — ऑर्गेनिक रीच के लिए बेहतरीन।",
      "rule6": "टिप्पणी वीडियो",
      "detail6": "व्यक्तिगत सामाजिक मुद्दे पर टिप्पणी — विश्वास और एंगेजमेंट बढ़ाती है।"
    },
    "status": {
      "idea": "आइडिया",
      "filming": "फिल्मांकन",
      "editing": "संपादन",
      "published": "प्रकाशित"
    },
    "formats": {
      "square": "वर्गाकार (अनुशंसित)",
      "portrait": "पोर्ट्रेट",
      "landscape": "लैंडस्केप (बचें)"
    },
    "categories": {
      "Development Work Update": "विकास कार्य अपडेट",
      "Social Issue Commentary": "सामाजिक मुद्दे पर टिप्पणी",
      "Event/Festival Message": "कार्यक्रम/त्यौहार संदेश",
      "Opposition Critique": "विपक्ष की आलोचना",
      "Short Reel/Trend": "शॉर्ट रील/ट्रेंड",
      "Interview/Testimonial": "साक्षात्कार/प्रशंसापत्र"
    },
    "form": {
      "addTitle": "वीडियो जोड़ें",
      "titleLabel": "शीर्षक",
      "titlePlaceholder": "वीडियो शीर्षक…",
      "categoryLabel": "श्रेणी",
      "durationLabel": "अवधि (सेकंड)",
      "formatLabel": "प्रारूप",
      "assigneeLabel": "असाइन किया गया व्यक्ति",
      "scheduledDateLabel": "निर्धारित तिथि",
      "noteLabel": "नोट",
      "notePlaceholder": "कोई नोट…",
      "cancel": "रद्द करें",
      "submit": "वीडियो जोड़ें"
    },
    "mockData": {
      "v1": {
        "title": "वार्ड 12 सड़क कार्य प्रगति",
        "note": "8k दृश्य"
      },
      "v2": {
        "title": "पानी की कमी पर टिप्पणी",
        "note": ""
      },
      "v3": {
        "title": "युवा सशक्तिकरण प्रेरक",
        "note": ""
      },
      "v4": {
        "title": "अस्पताल विस्तार योजना",
        "note": "ड्रोन फुटेज की जरूरत है"
      }
    }
  },
  "team": {
    "Satish Waghmare": "सतीश वाघमारे",
    "Sagar": "सागर",
    "Hemant": "हेमंत",
    "Harshal Vora": "हर्षल वोरा",
    "Dr. Amol Pawar": "डॉ. अमोल पवार"
  }
};

const mrTranslations = {
  "videoTracker": {
    "title": "व्हिडिओ निर्मिती ट्रॅकर",
    "subtitle": "सर्व व्हिडिओंची योजना करा, शूट करा आणि ट्रॅक करा — चौरस स्वरूप, 60–90 सेकंद",
    "addVideo": "व्हिडिओ जोडा",
    "guidelinesTitle": "व्हिडिओ मार्गदर्शक तत्त्वे (दस्तऐवजातून)",
    "noVideos": "अद्याप पाइपलाइनमध्ये कोणतेही व्हिडिओ नाहीत.",
    "documentSaysLandscape": "दस्तऐवज सांगतो: लँडस्केप (आडवा) स्वरूप टाळा!",
    "moveTo": "पुढे हलवा",
    "durationMsgs": {
      "tooShort": "खूप लहान — 60–90 सेकंदांचे लक्ष्य ठेवा",
      "perfect": "योग्य लांबी — 60–90 सेकंद",
      "good": "चांगले — माहितीपट लांबी (1–2 मिनिटे)",
      "gettingLong": "लांब होत आहे — कमाल 180 सेकंद आहे",
      "tooLong": "खूप लांब! दस्तऐवज सांगतो: कमाल 180 सेकंद"
    },
    "guidelines": {
      "rule1": "कालावधी",
      "detail1": "60–90 सेकंद आदर्श. कमाल 180 सेकंद. कधीही ओलांडू नका.",
      "rule2": "केवळ चौरस स्वरूप",
      "detail2": "नेहमी चौरस (1:1) बनवा",
      "rule3": "सामग्रीचे प्रकार",
      "detail3": "सेवा अद्यतने, सामाजिक समस्या, नेत्याचे निर्णय, प्रेरक, लाईव्ह रीकॅप.",
      "rule4": "अनेकदा लाईव्ह जा",
      "detail4": "फेसबुक लाईव्ह वाढवा — अल्गोरिदम याला उच्च प्राधान्य देतो.",
      "rule5": "डॉक्युमेंटरी जाहिराती",
      "detail5": "तुमच्या कामाबद्दल 1–2 मिनिटांची माहितीपट — सेंद्रिय पोहोचसाठी उत्तम.",
      "rule6": "भाष्य व्हिडिओ",
      "detail6": "वैयक्तिक सामाजिक समस्येवर भाष्य — विश्वास आणि संवाद वाढवते."
    },
    "status": {
      "idea": "कल्पना",
      "filming": "शूटिंग",
      "editing": "एडिटिंग",
      "published": "प्रकाशित"
    },
    "formats": {
      "square": "चौरस (शिफारस केलेले)",
      "portrait": "उभा",
      "landscape": "आडवा (टाळा)"
    },
    "categories": {
      "Development Work Update": "विकास कार्याचे अपडेट",
      "Social Issue Commentary": "सामाजिक विषयावर भाष्य",
      "Event/Festival Message": "कार्यक्रम/सण संदेश",
      "Opposition Critique": "विरोधकांवर टीका",
      "Short Reel/Trend": "शॉर्ट रील/ट्रेंड",
      "Interview/Testimonial": "मुलाखत/प्रतिक्रिया"
    },
    "form": {
      "addTitle": "व्हिडिओ जोडा",
      "titleLabel": "शीर्षक",
      "titlePlaceholder": "व्हिडिओ शीर्षक…",
      "categoryLabel": "वर्ग",
      "durationLabel": "कालावधी (सेकंद)",
      "formatLabel": "स्वरूप",
      "assigneeLabel": "नियुक्त व्यक्ती",
      "scheduledDateLabel": "नियोजित तारीख",
      "noteLabel": "नोंद",
      "notePlaceholder": "कोणत्याही नोंदी…",
      "cancel": "रद्द करा",
      "submit": "व्हिडिओ जोडा"
    },
    "mockData": {
      "v1": {
        "title": "प्रभाग 12 रस्ता काम प्रगती",
        "note": "8k व्ह्यूज"
      },
      "v2": {
        "title": "पाणी टंचाईवर भाष्य",
        "note": ""
      },
      "v3": {
        "title": "युवा सक्षमीकरण प्रेरणादायक",
        "note": ""
      },
      "v4": {
        "title": "रुग्णालय विस्तार योजना",
        "note": "ड्रोन फुटेज आवश्यक आहे"
      }
    }
  },
  "team": {
    "Satish Waghmare": "सतीश वाघमारे",
    "Sagar": "सागर",
    "Hemant": "हेमंत",
    "Harshal Vora": "हर्षल वोरा",
    "Dr. Amol Pawar": "डॉ. अमोल पवार"
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

console.log('Successfully added videoTracker and team to both Hindi and Marathi translations!');
