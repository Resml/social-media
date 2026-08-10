const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (mrData.teamTasks && mrData.teamTasks.title) {
  mrData.teamTasks.title = mrData.teamTasks.title.replace(' (Team Tasks)', '');
}
if (mrData.teamTasks && mrData.teamTasks.categories && mrData.teamTasks.categories.Poll) {
  mrData.teamTasks.categories.Poll = mrData.teamTasks.categories.Poll.replace(' (Poll)', '');
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json for teamTasks');
