const fs = require('fs');
const path = require('path');
const files = [
  'AdTracker.tsx', 'ArticlePlanner.tsx', 'Dashboard.tsx', 'GroupsManager.tsx', 
  'LiveTracker.tsx', 'NetworkBuilder.tsx', 'PollManager.tsx', 'PostSearch.tsx', 
  'ProfileAudit.tsx', 'TeamTasks.tsx', 'VideoProduction.tsx'
];

for (let file of files) {
  const filePath = path.join('src/pages', file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('const toastId = toast.loading')) {
    continue; // already patched
  }

  content = content.replace(
    /setIsGeneratingReport\(true\);\s+haptics\.medium\(\);\s+try \{/,
    `setIsGeneratingReport(true);\n    haptics.medium();\n    const toastId = toast.loading('Generating PDF report... Please wait.');\n    try {`
  );

  content = content.replace(
    /toast\.success\("Report downloaded successfully!"\);/,
    `toast.success("Report downloaded successfully!", { id: toastId });`
  );

  content = content.replace(
    /toast\.error\("Error generating PDF: " \+ \(err\?\.message \|\| "Unknown error"\)\);/,
    `toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });`
  );
  
  content = content.replace(
    /toast\.error\("Failed to capture report\. Image is empty\."\);/,
    `toast.error("Failed to capture report. Image is empty.", { id: toastId });`
  );

  content = content.replace(
    /toast\.error\("Report template not found"\);/,
    `toast.error("Report template not found", { id: toastId });`
  );
  
  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log('Done');
