const fs = require('fs');
const path = require('path');

const psdRepo = path.join(__dirname, '..', 'PSD-Editor');
const targetPages = path.join(__dirname, 'src', 'pages');

// Read source files
let appJsx = fs.readFileSync(path.join(psdRepo, 'src', 'App.jsx'), 'utf-8');
const appCss = fs.readFileSync(path.join(psdRepo, 'src', 'App.css'), 'utf-8');
const indexCss = fs.readFileSync(path.join(psdRepo, 'src', 'index.css'), 'utf-8');

// Combine CSS
const combinedCss = `
/* PSD Editor Scoped Styles */
.psd-editor-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

${indexCss}
${appCss}
`;

fs.writeFileSync(path.join(targetPages, 'PSDEditor.css'), combinedCss);

// Transform JSX
// Remove import './index.css'; and import './App.css';
appJsx = appJsx.replace(/import '\.\/index\.css';/g, "import './PSDEditor.css';");
appJsx = appJsx.replace(/import '\.\/App\.css';/g, "");
appJsx = appJsx.replace(/<div className="app-container">/g, '<div className="app-container psd-editor-container">');

const topbarRegex = /<div className="topbar">[\s\S]*?<\/div>\s*<\/div>/;
const newHeader = `
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Palette size={24} className="text-indigo-600" /> PSD Editor
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={handleExportPNG} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <Download size={16} /> <span className="hidden sm:inline">Export PNG</span>
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            <FileText size={16} /> <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Zap size={16} /> <span className="hidden sm:inline">Bulk Generate</span>
          </button>
        </div>
      </div>
`;

appJsx = appJsx.replace(topbarRegex, newHeader);

// Rename function App to export const PSDEditor = () => {
appJsx = appJsx.replace(/function App\(\) \{/g, 'export const PSDEditor = () => {');
appJsx = appJsx.replace(/export default App;/g, '');

// Since we're changing this to TSX but it's full of JS, we'll just save it as PSDEditor.jsx for now to avoid hundreds of type errors.
// Wait, the project is configured for TypeScript, we should probably save as .jsx, Vite supports it. Or .tsx and ignore errors? 
// Let's just save as .tsx and add // @ts-nocheck at the top to be safe.
appJsx = '// @ts-nocheck\n' + appJsx;

fs.writeFileSync(path.join(targetPages, 'PSDEditor.tsx'), appJsx);

console.log('Migration complete!');
