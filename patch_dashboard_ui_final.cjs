const fs = require('fs');
const path = require('path');

// 1. Fix translation
const enPath = path.join(__dirname, 'frontend/src/locales/en/translation.json');
if (fs.existsSync(enPath)) {
  let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  if (enData.dashboard && enData.dashboard.report) {
    enData.dashboard.report.downloadPdf = "Download PDF";
    fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
  }
}

// 2. Fix Dashboard.tsx layout and button wrapping
const dashboardPath = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');
let content = fs.readFileSync(dashboardPath, 'utf8');

// Force the container to push to the right edge with ml-auto
content = content.replace(
  '<div className="flex items-center justify-end gap-3 w-full lg:w-auto">',
  '<div className="flex items-center justify-end gap-3 w-full lg:w-auto ml-auto">'
);

// Add whitespace-nowrap to the button so it never wraps
content = content.replace(
  'className={`px-2 py-1 h-fit rounded border font-medium text-xs transition-all flex items-center gap-1 ${isGeneratingReport',
  'className={`px-2.5 py-1.5 h-fit rounded-lg border font-medium text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${isGeneratingReport'
);

// Ensure the fallback text is also just "Download PDF"
content = content.replace(
  "t('dashboard.report.downloadPdf', 'Download PDF')",
  "t('dashboard.report.downloadPdf', 'Download PDF')"
);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('Successfully patched Dashboard UI to fix wrapping and alignment');
