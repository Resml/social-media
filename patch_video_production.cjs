const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/VideoProduction.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacements
content = content.replace(
  '<Plus size={16}/> Add Video',
  '<Plus size={16}/> {t(\'videoTracker.addVideo\', \'Add Video\')}'
);

content = content.replace(
  '<Info size={16} style={{ color:\'var(--brand-600)\' }}/> Video Guidelines (from document)',
  '<Info size={16} style={{ color:\'var(--brand-600)\' }}/> {t(\'videoTracker.guidelinesTitle\', \'Video Guidelines (from document)\')}'
);

content = content.replace(
  '<p className="text-xs" style={{ color:\'var(--slate-500)\' }}>{v.assignee} {v.scheduledDate && `· ${v.scheduledDate}`}</p>',
  '<p className="text-xs" style={{ color:\'var(--slate-500)\' }}>{String(t(`team.${v.assignee}`, v.assignee))} {v.scheduledDate && `· ${v.scheduledDate}`}</p>'
);

content = content.replace(
  'placeholder="Video title…"',
  'placeholder={String(t(\'videoTracker.form.titlePlaceholder\', \'Video title…\'))}'
);

content = content.replace(
  '{WRITERS.map(w => <option key={w}>{w}</option>)}</select></div>',
  '{WRITERS.map(w => <option key={w} value={w}>{String(t(`team.${w}`, w))}</option>)}</select></div>'
);

content = content.replace(
  'placeholder="Any notes…"',
  'placeholder={String(t(\'videoTracker.form.notePlaceholder\', \'Any notes…\'))}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched VideoProduction.tsx via script');
