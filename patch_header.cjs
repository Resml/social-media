const fs = require('fs');
const path = require('path');

// 1. Patch translation file
const mrPath = path.join(__dirname, 'frontend/src/locales/mr/translation.json');
let mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

if (!mrData.header.types) {
  mrData.header.types = {
    COMMENT: 'टिप्पणी',
    REPLY: 'उत्तर',
    MENTION: 'उल्लेख',
    MESSAGE: 'संदेश',
    LIKE: 'लाईक',
    SHARE: 'शेअर'
  };
}

fs.writeFileSync(mrPath, JSON.stringify(mrData, null, 2), 'utf8');

// 2. Patch Header.tsx safely
const headerPath = path.join(__dirname, 'frontend/src/components/Header.tsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');

headerContent = headerContent.replace(
  '<span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"\n                                   style={{ background: \'var(--slate-100)\', color: \'var(--slate-500)\' }}>\n                                   {n.type}\n                                 </span>',
  '<span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"\n                                   style={{ background: \'var(--slate-100)\', color: \'var(--slate-500)\' }}>\n                                   {String(t(`header.types.${n.type}`, n.type))}\n                                 </span>'
);

headerContent = headerContent.replace(
  '                                 {meta.icon}\n                                 {n.socialAccount?.platform}\n                               </p>',
  '                                 {meta.icon}\n                                 {String(t(`dashboard.platforms.${n.socialAccount?.platform?.toLowerCase()}`, n.socialAccount?.platform))}\n                               </p>'
);

fs.writeFileSync(headerPath, headerContent, 'utf8');
console.log('Successfully patched Header.tsx and mr/translation.json');
