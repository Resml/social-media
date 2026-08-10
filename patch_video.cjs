const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

mrData.videoTracker = {
  title: "व्हिडिओ प्रोडक्शन ट्रॅकर",
  subtitle: "सर्व व्हिडिओंचे नियोजन करा, चित्रित करा आणि ट्रॅक करा — चौकोनी स्वरूप, ६०-९० सेकंद",
  addVideo: "व्हिडिओ जोडा",
  guidelinesTitle: "व्हिडिओ मार्गदर्शक तत्त्वे (डॉक्युमेंटमधून)",
  noVideos: "अद्याप पाईपलाईनमध्ये कोणतेही व्हिडिओ नाहीत.",
  moveTo: "पुढील स्थितीत हलवा",
  documentSaysLandscape: "डॉक्युमेंट म्हणते: लँडस्केप स्वरूप टाळा!",
  form: {
    addTitle: "व्हिडिओ जोडा",
    titleLabel: "शीर्षक",
    categoryLabel: "श्रेणी",
    durationLabel: "कालावधी (सेकंद)",
    formatLabel: "स्वरूप",
    assigneeLabel: "नियुक्त व्यक्ती",
    scheduledDateLabel: "नियोजित तारीख",
    noteLabel: "टीप",
    cancel: "रद्द करा",
    submit: "व्हिडिओ जोडा"
  },
  formats: {
    square: "चौकोनी (शिफारस केलेले)",
    portrait: "पोर्ट्रेट",
    landscape: "लँडस्केप (टाळा)"
  },
  status: {
    idea: "कल्पना",
    filming: "चित्रीकरण",
    editing: "संपादन",
    published: "प्रकाशित"
  },
  categories: {
    "Development Work Update": "विकास कामाचे अपडेट",
    "Social Issue Commentary": "सामाजिक प्रश्नांवर भाष्य",
    "Cultural Institution Info": "सांस्कृतिक संस्थेची माहिती",
    "Current Events Commentary": "चालू घडामोडींवर भाष्य",
    "Leader Decision Welcome": "नेत्याच्या निर्णयाचे स्वागत",
    "Motivational Ad": "प्रेरणादायक जाहिरात",
    "Google Meet + FB Live Recap": "गुगल मीट + एफबी लाईव्ह रिकॅप",
    "Opposition Critique": "विरोधकांवर टीका",
    "Documentary (1–2 min)": "माहितीपट (१-२ मि.)",
    "General Campaign": "सामान्य मोहीम"
  },
  guidelines: {
    rule1: "कालावधी",
    detail1: "६०-९० सेकंद आदर्श. कमाल १८० सेकंद. कधीही ओलांडू नका.",
    rule2: "फक्त चौकोनी स्वरूप",
    detail2: "नेहमी चौकोनी (१:१) व्हिडिओ बनवा. लँडस्केप किंवा पोर्ट्रेट नाही.",
    rule3: "कंटेंट प्रकार",
    detail3: "सेवा अपडेट्स, सामाजिक प्रश्न, नेत्यांचे निर्णय, प्रेरणादायक, लाईव्ह रिकॅप्स.",
    rule4: "वारंवार लाईव्ह जा",
    detail4: "फेसबुक लाईव्हचा जास्तीत जास्त वापर करा — अल्गोरिदम याला जास्त प्राधान्य देते.",
    rule5: "माहितीपट जाहिराती",
    detail5: "तुमच्या कामाबद्दल १-२ मिनिटांचा माहितीपट — सेंद्रिय रीचसाठी उत्तम.",
    rule6: "कमेंट्री व्हिडिओ",
    detail6: "सामाजिक प्रश्नांवर वैयक्तिक भाष्य — विश्वास आणि संवाद वाढवते."
  },
  durationMsgs: {
    tooShort: "खूप लहान — ६०-९० सेकंदांचे लक्ष्य ठेवा",
    perfect: "योग्य लांबी — ६०-९० सेकंद",
    good: "छान — माहितीपटाची लांबी (१-२ मि.)",
    gettingLong: "लांब होत आहे — कमाल १८० सेकंद",
    tooLong: "खूप लांब! डॉक्युमेंट म्हणते: कमाल १८० सेकंद"
  },
  mockData: {
    v1: { title: "प्रभाग १२ रस्ते कामाची प्रगती", note: "८ हजार व्ह्यूज" },
    v2: { title: "पाणीटंचाईवर भाष्य", note: "" },
    v3: { title: "युवा सक्षमीकरण प्रेरणादायक", note: "" },
    v4: { title: "रुग्णालय विस्तार योजना", note: "ड्रोन फुटेज आवश्यक" }
  }
};

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json');
