const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace import
content = content.replace(
  "import html2canvas from 'html2canvas';",
  "import * as htmlToImage from 'html-to-image';"
);

// Replace implementation
const newGeneratePDF = `    try {
      const element = reportRef.current;
      if (!element) {
        toast.error("Report template not found");
        return;
      }
      
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
      pdf.save(\`Dashboard_Report_\${new Date().toISOString().split('T')[0]}.pdf\`);
      toast.success("Report downloaded successfully!");
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"));
    }`;

content = content.replace(
  /try \{\s+const element = reportRef\.current;[\s\S]*?console\.error\('Failed to generate PDF', err\);\s+toast\.error\("Error generating PDF: " \+ \(err\?\.message \|\| "Unknown error"\)\);\s+\}/m,
  newGeneratePDF
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched Dashboard.tsx to use html-to-image');
