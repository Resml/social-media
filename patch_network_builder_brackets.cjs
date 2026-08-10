const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (mrData.networkBuilder) {
  if (mrData.networkBuilder.title) {
    mrData.networkBuilder.title = mrData.networkBuilder.title.replace(' (Network Builder)', '');
  }
  if (mrData.networkBuilder.form && mrData.networkBuilder.form.interest) {
    mrData.networkBuilder.form.interest = mrData.networkBuilder.form.interest.replace(' (Interest)', '');
  }
  if (mrData.networkBuilder.tags && mrData.networkBuilder.tags.Influencer) {
    mrData.networkBuilder.tags.Influencer = mrData.networkBuilder.tags.Influencer.replace(' (Influencer)', '');
  }
  if (mrData.networkBuilder.platforms) {
    if (mrData.networkBuilder.platforms.Facebook) {
      mrData.networkBuilder.platforms.Facebook = mrData.networkBuilder.platforms.Facebook.replace(' (Facebook)', '');
    }
    if (mrData.networkBuilder.platforms.Instagram) {
      mrData.networkBuilder.platforms.Instagram = mrData.networkBuilder.platforms.Instagram.replace(' (Instagram)', '');
    }
    if (mrData.networkBuilder.platforms.WhatsApp) {
      mrData.networkBuilder.platforms.WhatsApp = mrData.networkBuilder.platforms.WhatsApp.replace(' (WhatsApp)', '');
    }
  }
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json for networkBuilder brackets');
