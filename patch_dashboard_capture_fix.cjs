const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("import { toast } from 'sonner'")) {
  content = content.replace(
    "import { haptics } from '../utils/haptics';",
    "import { haptics } from '../utils/haptics';\nimport { toast } from 'sonner';"
  );
}

const generatePDFStr = `    try {
      const element = reportRef.current;
      if (!element) {
        toast.error("Report template not found");
        return;
      }
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: true,
        windowWidth: 800,
        windowHeight: 1200
      });
      
      if (canvas.width === 0 || canvas.height === 0) {
        toast.error("Failed to capture report. Canvas is empty.");
        return;
      }
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(\`Dashboard_Report_\${new Date().toISOString().split('T')[0]}.pdf\`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    }`;

content = content.replace(
  /try \{\s+const element = reportRef\.current;[\s\S]*?console\.error\('Failed to generate PDF', err\);\s+\}/m,
  generatePDFStr
);

// Fix wrapper style
content = content.replace(
  "<div ref={reportRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -100 }}>",
  "<div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -100, width: '794px' }}>"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched Dashboard.tsx with better capture styles and toasts');
