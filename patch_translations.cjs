const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend/src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We are looking for: 
  // {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
  // and replacing with:
  // {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : t('dashboard.report.downloadPdf', 'Download PDF')}

  const target = "{isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}";
  const replacement = "{isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : t('dashboard.report.downloadPdf', 'Download PDF')}";

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched', file);
  }
}
console.log('Done patching translations.');
