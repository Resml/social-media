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

  const artStateSearch = `  const [form, setForm] = useState<Omit<Article,'id'>>({
    type:'daily-short', category:DAILY_CATEGORIES[0], title:'', writer:WRITERS[0], status:'idea', dueDate:'', note:''
  });`;
  const artStateReplace = `  const [form, setForm] = useState<Omit<Article,'id'>>({
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
  };`;
  artContent = artContent.replace(artStateSearch, artStateReplace);

  const artReturnSearch = `  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div className="max-w-5xl mx-auto">`;
  const artReturnReplace = `  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <ArticlePlannerReport articles={articles} />
      </div>
      <div className="max-w-5xl mx-auto">`;
  artContent = artContent.replace(artReturnSearch, artReturnReplace);

  const artButtonSearch = `          <div className="flex gap-2">
            <button onClick={() => setShowGuide(g => !g)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors hover:bg-slate-50"
              style={{ borderColor:'var(--slate-200)', color:'var(--slate-600)' }}>
              <BookOpen size={15}/> {t('articlePlanner.buttons.guide', 'Guide')}
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
              <Plus size={16}/> {t('articlePlanner.buttons.addArticle', 'Add Article')}
            </button>
          </div>`;
  const artButtonReplace = `          <div className="flex gap-2">
            <button onClick={() => setShowGuide(g => !g)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors hover:bg-slate-50"
              style={{ borderColor:'var(--slate-200)', color:'var(--slate-600)' }}>
              <BookOpen size={15}/> {t('articlePlanner.buttons.guide', 'Guide')}
            </button>
            <button onClick={generatePDF} disabled={isGeneratingReport} className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all \${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}\`} style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (<div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
              <Plus size={16}/> {t('articlePlanner.buttons.addArticle', 'Add Article')}
            </button>
          </div>`;
  artContent = artContent.replace(artButtonSearch, artButtonReplace);
  
  fs.writeFileSync(articlePath, artContent, 'utf8');
}

// 2. VideoProduction
const videoPath = path.join(__dirname, 'frontend/src/pages/VideoProduction.tsx');
let vidContent = fs.readFileSync(videoPath, 'utf8');

if (!vidContent.includes('import * as htmlToImage')) {
  vidContent = vidContent.replace(
    "import { useTranslation } from 'react-i18next';",
    "import { useTranslation } from 'react-i18next';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { VideoProductionReport } from '../components/VideoProductionReport';\nimport { useRef } from 'react';\nimport { Download } from 'lucide-react';"
  );

  const vidStateSearch = `  const [form, setForm] = useState<Omit<VideoEntry,'id'>>({
    title:'', category:VIDEO_CATEGORIES[0], duration:75, format:'square',
    status:'idea', assignee:WRITERS[0], scheduledDate:'', note:''
  });`;
  const vidStateReplace = `  const [form, setForm] = useState<Omit<VideoEntry,'id'>>({
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
      const imgData = await htmlToImage.toPng(element, { pixelRatio: 2, backgroundColor: '#ffffff', style: { opacity: '1' } });
      if (!imgData || imgData === 'data:,') { toast.error("Failed to capture report. Image is empty."); return; }
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
  vidContent = vidContent.replace(vidStateSearch, vidStateReplace);

  const vidReturnSearch = `  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div className="max-w-5xl mx-auto">`;
  const vidReturnReplace = `  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <VideoProductionReport videos={videos} />
      </div>
      <div className="max-w-5xl mx-auto">`;
  vidContent = vidContent.replace(vidReturnSearch, vidReturnReplace);

  const vidButtonSearch = `          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
            <Plus size={16}/> {t('videoTracker.addVideo', 'Add Video')}
          </button>`;
  const vidButtonReplace = `          <div className="flex items-center gap-2">
            <button onClick={generatePDF} disabled={isGeneratingReport} className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all \${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}\`} style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (<div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : 'Download PDF'}
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
              <Plus size={16}/> {t('videoTracker.addVideo', 'Add Video')}
            </button>
          </div>`;
  // We need to only replace the FIRST occurrence in the header, because there's also an empty state button!
  vidContent = vidContent.replace(vidButtonSearch, vidButtonReplace);

  fs.writeFileSync(videoPath, vidContent, 'utf8');
}

console.log('Successfully patched ArticlePlanner and VideoProduction with exact string matching.');
