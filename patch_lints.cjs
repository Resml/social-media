const fs = require('fs');
const path = require('path');

// 1. ArticlePlanner
const articlePath = path.join(__dirname, 'frontend/src/pages/ArticlePlanner.tsx');
let artContent = fs.readFileSync(articlePath, 'utf8');
if (!artContent.includes('import * as htmlToImage')) {
  artContent = artContent.replace(
    "import { useTranslation } from 'react-i18next';",
    "import { useTranslation } from 'react-i18next';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { ArticlePlannerReport } from '../components/ArticlePlannerReport';\nimport { useRef } from 'react';\nimport { Download } from 'lucide-react';"
  );
  artContent = artContent.replace(
    /const \[form, setForm\] = useState<Omit<Article,'id'>>\(\{[\s\S]*?type:'daily-short', category:DAILY_CATEGORIES\[0\], title:'', writer:WRITERS\[0\], status:'idea', dueDate:'', note:''[\s\S]*?\}\);/,
    `const [form, setForm] = useState<Omit<Article,'id'>>({
      type:'daily-short', category:DAILY_CATEGORIES[0], title:'', writer:WRITERS[0], status:'idea', dueDate:'', note:''
    });
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const generatePDF = async () => {
      if (!reportRef.current) return;
      setIsGeneratingReport(true);
      try {
        const element = reportRef.current;
        const imgData = await htmlToImage.toPng(element, { pixelRatio: 2, backgroundColor: '#ffffff', style: { opacity: '1' } });
        if (!imgData || imgData === 'data:,') { toast.error("Failed to capture report. Image is empty."); return; }
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(\`Article_Planner_\${new Date().toISOString().split('T')[0]}.pdf\`);
        toast.success("Report downloaded successfully!");
      } catch (err: any) {
        console.error('Failed to generate PDF', err);
        toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
      } finally {
        setIsGeneratingReport(false);
      }
    };`
  );
  artContent = artContent.replace(
    /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{\s*background:'var\(--slate-50\)',\s*padding:'1\.5rem'\s*\}\}>/,
    `return (
      <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
        <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
          <ArticlePlannerReport articles={articles} />
        </div>`
  );
  artContent = artContent.replace(
    /<button onClick=\{\(\) => setShowForm\(true\)\}[\s\S]*?<Plus size=\{16\}\/> \{t\('articlePlanner\.buttons\.addArticle', 'Add Article'\)\}[\s\S]*?<\/button>/,
    `<div className="flex items-center gap-2">
      <button onClick={generatePDF} disabled={isGeneratingReport} className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all \${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}\`} style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
        {isGeneratingReport ? (<div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />) : <Download size={16}/>}
        {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
      </button>
      <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95" style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
        <Plus size={16}/> {t('articlePlanner.buttons.addArticle', 'Add Article')}
      </button>
    </div>`
  );
  fs.writeFileSync(articlePath, artContent, 'utf8');
}


// 2. ProfileAuditReport
const profileReportPath = path.join(__dirname, 'frontend/src/components/ProfileAuditReport.tsx');
let profRepContent = fs.readFileSync(profileReportPath, 'utf8');
profRepContent = profRepContent.replace(/sections\.map\(\(section, sIdx\) =>/g, "sections.map((section) =>");
profRepContent = profRepContent.replace(/section\.items\.map\(\(item, iIdx\) =>/g, "section.items.map((item) =>");
fs.writeFileSync(profileReportPath, profRepContent, 'utf8');


// 3. Dashboard
const dashboardPath = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
dashboardContent = dashboardContent.replace(/const handleManualSync = async \(\) => \{[\s\S]*?\};\n/, "");
fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');


// 4. PostSearch
const postSearchPath = path.join(__dirname, 'frontend/src/pages/PostSearch.tsx');
let postSearchContent = fs.readFileSync(postSearchPath, 'utf8');
postSearchContent = postSearchContent.replace(/, Filter, Columns/, "");
fs.writeFileSync(postSearchPath, postSearchContent, 'utf8');

console.log('Fixed lints and repatched ArticlePlanner.');
