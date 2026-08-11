const fs = require('fs');
const path = require('path');

const locales = {
  en: {
    "title": "Psdify",
    "uploadPsdImage": "Upload a PSD or Image",
    "supportsMsg": "Supports .psd, .png, .jpg, .webp",
    "addNewLayer": "Add new layer",
    "textProperties": "Text Properties",
    "noTextLayers": "No text layers found in this PSD."
  },
  hi: {
    "title": "Psdify",
    "uploadPsdImage": "PSD या छवि अपलोड करें",
    "supportsMsg": "समर्थित: .psd, .png, .jpg, .webp",
    "addNewLayer": "नई परत जोड़ें",
    "textProperties": "पाठ गुण",
    "noTextLayers": "इस PSD में कोई पाठ परत नहीं मिली।"
  },
  mr: {
    "title": "Psdify",
    "uploadPsdImage": "PSD किंवा प्रतिमा अपलोड करा",
    "supportsMsg": "समर्थित: .psd, .png, .jpg, .webp",
    "addNewLayer": "नवीन लेयर जोडा",
    "textProperties": "मजकूर गुणधर्म",
    "noTextLayers": "या PSD मध्ये कोणतीही मजकूर लेयर आढळली नाही."
  }
};

for (const lang of ['en', 'hi', 'mr']) {
  const filePath = path.join(__dirname, 'src', 'locales', lang, 'translation.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!data.psdEditor) data.psdEditor = {};
  
  Object.assign(data.psdEditor, locales[lang]);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

console.log('Translations updated successfully');
