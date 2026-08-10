const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, 'frontend/src/components/Header.tsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');

// Using regex or exact lines
headerContent = headerContent.replace(
  '{n.type}',
  '{String(t(`header.types.${n.type}`, n.type))}'
);

headerContent = headerContent.replace(
  '{n.socialAccount?.platform}',
  '{String(t(`dashboard.platforms.${n.socialAccount?.platform?.toLowerCase()}`, n.socialAccount?.platform))}'
);

fs.writeFileSync(headerPath, headerContent, 'utf8');
console.log('Successfully patched Header.tsx (Attempt 2)');
