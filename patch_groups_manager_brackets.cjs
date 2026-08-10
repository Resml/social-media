const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (mrData.groupsManager || mrData.groupManager) {
  const target = mrData.groupsManager || mrData.groupManager;
  
  if (target.title) target.title = target.title.replace(' (Groups Manager)', '').replace(' (Group Manager)', '');
  if (target.stats && target.stats.totalReach) target.stats.totalReach = target.stats.totalReach.replace(' (Reach)', '');
  
  if (target.categories) {
    if (target.categories.Community) target.categories.Community = target.categories.Community.replace(' (Community)', '');
    if (target.categories.Youth) target.categories.Youth = target.categories.Youth.replace(' (Youth)', '');
    if (target.categories.Charity) target.categories.Charity = target.categories.Charity.replace(' (Charity)', '');
  }
  
  if (target.platforms) {
    if (target.platforms.Facebook) target.platforms.Facebook = target.platforms.Facebook.replace(' (Facebook)', '');
    if (target.platforms.WhatsApp) target.platforms.WhatsApp = target.platforms.WhatsApp.replace(' (WhatsApp)', '');
    if (target.platforms.Telegram) target.platforms.Telegram = target.platforms.Telegram.replace(' (Telegram)', '');
  }
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json for groupsManager brackets');
