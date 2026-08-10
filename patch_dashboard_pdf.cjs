const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
if (!content.includes('import html2canvas')) {
  content = content.replace(
    "import { haptics } from '../utils/haptics';",
    "import { haptics } from '../utils/haptics';\nimport html2canvas from 'html2canvas';\nimport { jsPDF } from 'jspdf';\nimport { DashboardReport } from '../components/DashboardReport';"
  );
}

// 2. Lucide icons
content = content.replace(
  "import { Users, TrendingUp, Eye, AtSign, ArrowUp } from 'lucide-react';",
  "import { Users, TrendingUp, Eye, AtSign, ArrowUp, Download } from 'lucide-react';"
);

// 3. States and ref
if (!content.includes('const reportRef = useRef')) {
  content = content.replace(
    "const scrollRef = useRef<HTMLDivElement>(null);",
    "const scrollRef = useRef<HTMLDivElement>(null);\n  const reportRef = useRef<HTMLDivElement>(null);\n  const [isGeneratingReport, setIsGeneratingReport] = useState(false);"
  );
}

// 4. generatePDF function
const generatePDFStr = `  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    haptics.medium();
    
    try {
      const element = reportRef.current;
      // Temporarily make it visible in the document flow for capture
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      
      element.style.display = 'none';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(\`Dashboard_Report_\${new Date().toISOString().split('T')[0]}.pdf\`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };`;

if (!content.includes('generatePDF = async')) {
  content = content.replace(
    "const handleManualSync = async () => {",
    `${generatePDFStr}\n\n  const handleManualSync = async () => {`
  );
}

// 5. Button
const buttonStr = `<button 
                onClick={generatePDF}
                disabled={isGeneratingReport}
                className={\`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border \${isGeneratingReport ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white text-brand-600 border-brand-200 hover:bg-brand-50'}\`}
              >
                {isGeneratingReport ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16} />}
                {isGeneratingReport ? t('dashboard.report.downloading', 'Generating PDF...') : t('dashboard.report.downloadPdf', 'Download Report')}
              </button>
              
              <button`;

content = content.replace("<button \n                onClick={handleManualSync}", buttonStr);
content = content.replace("<button \r\n                onClick={handleManualSync}", buttonStr);

// 6. Hidden Component
const hiddenCompStr = `      {/* Hidden PDF Report */}
      <div style={{ display: 'none' }}>
        <DashboardReport ref={reportRef} summary={summary} growth={growth} engagement={engagement} />
      </div>

      <div className="max-w-7xl mx-auto md:p-4">`;

content = content.replace("<div className=\"max-w-7xl mx-auto md:p-4\">", hiddenCompStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched Dashboard.tsx with PDF generation');
