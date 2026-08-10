const fs = require('fs');
const path = require('path');

const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (!mrData.postSearch) {
  mrData.postSearch = {};
}

Object.assign(mrData.postSearch, {
  ...mrData.postSearch,
  breadcrumbs: {
    dashboard: 'प्रोफेशनल डॅशबोर्ड',
    content: 'कंटेंट'
  },
  headerContent: 'कंटेंट',
  subtitle: 'कंटेंट लायब्ररी',
  reelsAlert: {
    title: 'तुम्ही फेसबुकवर पोस्ट केलेले व्हिडिओ आता रील्स आहेत',
    desc: 'तुम्ही तुमचे पूर्वी पोस्ट केलेले व्हिडिओ अजूनही पाहू शकता, परंतु ते रील्स फिल्टर अंतर्गत एकत्रित केले जातील.'
  },
  searchPlaceholder: 'पोस्ट शोधा',
  postsSelected: 'पोस्ट्स निवडल्या',
  noPostsTab: 'कोणत्याही {{tab}} पोस्ट्स आढळल्या नाहीत'
});

if (!mrData.postSearch.actions) mrData.postSearch.actions = {};
mrData.postSearch.actions.dateRange = 'शेवटचे २८ दिवस: १६ मार्च - १३ एप्रिल';

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');
console.log('Successfully patched mr/translation.json with missing postSearch translations');
