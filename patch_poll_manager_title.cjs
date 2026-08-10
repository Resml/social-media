const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (mrData.pollManager && mrData.pollManager.title) {
  mrData.pollManager.title = mrData.pollManager.title.replace(' (Poll Manager)', '');
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json for pollManager.title');
