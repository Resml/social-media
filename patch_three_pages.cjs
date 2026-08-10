const fs = require('fs');
const path = require('path');

// 1. ProfileAudit
const profilePath = path.join(__dirname, 'frontend/src/pages/ProfileAudit.tsx');
let profContent = fs.readFileSync(profilePath, 'utf8');

if (!profContent.includes('import * as htmlToImage')) {
  profContent = profContent.replace(
    "import {\n  ClipboardList, CheckSquare, Square, RefreshCw,\n  ChevronDown, ChevronUp, User, BarChart2, FileText,\n  MessageSquare, TrendingUp, ShieldAlert\n} from 'lucide-react';",
    "import {\n  ClipboardList, CheckSquare, Square, RefreshCw,\n  ChevronDown, ChevronUp, User, BarChart2, FileText,\n  MessageSquare, TrendingUp, ShieldAlert, Download\n} from 'lucide-react';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { ProfileAuditReport } from '../components/ProfileAuditReport';\nimport { useRef } from 'react';"
  );
}

const profStateRegex = /const \[activeTab, setActiveTab\]   = useState<'self' \| 'compare'>\('self'\);/;
const profStateInjection = `const [activeTab, setActiveTab]   = useState<'self' | 'compare'>('self');
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
  };`;

profContent = profContent.replace(profStateRegex, profStateInjection);

const profReturnRegex = /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{ background:'var\(--slate-50\)', padding:'1\.5rem' \}\}>/;
const profReturnInjection = `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <ProfileAuditReport sections={sections} />
      </div>`;
profContent = profContent.replace(profReturnRegex, profReturnInjection);

const profHeaderRegex = /<button onClick=\{resetAll\}[\s\S]*?<RefreshCw size=\{16\}\/> \{t\('profileAudit\.reset', 'Reset All'\)\}[\s\S]*?<\/button>/;
const profNewButtons = `<div className="flex items-center gap-2">
            <button onClick={generatePDF} disabled={isGeneratingReport}
              className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all \${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}\`}
              style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
            </button>
            <button onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
              style={{color:'var(--slate-500)', border:'1px solid var(--slate-200)'}}>
              <RefreshCw size={16}/> {t('profileAudit.reset', 'Reset All')}
            </button>
          </div>`;
profContent = profContent.replace(profHeaderRegex, profNewButtons);
fs.writeFileSync(profilePath, profContent, 'utf8');


// 2. ArticlePlanner
const articlePath = path.join(__dirname, 'frontend/src/pages/ArticlePlanner.tsx');
let artContent = fs.readFileSync(articlePath, 'utf8');

if (!artContent.includes('import * as htmlToImage')) {
  artContent = artContent.replace(
    "import { Plus, X, FileText, BookOpen, AlignLeft, CheckCircle, Clock, Lightbulb } from 'lucide-react';",
    "import { Plus, X, FileText, BookOpen, AlignLeft, CheckCircle, Clock, Lightbulb, Download } from 'lucide-react';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { ArticlePlannerReport } from '../components/ArticlePlannerReport';\nimport { useRef } from 'react';"
  );
}

const artStateRegex = /const \[form, setForm\] = useState<Omit<Article,'id'>>\(\{[\s\S]*?type:'daily-short', category:DAILY_CATEGORIES\[0\], title:'', writer:WRITERS\[0\], status:'idea', dueDate:'', note:''[\s\S]*?\}\);/;
const artStateInjection = `const [form, setForm] = useState<Omit<Article,'id'>>({
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
  };`;
artContent = artContent.replace(artStateRegex, artStateInjection);

const artReturnRegex = /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{background:'var\(--slate-50\)', padding:'1\.5rem'\}\}>/;
const artReturnInjection = `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <ArticlePlannerReport articles={articles} />
      </div>`;
artContent = artContent.replace(artReturnRegex, artReturnInjection);

const artHeaderRegex = /<button onClick=\{\(\)=>setShowForm\(true\)\}[\s\S]*?<Plus size=\{16\}\/> \{t\('articlePlanner\.addArticle', 'Add Article'\)\}[\s\S]*?<\/button>/;
const artNewButtons = `<div className="flex items-center gap-2">
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
              <Plus size={16}/> {t('articlePlanner.addArticle', 'Add Article')}
            </button>
          </div>`;
artContent = artContent.replace(artHeaderRegex, artNewButtons);
fs.writeFileSync(articlePath, artContent, 'utf8');


// 3. VideoProduction
const videoPath = path.join(__dirname, 'frontend/src/pages/VideoProduction.tsx');
let vidContent = fs.readFileSync(videoPath, 'utf8');

if (!vidContent.includes('import * as htmlToImage')) {
  vidContent = vidContent.replace(
    "import { Plus, X, Clapperboard, Info, CheckCircle, Clock, Scissors, SquareIcon, MonitorX } from 'lucide-react';",
    "import { Plus, X, Clapperboard, Info, CheckCircle, Clock, Scissors, SquareIcon, MonitorX, Download } from 'lucide-react';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { VideoProductionReport } from '../components/VideoProductionReport';\nimport { useRef } from 'react';"
  );
}

const vidStateRegex = /const \[form, setForm\] = useState<Omit<VideoEntry,'id'>>\(\{[\s\S]*?title:'', category:VIDEO_CATEGORIES\[0\], duration:75, format:'square',[\s\S]*?status:'idea', assignee:WRITERS\[0\], scheduledDate:'', note:''[\s\S]*?\}\);/;
const vidStateInjection = `const [form, setForm] = useState<Omit<VideoEntry,'id'>>({
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
  };`;
vidContent = vidContent.replace(vidStateRegex, vidStateInjection);

const vidReturnRegex = /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{ background:'var\(--slate-50\)', padding:'1\.5rem' \}\}>/;
const vidReturnInjection = `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <VideoProductionReport videos={videos} />
      </div>`;
vidContent = vidContent.replace(vidReturnRegex, vidReturnInjection);

const vidHeaderRegex = /<button onClick=\{\(\)=>setShowForm\(true\)\}[\s\S]*?<Plus size=\{16\}\/> \{t\('videoTracker\.addVideo', 'Add Video'\)\}[\s\S]*?<\/button>/;
const vidNewButtons = `<div className="flex items-center gap-2">
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
              <Plus size={16}/> {t('videoTracker.addVideo', 'Add Video')}
            </button>
          </div>`;
vidContent = vidContent.replace(vidHeaderRegex, vidNewButtons);
fs.writeFileSync(videoPath, vidContent, 'utf8');

console.log('Successfully patched ProfileAudit, ArticlePlanner, and VideoProduction');
