const fs = require('fs');
const path = require('path');

// 1. Patch NetworkBuilder.tsx
const networkPath = path.join(__dirname, 'frontend/src/pages/NetworkBuilder.tsx');
let netContent = fs.readFileSync(networkPath, 'utf8');

if (!netContent.includes('import * as htmlToImage')) {
  netContent = netContent.replace(
    "import { Plus, X, Search, Network, Tag, User } from 'lucide-react';",
    "import { Plus, X, Search, Network, Tag, User, Download } from 'lucide-react';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { NetworkReport } from '../components/NetworkReport';\nimport { useRef } from 'react';"
  );
}

const netStateRegex = /const \[form, setForm\] = useState<Omit<Contact,'id'>>\(\{ name:'', location:'', interest:INTERESTS\[0\], platform:'Facebook', phone:'', tag:'Supporter', note:'' \}\);/;
const netStateInjection = `const [form, setForm] = useState<Omit<Contact,'id'>>({ name:'', location:'', interest:INTERESTS[0], platform:'Facebook', phone:'', tag:'Supporter', note:'' });
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
      pdf.save(\`Network_Report_\${new Date().toISOString().split('T')[0]}.pdf\`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsGeneratingReport(false);
    }
  };`;

netContent = netContent.replace(netStateRegex, netStateInjection);

const netReturnRegex = /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{background:'var\(--slate-50\)', padding:'1\.5rem'\}\}>/;
const netReturnInjection = `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <NetworkReport contacts={contacts} />
      </div>`;

netContent = netContent.replace(netReturnRegex, netReturnInjection);

const addContactBtnRegex = /<button onClick=\{\(\)=>setShowForm\(true\)\}[\s\S]*?<Plus size=\{16\}\/> \{t\('networkBuilder\.addContact', 'Add Contact'\)\}[\s\S]*?<\/button>/;
const newNetButtons = `<div className="flex items-center gap-2">
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
              <Plus size={16}/> {t('networkBuilder.addContact', 'Add Contact')}
            </button>
          </div>`;

netContent = netContent.replace(addContactBtnRegex, newNetButtons);
fs.writeFileSync(networkPath, netContent, 'utf8');



// 2. Patch GroupsManager.tsx
const groupsPath = path.join(__dirname, 'frontend/src/pages/GroupsManager.tsx');
let grpContent = fs.readFileSync(groupsPath, 'utf8');

if (!grpContent.includes('import * as htmlToImage')) {
  grpContent = grpContent.replace(
    "import { Plus, X, Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';",
    "import { Plus, X, Users, CheckCircle, AlertCircle, TrendingUp, Download } from 'lucide-react';\nimport * as htmlToImage from 'html-to-image';\nimport { jsPDF } from 'jspdf';\nimport { toast } from 'sonner';\nimport { GroupsReport } from '../components/GroupsReport';\nimport { useRef } from 'react';"
  );
}

const grpStateRegex = /const \[form, setForm\] = useState<Omit<Group,'id'>>\(\{ name:'', platform:'Facebook', members:0, admin:TEAM\[0\], category:CATEGORIES\[0\], status:'active', joinedDate:'', notes:'' \}\);/;
const grpStateInjection = `const [form, setForm] = useState<Omit<Group,'id'>>({ name:'', platform:'Facebook', members:0, admin:TEAM[0], category:CATEGORIES[0], status:'active', joinedDate:'', notes:'' });
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
      pdf.save(\`Groups_Report_\${new Date().toISOString().split('T')[0]}.pdf\`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    } finally {
      setIsGeneratingReport(false);
    }
  };`;

grpContent = grpContent.replace(grpStateRegex, grpStateInjection);

const grpReturnRegex = /return \(\s*<div className="flex-1 overflow-y-auto" style=\{\{background:'var\(--slate-50\)', padding:'1\.5rem'\}\}>/;
const grpReturnInjection = `return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <GroupsReport groups={groups} />
      </div>`;

grpContent = grpContent.replace(grpReturnRegex, grpReturnInjection);

const addGroupBtnRegex = /<button onClick=\{\(\)=>setShowForm\(true\)\}[\s\S]*?<Plus size=\{16\}\/> \{t\('groupsManager\.addGroup', 'Add Group'\)\}[\s\S]*?<\/button>/;
const newGrpButtons = `<div className="flex items-center gap-2">
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
              <Plus size={16}/> {t('groupsManager.addGroup', 'Add Group')}
            </button>
          </div>`;

grpContent = grpContent.replace(addGroupBtnRegex, newGrpButtons);
fs.writeFileSync(groupsPath, grpContent, 'utf8');

console.log('Successfully patched NetworkBuilder and GroupsManager');
