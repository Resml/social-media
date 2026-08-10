const fs = require('fs');
const path = require('path');

const hindiTranslations = {
  "Ad Tracker Report": "विज्ञापन ट्रैकर रिपोर्ट",
  "Paid Campaigns Analytics": "सशुल्क अभियान विश्लेषण",
  "Date:": "दिनांक:",
  "Total Spent:": "कुल खर्च:",
  "en-US": "hi-IN",
  "Sr. No.": "क्र. सं.",
  "Month": "महीना",
  "Campaign": "अभियान",
  "Spend": "खर्च",
  "Reach": "रीच",
  "Clicks": "क्लिक्स",
  "Status": "स्थिति",
  "Active": "सक्रिय",
  "Ended": "समाप्त",
  "No data available": "कोई डेटा उपलब्ध नहीं",
  "Article Planner Report": "लेख प्लानर रिपोर्ट",
  "Daily & Weekly Articles": "दैनिक और साप्ताहिक लेख",
  "Total Articles:": "कुल लेख:",
  "Title": "शीर्षक",
  "Type": "प्रकार",
  "Writer": "लेखक",
  "Date": "दिनांक",
  "Published": "प्रकाशित",
  "Draft": "ड्राफ्ट",
  "Idea": "आइडिया",
  "Daily": "दैनिक",
  "Weekly": "साप्ताहिक",
  "en-GB": "hi-IN",
  "Normal": "सामान्य",
  "Excellent": "उत्कृष्ट",
  "Needs Impr.": "सुधार की जरूरत",
  "Good": "अच्छा",
  "Social Media Report": "सोशल मीडिया रिपोर्ट",
  "Analytics Report": "एनालिटिक्स रिपोर्ट",
  "Total Followers:": "कुल फॉलोअर्स:",
  "Followers": "फॉलोअर्स",
  "Reach (Views)": "रीच (Views)",
  "Engagement (Likes)": "एंगेजमेंट (Likes)",
  "Growth / Change": "वृद्धि / परिवर्तन",
  "Groups Manager Report": "ग्रुप मैनेजर रिपोर्ट",
  "FB & WA Groups": "फेसबुक और व्हाट्सएप ग्रुप",
  "Total Members:": "कुल सदस्य:",
  "Group Name": "ग्रुप का नाम",
  "Category": "श्रेणी",
  "Members": "सदस्य",
  "Admin": "एडमिन",
  "Inactive": "निष्क्रिय",
  "Live Tracker Report": "लाइव ट्रैकर रिपोर्ट",
  "Videos and Meetings": "वीडियो और मीटिंग्स",
  "Total Sessions:": "कुल सत्र:",
  "Platform": "प्लेटफ़ॉर्म",
  "Topic": "विषय",
  "Date & Time": "दिनांक और समय",
  "Duration": "अवधि",
  "Scheduled": "शेड्यूल किया गया",
  "Live": "लाइव",
  "Done": "पूरा हुआ",
  "Cancelled": "रद्द",
  "mins": "मिनट",
  "Network Builder Report": "नेटवर्क बिल्डर रिपोर्ट",
  "Contacts & Volunteers": "संपर्क और स्वयंसेवक",
  "Total Contacts:": "कुल संपर्क:",
  "Name": "नाम",
  "Location": "स्थान",
  "Interest": "रुचि",
  "Tag": "टैग",
  "Contact Info": "संपर्क जानकारी",
  "Poll Report": "पोल रिपोर्ट",
  "Public Opinion Polls": "जनमत सर्वेक्षण",
  "Total Polls:": "कुल पोल:",
  "Question": "प्रश्न",
  "Total Votes": "कुल वोट",
  "Closed": "बंद",
  "Content Library Report": "कंटेंट लाइब्रेरी रिपोर्ट",
  "Total Posts:": "कुल पोस्ट:",
  "Content": "कंटेंट",
  "Views": "दृश्यों",
  "Interactions": "इंटरैक्शन",
  "Profile Audit Report": "प्रोफ़ाइल ऑडिट रिपोर्ट",
  "Self Assessment & Analysis": "स्वयं मूल्यांकन और विश्लेषण",
  "Audit Score:": "ऑडिट स्कोर:",
  "Audit Section / Item": "ऑडिट अनुभाग / आइटम",
  "Pending": "लंबित",
  "Team Tasks Report": "टीम टास्क रिपोर्ट",
  "Task Assignment & Tracking": "कार्य असाइनमेंट और ट्रैकिंग",
  "Total Tasks:": "कुल कार्य:",
  "Assignee": "असाइन किया गया व्यक्ति",
  "Priority": "प्राथमिकता",
  "Due Date": "अंतिम तिथि",
  "High": "उच्च",
  "Medium": "मध्यम",
  "Low": "निम्न",
  "In Progress": "प्रगति पर",
  "To Do": "करना है",
  "Video Production Report": "वीडियो उत्पादन रिपोर्ट",
  "Video Pipeline Tracking": "वीडियो पाइपलाइन ट्रैकिंग",
  "Total Videos:": "कुल वीडियो:",
  "Editing": "संपादन",
  "Filming": "फिल्मांकन",
  "Square": "वर्गाकार",
  "Portrait": "पोर्ट्रेट",
  "Landscape": "लैंडस्केप",
  "Development Work Update": "विकास कार्य अपडेट",
  "Social Issue Commentary": "सामाजिक मुद्दे पर टिप्पणी",
  "Event/Festival Message": "कार्यक्रम/त्यौहार संदेश",
  "Opposition Critique": "विपक्ष की आलोचना",
  "Short Reel/Trend": "शॉर्ट रील/ट्रेंड",
  "Interview/Testimonial": "साक्षात्कार/प्रशंसापत्र",
  "Ward 12 Road Work Progress": "वार्ड 12 सड़क कार्य प्रगति",
  "Water scarcity commentary": "पानी की कमी पर टिप्पणी",
  "Youth empowerment motivational": "युवा सशक्तिकरण प्रेरक",
  "Hospital expansion plan": "अस्पताल विस्तार योजना"
};

const dir = path.join(__dirname, 'frontend/src/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('Report.tsx'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert isHindi
  if (!content.includes('const isHindi')) {
    content = content.replace(
      "const isMarathi = i18n.language.startsWith('mr');",
      "const isMarathi = i18n.language.startsWith('mr');\n  const isHindi = i18n.language.startsWith('hi');"
    );
  }

  // Replace ternary
  content = content.replace(/isMarathi \? '([^']+)' : '([^']+)'/g, (match, mr, en) => {
    const hi = hindiTranslations[en] || en;
    return `isMarathi ? '${mr}' : isHindi ? '${hi}' : '${en}'`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Patched', f);
});

console.log('Done!');
