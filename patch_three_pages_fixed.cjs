const fs = require('fs');
const path = require('path');

// --- 1. ProfileAudit ---
const profilePath = path.join(__dirname, 'frontend/src/pages/ProfileAudit.tsx');
let profContent = fs.readFileSync(profilePath, 'utf8');

// Imports
profContent = profContent.replace(
  "import { useTranslation } from 'react-i18next';",
  "import { useTranslation } from 'react-i18next';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { ProfileAuditReport } from '../components/ProfileAuditReport';\nimport { useRef } from 'react';\nimport { Download } from 'lucide-react';"
);

// State and Function
profContent = profContent.replace(
  /const \[activeTab, setActiveTab\]   = useState<'self' \| 'compare'>\('self'\);/,
  `const [activeTab, setActiveTab]   = useState<'self' | 'compare'>('self');
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
      pdf.save(\`Profile_Audit_\${new Date().toISOString().split('T')[0]}.pdf\`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsGeneratingReport(false);
    }
  };`
);

// Return wrapper
profContent = profContent.replace(
  /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{ background:'var\(--slate-50\)', padding:'1\.5rem' \}\}>/,
  `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <ProfileAuditReport sections={sections} />
      </div>`
);

// Button
profContent = profContent.replace(
  /<button onClick=\{resetAll\}[\s\S]*?<RefreshCw size=\{14\}\/> \{t\('profileAudit\.resetAll', 'Reset All'\)\}[\s\S]*?<\/button>/,
  `<div className="flex items-center gap-2">
            <button onClick={generatePDF} disabled={isGeneratingReport}
              className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all \${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}\`}
              style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
            </button>
            <button onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors hover:bg-slate-50"
              style={{ borderColor:'var(--slate-200)', color:'var(--slate-500)' }}>
              <RefreshCw size={14}/> {t('profileAudit.resetAll', 'Reset All')}
            </button>
          </div>`
);
fs.writeFileSync(profilePath, profContent, 'utf8');


// --- 2. ArticlePlanner ---
const articlePath = path.join(__dirname, 'frontend/src/pages/ArticlePlanner.tsx');
let artContent = fs.readFileSync(articlePath, 'utf8');

// Imports
artContent = artContent.replace(
  "import { useTranslation } from 'react-i18next';",
  "import { useTranslation } from 'react-i18next';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { ArticlePlannerReport } from '../components/ArticlePlannerReport';\nimport { useRef } from 'react';\nimport { Download } from 'lucide-react';"
);

// State and Function
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

// Return wrapper
artContent = artContent.replace(
  /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{background:'var\(--slate-50\)', padding:'1\.5rem'\}\}>/,
  `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <ArticlePlannerReport articles={articles} />
      </div>`
);

// Button
artContent = artContent.replace(
  /<button onClick=\{\(\) => setShowForm\(true\)\}[\s\S]*?<Plus size=\{16\}\/> \{t\('articlePlanner\.buttons\.addArticle', 'Add Article'\)\}[\s\S]*?<\/button>/,
  `<button onClick={generatePDF} disabled={isGeneratingReport}
              className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all \${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}\`}
              style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
              <Plus size={16}/> {t('articlePlanner.buttons.addArticle', 'Add Article')}
            </button>`
);
fs.writeFileSync(articlePath, artContent, 'utf8');


// --- 3. VideoProduction ---
const videoPath = path.join(__dirname, 'frontend/src/pages/VideoProduction.tsx');
let vidContent = fs.readFileSync(videoPath, 'utf8');

// Imports
vidContent = vidContent.replace(
  "import { useTranslation } from 'react-i18next';",
  "import { useTranslation } from 'react-i18next';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { VideoProductionReport } from '../components/VideoProductionReport';\nimport { useRef } from 'react';\nimport { Download } from 'lucide-react';"
);

// State and Function
vidContent = vidContent.replace(
  /const \[form, setForm\] = useState<Omit<VideoEntry,'id'>>\(\{[\s\S]*?title:'', category:VIDEO_CATEGORIES\[0\], duration:75, format:'square',[\s\S]*?status:'idea', assignee:WRITERS\[0\], scheduledDate:'', note:''[\s\S]*?\}\);/,
  `const [form, setForm] = useState<Omit<VideoEntry,'id'>>({
    title:'', category:VIDEO_CATEGORIES[0], duration:75, format:'square',
    status:'idea', assignee:WRITERS[0], scheduledDate:'', note:''
  });
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
      pdf.save(\`Video_Production_\${new Date().toISOString().split('T')[0]}.pdf\`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsGeneratingReport(false);
    }
  };`
);

// Return wrapper
vidContent = vidContent.replace(
  /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{ background:'var\(--slate-50\)', padding:'1\.5rem' \}\}>/,
  `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <VideoProductionReport videos={videos} />
      </div>`
);

// Button
vidContent = vidContent.replace(
  /<button onClick=\{\(\) => setShowForm\(true\)\}[\s\S]*?<Plus size=\{16\}\/> \{t\('videoTracker\.addVideo', 'Add Video'\)\}[\s\S]*?<\/button>/,
  `<div className="flex items-center gap-2">
            <button onClick={generatePDF} disabled={isGeneratingReport}
              className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all \${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}\`}
              style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
              <Plus size={16}/> {t('videoTracker.addVideo', 'Add Video')}
            </button>
          </div>`
);
fs.writeFileSync(videoPath, vidContent, 'utf8');

console.log('Successfully repatched ProfileAudit, ArticlePlanner, and VideoProduction');
