const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (mrData.adTracker && mrData.adTracker.title) {
  mrData.adTracker.title = mrData.adTracker.title.replace(' (Ad Tracker)', '');
}
if (mrData.adTracker && mrData.adTracker.stats && mrData.adTracker.stats.totalReach) {
  mrData.adTracker.stats.totalReach = mrData.adTracker.stats.totalReach.replace(' (Reach)', '');
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json for adTracker.title');
