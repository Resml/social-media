const fs = require('fs');
const path = require('path');

const locales = {
  en: {
    cancel: "Cancel",
    generateBanners: "Generate Banners",
    generating: "Generating...",
    addContentJob: "Add Content Job",
    selectTargetText: "Select Target Text Layers:",
    extractingLayers: "Extracting PSD Layers...",
    replace: "Replace",
    selectedLayer: "Selected Layer",
    layersPlain: "Layers"
  },
  hi: {
    cancel: "रद्द करें",
    generateBanners: "बैनर बनाएं",
    generating: "बनाया जा रहा है...",
    addContentJob: "सामग्री कार्य जोड़ें",
    selectTargetText: "लक्षित पाठ परतें चुनें:",
    extractingLayers: "PSD परतें निकाली जा रही हैं...",
    replace: "बदलें",
    selectedLayer: "चयनित परत",
    layersPlain: "परतें"
  },
  mr: {
    cancel: "रद्द करा",
    generateBanners: "बॅनर तयार करा",
    generating: "तयार होत आहे...",
    addContentJob: "सामग्री कार्य जोडा",
    selectTargetText: "लक्षित मजकूर स्तर निवडा:",
    extractingLayers: "PSD स्तर काढले जात आहेत...",
    replace: "बदला",
    selectedLayer: "निवडलेला स्तर",
    layersPlain: "स्तर"
  }
};

for (const lang of ['en', 'hi', 'mr']) {
  const jsonPath = path.join(__dirname, 'src', 'locales', lang, 'translation.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    // Merge new translations
    Object.assign(data.psdEditor, locales[lang]);
    
    // Also add sidebar translation for psdEditor
    if (!data.sidebar) data.sidebar = {};
    if (lang === 'en') data.sidebar.psdEditor = "PSD Editor";
    if (lang === 'hi') data.sidebar.psdEditor = "पीएसडी संपादक";
    if (lang === 'mr') data.sidebar.psdEditor = "पीएसडी संपादक";
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log("Updated " + lang);
  }
}

// 2. Modify PSDEditor.tsx for the remaining hardcoded strings
const tsxPath = path.join(__dirname, 'src', 'pages', 'PSDEditor.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf-8');

const replacements = [
  ['>Cancel</button>', '>{t(\'psdEditor.cancel\', \'Cancel\')}</button>'],
  ['> Generate Banners</>', '> {t(\'psdEditor.generateBanners\', \'Generate Banners\')}</>'],
  ['> Generating...</>', '> {t(\'psdEditor.generating\', \'Generating...\')}</>'],
  ['<Plus size={14} /> Add Content Job', '<Plus size={14} /> {t(\'psdEditor.addContentJob\', \'Add Content Job\')}'],
  ['>1. Select Target Text Layers:</label>', '>{t(\'psdEditor.selectTargetText\', \'Select Target Text Layers:\')}</label>'],
  ['>Extracting PSD Layers...</span>', '>{t(\'psdEditor.extractingLayers\', \'Extracting PSD Layers...\')}</span>'],
  ['<UploadCloud size={12} /> Replace', '<UploadCloud size={12} /> {t(\'psdEditor.replace\', \'Replace\')}'],
  ['|| \'Selected Layer\'}', '|| t(\'psdEditor.selectedLayer\', \'Selected Layer\')}'],
  ['<Layers size={18} color="var(--accent)" />\\n              Layers', '<Layers size={18} color="var(--accent)" />\\n              {t(\'psdEditor.layersPlain\', \'Layers\')}']
];

for (const [search, replace] of replacements) {
  tsx = tsx.replace(new RegExp(search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replace);
}

// Special replacement for the Layers plain text which is tricky due to whitespace
tsx = tsx.replace(/<Layers size=\{18\} color="var\(--accent\)" \/>\s*Layers/g, '<Layers size={18} color="var(--accent)" /> {t(\'psdEditor.layersPlain\', \'Layers\')}');

fs.writeFileSync(tsxPath, tsx);
console.log("TSX patched");
