const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (!mrData.schedule) {
  mrData.schedule = {};
}

mrData.schedule.status = {
  queued: 'रांगेत',
  draft: 'ड्राफ्ट',
  published: 'प्रकाशित',
  failed: 'अयशस्वी'
};

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json with schedule statuses');
