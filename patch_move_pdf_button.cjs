const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/PostSearch.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const buttonCode = `              <button 
                onClick={generatePDF}
                disabled={isGeneratingReport}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors \${isGeneratingReport ? 'bg-slate-100 text-slate-400' : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'}\`}
              >
                {isGeneratingReport ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16} />}
                <span>{isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}</span>
              </button>`;

// Remove from action bar (note the ml-auto which was used before)
const oldButtonCode = `              <button 
                onClick={generatePDF}
                disabled={isGeneratingReport}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors ml-auto \${isGeneratingReport ? 'bg-slate-100 text-slate-400' : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'}\`}
              >
                {isGeneratingReport ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16} />}
                <span>{isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}</span>
              </button>`;

content = content.replace(oldButtonCode, '');

// Insert to section header
const sectionHeaderRegex = /<h2 className="text-\[20px\] font-bold text-\[#050505\] mb-4">\{t\('postSearch\.subtitle', 'Content Library'\)\}<\/h2>/;
const newSectionHeader = `<div className="flex justify-between items-center mb-4">
              <h2 className="text-[20px] font-bold text-[#050505]">{t('postSearch.subtitle', 'Content Library')}</h2>
${buttonCode}
            </div>`;

content = content.replace(sectionHeaderRegex, newSectionHeader);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully moved the Download PDF button');
