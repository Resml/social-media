const fs = require('fs');
const path = require('path');

// 1. Add translation keys to JSON files
const locales = {
  en: {
    title: "PSD Editor",
    schedulePost: "Schedule Post",
    exportPng: "Export PNG",
    exportPdf: "Export PDF",
    bulkGenerate: "Bulk Generate",
    properties: "Properties",
    layersTitle: "Layers",
    backgroundOptions: "Background Options",
    addBlankLayer: "Add Blank Layer",
    addImageLayer: "Add Image Layer",
    uploadPsdImage: "Upload PSD/Image",
    clearCache: "Clear Cache & Restart",
    brushSettings: "Brush Settings",
    eraserSettings: "Eraser Settings",
    size: "Size",
    color: "Color",
    opacity: "Opacity",
    blendMode: "Blend Mode",
    imageAdjustments: "Image Adjustments",
    brightness: "Brightness",
    contrast: "Contrast",
    blur: "Blur"
  },
  hi: {
    title: "पीएसडी संपादक (PSD Editor)",
    schedulePost: "पोस्ट शेड्यूल करें",
    exportPng: "PNG निर्यात करें",
    exportPdf: "PDF निर्यात करें",
    bulkGenerate: "थोक में बनाएं",
    properties: "गुण (Properties)",
    layersTitle: "परतें (Layers)",
    backgroundOptions: "पृष्ठभूमि विकल्प",
    addBlankLayer: "खाली परत जोड़ें",
    addImageLayer: "छवि परत जोड़ें",
    uploadPsdImage: "PSD/छवि अपलोड करें",
    clearCache: "कैश साफ़ करें और फिर से शुरू करें",
    brushSettings: "ब्रश सेटिंग्स",
    eraserSettings: "इरेज़र सेटिंग्स",
    size: "आकार",
    color: "रंग",
    opacity: "अपारदर्शिता",
    blendMode: "ब्लेंड मोड",
    imageAdjustments: "छवि समायोजन",
    brightness: "चमक",
    contrast: "कंट्रास्ट",
    blur: "धुंधलापन (Blur)"
  },
  mr: {
    title: "पीएसडी संपादक (PSD Editor)",
    schedulePost: "पोस्ट शेड्युल करा",
    exportPng: "PNG एक्सपोर्ट करा",
    exportPdf: "PDF एक्सपोर्ट करा",
    bulkGenerate: "मोठ्या प्रमाणात तयार करा",
    properties: "गुणधर्म (Properties)",
    layersTitle: "स्तर (Layers)",
    backgroundOptions: "पार्श्वभूमी पर्याय",
    addBlankLayer: "रिकामे स्तर जोडा",
    addImageLayer: "चित्र स्तर जोडा",
    uploadPsdImage: "PSD/चित्र अपलोड करा",
    clearCache: "कॅशे साफ करा आणि पुन्हा सुरू करा",
    brushSettings: "ब्रश सेटिंग्ज",
    eraserSettings: "इरेजर सेटिंग्ज",
    size: "आकार",
    color: "रंग",
    opacity: "अपारदर्शकता",
    blendMode: "ब्लेंड मोड",
    imageAdjustments: "चित्र समायोजन",
    brightness: "ब्राइटनेस",
    contrast: "कॉन्ट्रास्ट",
    blur: "अस्पष्टता (Blur)"
  }
};

for (const lang of ['en', 'hi', 'mr']) {
  const jsonPath = path.join(__dirname, 'src', 'locales', lang, 'translation.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    data.psdEditor = locales[lang];
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log("Updated " + lang + "/translation.json");
  }
}

// 2. Modify PSDEditor.tsx
const tsxPath = path.join(__dirname, 'src', 'pages', 'PSDEditor.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf-8');

// Add import if not exists
if (!tsx.includes("import { useTranslation } from 'react-i18next';")) {
  tsx = tsx.replace(
    "import { api } from '../api/axios';", 
    "import { api } from '../api/axios';\nimport { useTranslation } from 'react-i18next';"
  );
}

// Add hook
if (!tsx.includes("const { t } = useTranslation();")) {
  tsx = tsx.replace(
    "export const PSDEditor = () => {\n  const location = useLocation();", 
    "export const PSDEditor = () => {\n  const { t } = useTranslation();\n  const location = useLocation();"
  );
}

// Replace strings
const replacements = [
  ['PSD Editor</h1>', "{t('psdEditor.title', 'PSD Editor')}</h1>"],
  ['<Palette size={24} className="text-indigo-600" /> PSD Editor', '<Palette size={24} className="text-indigo-600" /> {t(\'psdEditor.title\', \'PSD Editor\')}'],
  ['<span className="hidden sm:inline">Schedule Post</span>', '<span className="hidden sm:inline">{t(\'psdEditor.schedulePost\', \'Schedule Post\')}</span>'],
  ['<span className="hidden sm:inline">Export PNG</span>', '<span className="hidden sm:inline">{t(\'psdEditor.exportPng\', \'Export PNG\')}</span>'],
  ['<span className="hidden sm:inline">Export PDF</span>', '<span className="hidden sm:inline">{t(\'psdEditor.exportPdf\', \'Export PDF\')}</span>'],
  ['<span className="hidden sm:inline">Bulk Generate</span>', '<span className="hidden sm:inline">{t(\'psdEditor.bulkGenerate\', \'Bulk Generate\')}</span>'],
  ['<span>Properties</span>', '<span>{t(\'psdEditor.properties\', \'Properties\')}</span>'],
  ['{activeTool === \'brush\' ? \'Brush Settings\' : \'Eraser Settings\'}', '{activeTool === \'brush\' ? t(\'psdEditor.brushSettings\', \'Brush Settings\') : t(\'psdEditor.eraserSettings\', \'Eraser Settings\')}'],
  ['>Size</label>', '>{t(\'psdEditor.size\', \'Size\')}</label>'],
  ['>Color</label>', '>{t(\'psdEditor.color\', \'Color\')}</label>'],
  ['>Opacity</label>', '>{t(\'psdEditor.opacity\', \'Opacity\')}</label>'],
  ['>Blend Mode</label>', '>{t(\'psdEditor.blendMode\', \'Blend Mode\')}</label>'],
  ['>Image Adjustments</div>', '>{t(\'psdEditor.imageAdjustments\', \'Image Adjustments\')}</div>'],
  ['>Brightness</label>', '>{t(\'psdEditor.brightness\', \'Brightness\')}</label>'],
  ['>Contrast</label>', '>{t(\'psdEditor.contrast\', \'Contrast\')}</label>'],
  ['>Blur</label>', '>{t(\'psdEditor.blur\', \'Blur\')}</label>'],
  ['<span>Layers</span>', '<span>{t(\'psdEditor.layersTitle\', \'Layers\')}</span>'],
  ['>Background Options</div>', '>{t(\'psdEditor.backgroundOptions\', \'Background Options\')}</div>'],
  ['<FolderOpen size={16} /> Upload PSD/Image', '<FolderOpen size={16} /> {t(\'psdEditor.uploadPsdImage\', \'Upload PSD/Image\')}'],
  ['<Trash2 size={16} /> Clear Cache & Restart', '<Trash2 size={16} /> {t(\'psdEditor.clearCache\', \'Clear Cache & Restart\')}'],
  ['<Plus size={16} /> Add Blank Layer', '<Plus size={16} /> {t(\'psdEditor.addBlankLayer\', \'Add Blank Layer\')}'],
  ['<ImageIcon size={16} /> Add Image Layer', '<ImageIcon size={16} /> {t(\'psdEditor.addImageLayer\', \'Add Image Layer\')}']
];

for (const [search, replace] of replacements) {
  tsx = tsx.replaceAll(search, replace);
}

fs.writeFileSync(tsxPath, tsx);
console.log("TSX patched");
