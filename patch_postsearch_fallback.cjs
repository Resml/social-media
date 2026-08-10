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

// Inject the map near the top of the component or outside
if (!content.includes('TABLE_COL_LABELS')) {
  content = content.replace(
    "export default function PostSearch() {",
    `${tableColLabels}\n\nexport default function PostSearch() {`
  );
}

// Replace preview
content = content.replace(
  "{t('postSearch.table.preview')}",
  "{t('postSearch.table.preview', 'PREVIEW')}"
);

// Replace col map
content = content.replace(
  "{t(`postSearch.table.${col}`)}",
  "{t(`postSearch.table.${col}`, TABLE_COL_LABELS[col])}"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched PostSearch.tsx with default English fallbacks');
