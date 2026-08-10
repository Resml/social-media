const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

// Profile Audit
if (mrData.profileAudit) {
  if (mrData.profileAudit.title) {
    mrData.profileAudit.title = mrData.profileAudit.title.replace(' (Profile & Competitor Audit)', '');
  }
  if (mrData.profileAudit.tabs && mrData.profileAudit.tabs.sideBySide) {
    mrData.profileAudit.tabs.sideBySide = mrData.profileAudit.tabs.sideBySide.replace(' (Side-by-Side)', '');
  }
}

// Article Planner
if (mrData.articlePlanner) {
  if (mrData.articlePlanner.title) {
    mrData.articlePlanner.title = mrData.articlePlanner.title.replace(' (Article Planner)', '');
  }
  if (mrData.articlePlanner.buttons && mrData.articlePlanner.buttons.guide) {
    mrData.articlePlanner.buttons.guide = mrData.articlePlanner.buttons.guide.replace(' (Guide)', '');
  }
  if (mrData.articlePlanner.guide && mrData.articlePlanner.guide.title) {
    mrData.articlePlanner.guide.title = mrData.articlePlanner.guide.title.replace(' (Categories Guide)', '');
  }
  if (mrData.articlePlanner.status) {
    if (mrData.articlePlanner.status.idea) mrData.articlePlanner.status.idea = mrData.articlePlanner.status.idea.replace(' (Idea)', '');
    if (mrData.articlePlanner.status.draft) mrData.articlePlanner.status.draft = mrData.articlePlanner.status.draft.replace(' (Draft)', '');
    if (mrData.articlePlanner.status.published) mrData.articlePlanner.status.published = mrData.articlePlanner.status.published.replace(' (Published)', '');
  }
  if (mrData.articlePlanner.form && mrData.articlePlanner.form.dueDate) {
    mrData.articlePlanner.form.dueDate = mrData.articlePlanner.form.dueDate.replace(' (Due Date)', '');
  }
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json for profileAudit and articlePlanner brackets');
