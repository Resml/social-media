const fs = require('fs');
const path = require('path');

const tsxPath = path.join(__dirname, 'src', 'pages', 'PSDEditor.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf-8');

const replacements = [
  ['<span className="brand-name">Psdify</span>', '<span className="brand-name">{t(\'psdEditor.title\', \'Psdify\')}</span>'],
  ['<span className="hide-on-mobile">Export PNG</span>', '<span className="hide-on-mobile">{t(\'psdEditor.exportPng\', \'Export PNG\')}</span>'],
  ['<span className="hide-on-mobile">Export PDF</span>', '<span className="hide-on-mobile">{t(\'psdEditor.exportPdf\', \'Export PDF\')}</span>'],
  ['<span className="hide-on-mobile">Bulk Generate</span>', '<span className="hide-on-mobile">{t(\'psdEditor.bulkGenerate\', \'Bulk Generate\')}</span>'],
  ['<h3 style={{ color: \'var(--text-light)\', marginBottom: \'8px\' }}>Upload a PSD or Image</h3>', '<h3 style={{ color: \'var(--text-light)\', marginBottom: \'8px\' }}>{t(\'psdEditor.uploadPsdImage\', \'Upload a PSD or Image\')}</h3>'],
  ['<p>Supports .psd, .png, .jpg, .webp</p>', '<p>{t(\'psdEditor.supportsMsg\', \'Supports .psd, .png, .jpg, .webp\')}</p>'],
  ['<Plus size={12} /> Add new layer', '<Plus size={12} /> {t(\'psdEditor.addNewLayer\', \'Add new layer\')}'],
  ['>Text Properties</div>', '>{t(\'psdEditor.textProperties\', \'Text Properties\')}</div>'],
  ['<span>Bulk Banner Generation</span>', '<span>{t(\'psdEditor.bulkGenerate\', \'Bulk Banner Generation\')}</span>'],
  ['No text layers found in this PSD.', '{t(\'psdEditor.noTextLayers\', \'No text layers found in this PSD.\')}']
];

for (const [search, replace] of replacements) {
  tsx = tsx.replaceAll(search, replace);
}

// Add Schedule Post button
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
            }} className="topbar-action-btn" style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}>
              <Zap size={14} /> <span className="hide-on-mobile">{t('psdEditor.schedulePost', 'Schedule Post')}</span>
            </button>
`;

if (!tsx.includes('Failed to schedule image')) {
  tsx = tsx.replace(
    '            <button \n              className="topbar-action-btn"\n              onClick={handleExportPNG} \n            >',
    schedulePostBtn + '\n            <button \n              className="topbar-action-btn"\n              onClick={handleExportPNG} \n            >'
  );
}

fs.writeFileSync(tsxPath, tsx);
console.log("Successfully patched PSDEditor translations!");
