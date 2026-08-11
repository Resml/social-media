const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'PSD-Editor', 'src', 'App.jsx');
const destPath = path.join(__dirname, 'src', 'pages', 'PSDEditor.tsx');

// 1. Restore file
let tsx = fs.readFileSync(srcPath, 'utf-8');

// 2. Apply patch.cjs logic (changing imports and adding schedule post)
tsx = tsx.replace("import './index.css';", "import './PSDEditor.css';");
tsx = tsx.replace("import './App.css';", "");
tsx = tsx.replace(
  "function App() {", 
  "export const PSDEditor = () => {"
);
tsx = tsx.replace("export default App;", "");

// Add missing imports
const importsToAdd = `
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useTranslation } from 'react-i18next';
`;
tsx = tsx.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';" + importsToAdd);

// Add hooks inside component
const hooksToAdd = `
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
`;
tsx = tsx.replace("export const PSDEditor = () => {", "export const PSDEditor = () => {" + hooksToAdd);

// Add useEffect for initial image
const effectToAdd = `
  useEffect(() => {
    if (location.state?.backgroundImageUrl) {
      const url = location.state.backgroundImageUrl;
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        setLayers([{
          id: 'base-image',
          uniqueId: 'base-image-' + Date.now(),
          type: 'image',
          name: 'Background Image',
          imageElement: img,
          x: 0,
          y: 0,
          opacity: 1,
          hidden: false,
          blendMode: 'source-over',
          locked: false
        }]);
      };
      img.src = url;
    }
  }, [location.state]);
`;
tsx = tsx.replace("const handleCanvasClick = (e) => {", effectToAdd + "\n  const handleCanvasClick = (e) => {");

// Add schedule post button
const schedulePostBtn = `
          <button onClick={async () => {
            if (!stageRef.current) return;
            const prevHover = hoveredLayerId;
            const prevSelect = selectedNodeId;
            setHoveredLayerId(null);
            setSelectedNodeId(null);
            
            setTimeout(async () => {
              const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
              setHoveredLayerId(prevHover);
              setSelectedNodeId(prevSelect);
              try {
                const res = await fetch(uri);
                const blob = await res.blob();
                const file = new File([blob], "edited-image.png", { type: "image/png" });
                const fd = new FormData();
                fd.append('media', file);
                const uploadRes = await api.post('/schedule/upload', fd);
                navigate('/schedule', { state: { preloadedMediaUrl: uploadRes.data.url } });
              } catch(err) {
                console.error('Failed to schedule image', err);
              }
            }, 100);
          }} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Zap size={16} /> <span className="hidden sm:inline">{t('psdEditor.schedulePost', 'Schedule Post')}</span>
          </button>
`;
tsx = tsx.replace(
  '<button onClick={handleExportPNG} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">',
  schedulePostBtn + '\n          <button onClick={handleExportPNG} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">'
);

// Add PDF export toast fix
tsx = tsx.replaceAll("alert('Exported PDF successfully');", "console.log('Exported PDF successfully');");

// 3. Apply translations (safely with replaceAll)
const tReplacements = [
  ['PSD Editor</h1>', "{t('psdEditor.title', 'PSD Editor')}</h1>"],
  ['<Palette size={24} className="text-indigo-600" /> PSD Editor', '<Palette size={24} className="text-indigo-600" /> {t(\'psdEditor.title\', \'PSD Editor\')}'],
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
  ['<ImageIcon size={16} /> Add Image Layer', '<ImageIcon size={16} /> {t(\'psdEditor.addImageLayer\', \'Add Image Layer\')}'],
  
  // From patch2
  ['>Cancel</button>', '>{t(\'psdEditor.cancel\', \'Cancel\')}</button>'],
  ['> Generate Banners</>', '> {t(\'psdEditor.generateBanners\', \'Generate Banners\')}</>'],
  ['> Generating...</>', '> {t(\'psdEditor.generating\', \'Generating...\')}</>'],
  ['<Plus size={14} /> Add Content Job', '<Plus size={14} /> {t(\'psdEditor.addContentJob\', \'Add Content Job\')}'],
  ['>1. Select Target Text Layers:</label>', '>{t(\'psdEditor.selectTargetText\', \'Select Target Text Layers:\')}</label>'],
  ['>Extracting PSD Layers...</span>', '>{t(\'psdEditor.extractingLayers\', \'Extracting PSD Layers...\')}</span>'],
  ['<UploadCloud size={12} /> Replace', '<UploadCloud size={12} /> {t(\'psdEditor.replace\', \'Replace\')}'],
  ['|| \'Selected Layer\'}', '|| t(\'psdEditor.selectedLayer\', \'Selected Layer\')}']
];

for (const [search, replace] of tReplacements) {
  tsx = tsx.replaceAll(search, replace);
}

// Special replacement for plain text "Layers"
tsx = tsx.replace(
  /<Layers size=\{18\} color="var\(--accent\)" \/>\s*Layers/g,
  '<Layers size={18} color="var(--accent)" /> {t(\'psdEditor.layersPlain\', \'Layers\')}'
);

fs.writeFileSync(destPath, tsx);
console.log("PSDEditor.tsx rebuilt successfully.");
