const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/PollManager.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Imports
if (!content.includes('import * as htmlToImage')) {
  content = content.replace(
    "import { Plus, X, BarChart2, ThumbsUp, TrendingUp } from 'lucide-react';",
    "import { Plus, X, BarChart2, ThumbsUp, TrendingUp, Download } from 'lucide-react';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { PollReport } from '../components/PollReport';\nimport { useRef } from 'react';"
  );
}

// 2. Add State and generatePDF function
const stateRegex = /const \[platform, setPlatform\] = useState\('Facebook'\);/;
const stateInjection = `const [platform, setPlatform] = useState('Facebook');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    
    try {
      const element = reportRef.current;
      
      const imgData = await htmlToImage.toPng(element, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        style: { opacity: '1' }
      });
      
      if (!imgData || imgData === 'data:,') {
        toast.error("Failed to capture report. Image is empty.");
        return;
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(\`Poll_Report_\${new Date().toISOString().split('T')[0]}.pdf\`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsGeneratingReport(false);
    }
  };`;

content = content.replace(stateRegex, stateInjection);

// 3. Mount hidden report wrapper
const returnRegex = /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{background:'var\(--slate-50\)', padding:'1\.5rem'\}\}>/;
const returnInjection = `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <PollReport polls={polls} />
      </div>`;

content = content.replace(returnRegex, returnInjection);

// 4. Add Download PDF button
const createPollBtnRegex = /<button onClick=\{\(\)=>setShowForm\(true\)\}[\s\S]*?<Plus size=\{16\}\/> \{t\('pollManager\.createPoll', 'Create Poll'\)\}[\s\S]*?<\/button>/;

const newButtons = `<div className="flex items-center gap-2">
            <button onClick={generatePDF} disabled={isGeneratingReport}
              className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all \${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}\`}
              style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
            </button>
            <button onClick={()=>setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)'}}>
              <Plus size={16}/> {t('pollManager.createPoll', 'Create Poll')}
            </button>
          </div>`;

content = content.replace(createPollBtnRegex, newButtons);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched PollManager.tsx with PDF generation');
