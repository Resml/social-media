const fs = require('fs');
const path = require('path');

const addKeys = (filePath, keysObj) => {
  if (!fs.existsSync(filePath)) return;
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.dashboard) data.dashboard = {};
  data.dashboard.report = keysObj;
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// EN
addKeys(path.join(__dirname, 'frontend/src/locales/en/translation.json'), {
  downloadPdf: "Download PDF Report",
  downloading: "Generating PDF...",
  monthlyPerformance: "Monthly Performance Report",
  generatedOn: "Generated on",
  overview: "Overview Statistics",
  growth: "Audience Growth",
  engagement: "Engagement Trends"
});

// MR
addKeys(path.join(__dirname, 'frontend/src/locales/mr/translation.json'), {
  downloadPdf: "पीडीएफ अहवाल डाउनलोड करा",
  downloading: "पीडीएफ तयार करत आहे...",
  monthlyPerformance: "मासिक कामगिरी अहवाल",
  generatedOn: "रोजी तयार केले",
  overview: "विहंगावलोकन आकडेवारी",
  growth: "प्रेक्षक वाढ",
  engagement: "प्रतिसाद ट्रेंड"
});

console.log('Successfully patched translations for PDF Report');
