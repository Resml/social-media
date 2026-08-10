const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

let replacedCount = 0;

function cleanBrackets(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      const original = obj[key];
      // Regex to match a space, followed by ( English Text ) at the end of the string
      const cleaned = original.replace(/\s*\([A-Za-z0-9\s&/,-]+\)$/, '');
      if (cleaned !== original) {
        console.log(`Changed: "${original}" -> "${cleaned}"`);
        obj[key] = cleaned;
        replacedCount++;
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleanBrackets(obj[key]);
    }
  }
}

cleanBrackets(mrData);

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log(`Successfully patched mr/translation.json. Total replaced: ${replacedCount}`);
