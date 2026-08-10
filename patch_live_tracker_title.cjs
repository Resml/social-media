const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (mrData.liveTracker && mrData.liveTracker.title) {
  mrData.liveTracker.title = mrData.liveTracker.title.replace(' (Live Video Tracker)', '');
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json for liveTracker.title');
