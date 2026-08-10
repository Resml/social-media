const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (!mrData.quickCommenter) mrData.quickCommenter = {};

mrData.quickCommenter.urlPlaceholder = 'येथे फेसबुक किंवा इंस्टाग्राम पोस्ट URL पेस्ट करा...';

mrData.quickCommenter.mockProfiles = {
  "1": { name: "राहुल शर्मा", post: "नुकताच एक उत्तम वर्कआउट संपवला!" },
  "2": { name: "अंजली पाटील", post: "मुंबईतील सुंदर सूर्यास्त." },
  "3": { name: "विक्रम सिंह", post: "नवीन प्रोजेक्ट लॉन्चसाठी उत्सुक आहे." },
  "4": { name: "स्नेहा गुप्ता", post: "आज रात्रीचे जेवण खूप छान होते." },
  "5": { name: "अमित वर्मा", post: "वीकेंड वाइब्स!" },
  "6": { name: "प्रिया रेड्डी", post: "पर्वतांवर भटकंती." },
  "7": { name: "संदीप के.", post: "टीमचे अभिनंदन!" },
  "8": { name: "मीरा दास", post: "बुक क्लबची मीटिंग मजेदार होती." },
  "9": { name: "रोहन मेहता", post: "नवीन कारची अलर्ट!" },
  "10": { name: "कविता अय्यर", post: "आज माझ्या मुलांना मराठी शिकवत आहे." }
};

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json with quickCommenter translations');
