const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/PostSearch.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const tableColLabels = `const TABLE_COL_LABELS: Record<string, string> = {
  views: 'VIEWS',
  viewers: 'VIEWERS',
  interactions: 'INTERACTIONS',
  netFollows: 'NET FOLLOWERS',
  impressions: 'IMPRESSIONS'
};`;

if (!content.includes('TABLE_COL_LABELS')) {
  content = content.replace(
    "export const PostSearch = () => {",
    `${tableColLabels}\n\nexport const PostSearch = () => {`
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected TABLE_COL_LABELS into PostSearch.tsx');
