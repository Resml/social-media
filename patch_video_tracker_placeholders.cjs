const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (mrData.videoTracker && mrData.videoTracker.form) {
  mrData.videoTracker.form.titlePlaceholder = 'व्हिडिओचे शीर्षक…';
  mrData.videoTracker.form.notePlaceholder = 'काही नोंदी…';
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json for videoTracker placeholders');
