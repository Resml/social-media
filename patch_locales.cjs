const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src');

function walkDir(d, callback) {
  fs.readdirSync(d).forEach(f => {
    let dirPath = path.join(d, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(d, f));
  });
}

walkDir(dir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(
      /i18n\.language\.startsWith\('mr'\) \? 'mr-IN' : 'en-GB'/g,
      "i18n.language.startsWith('mr') ? 'mr-IN' : i18n.language.startsWith('hi') ? 'hi-IN' : 'en-GB'"
    );

    content = content.replace(
      /i18n\.language\.startsWith\('mr'\) \? 'mr-IN' : 'en-US'/g,
      "i18n.language.startsWith('mr') ? 'mr-IN' : i18n.language.startsWith('hi') ? 'hi-IN' : 'en-US'"
    );
    
    // Check if we missed any "isMarathi ? 'mr-IN' : 'en-GB'"
    content = content.replace(
      /isMarathi \? 'mr-IN' : 'en-GB'/g,
      "isMarathi ? 'mr-IN' : isHindi ? 'hi-IN' : 'en-GB'"
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Patched dates in', path.basename(filePath));
    }
  }
});

console.log('Done patching dates!');
