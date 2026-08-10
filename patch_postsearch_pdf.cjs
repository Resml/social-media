const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/PostSearch.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Imports
if (!content.includes('import * as htmlToImage')) {
  content = content.replace(
    "import { Search, Plus, Filter, Columns, Download, Info, ArrowUpDown, ChevronDown, Video } from 'lucide-react';",
    "import { Search, Plus, Filter, Columns, Download, Info, ArrowUpDown, ChevronDown, Video } from 'lucide-react';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { PostSearchReport } from '../components/PostSearchReport';\nimport { useRef } from 'react';"
  );
}

// 2. Add State and generatePDF function
const stateRegex = /const \[selectedIds, setSelectedIds\] = useState<string\[\]>\(\[\]\);/;
const stateInjection = `const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    
    try {
      const element = reportRef.current;
      
      const imgData = await htmlToImage.toPng(element, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff'
      });
      
      if (!imgData || imgData === 'data:,') {
        toast.error("Failed to capture report. Image is empty.");
        return;
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(\`Content_Library_\${activeTab}_\${new Date().toISOString().split('T')[0]}.pdf\`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsGeneratingReport(false);
    }
  };`;

content = content.replace(stateRegex, stateInjection);

// 3. Mount hidden report
const returnRegex = /return \(\s*<div className="flex-1 overflow-y-auto bg-\[#F0F2F5\]">/;
const returnInjection = `return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5] relative z-0">
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: -50, width: '794px' }}>
        <PostSearchReport activeTab={activeTab} results={results} />
      </div>`;

content = content.replace(returnRegex, returnInjection);

// 4. Change Export Button to Download PDF
const exportBtnRegex = /<button className="flex items-center gap-1\.5 bg-\[#E4E6EB\].*?>[\s\S]*?<Download size=\{16\} \/>[\s\S]*?<span>\{t\('postSearch\.actions\.export'.*?\}<\/span>[\s\S]*?<ChevronDown size=\{14\} \/>[\s\S]*?<\/button>/;
const newPdfBtn = `<button 
                onClick={generatePDF}
                disabled={isGeneratingReport}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors ml-auto \${isGeneratingReport ? 'bg-slate-100 text-slate-400' : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'}\`}
              >
                {isGeneratingReport ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16} />}
                <span>{isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}</span>
              </button>`;

content = content.replace(exportBtnRegex, newPdfBtn);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched PostSearch.tsx with PDF generation');
