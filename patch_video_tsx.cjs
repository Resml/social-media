const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/VideoProduction.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add import
code = code.replace(
  "import { Plus, X, Clapperboard, Info, CheckCircle, Clock, Scissors, SquareIcon, MonitorX } from 'lucide-react';",
  "import { Plus, X, Clapperboard, Info, CheckCircle, Clock, Scissors, SquareIcon, MonitorX } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';"
);

// 2. Change durationCheck
code = code.replace(
  "const durationCheck = (sec: number): { ok: boolean; msg: string; color: string } => {",
  "const durationCheck = (sec: number, t: any): { ok: boolean; msg: string; color: string } => {"
);
code = code.replace(
  "if (sec < 60)  return { ok:false, msg:'Too short — aim for 60–90 seconds',     color:'var(--slate-400)' };",
  "if (sec < 60)  return { ok:false, msg:String(t('videoTracker.durationMsgs.tooShort', 'Too short — aim for 60–90 seconds')), color:'var(--slate-400)' };"
);
code = code.replace(
  "if (sec <= 90) return { ok:true,  msg:'Perfect length — 60–90 seconds',         color:'var(--brand-600)' };",
  "if (sec <= 90) return { ok:true,  msg:String(t('videoTracker.durationMsgs.perfect', 'Perfect length — 60–90 seconds')), color:'var(--brand-600)' };"
);
code = code.replace(
  "if (sec <= 120)return { ok:true,  msg:'Good — documentary length (1–2 min)',    color:'var(--brand-500)' };",
  "if (sec <= 120)return { ok:true,  msg:String(t('videoTracker.durationMsgs.good', 'Good — documentary length (1–2 min)')), color:'var(--brand-500)' };"
);
code = code.replace(
  "if (sec <= 180)return { ok:false, msg:'Getting long — max is 180 seconds',      color:'var(--brand-400)' };",
  "if (sec <= 180)return { ok:false, msg:String(t('videoTracker.durationMsgs.gettingLong', 'Getting long — max is 180 seconds')), color:'var(--brand-400)' };"
);
code = code.replace(
  "return           { ok:false, msg:'Too long! Document says: max 180 seconds',    color:'#dc2626'          };",
  "return           { ok:false, msg:String(t('videoTracker.durationMsgs.tooLong', 'Too long! Document says: max 180 seconds')), color:'#dc2626' };"
);

// 3. Add useTranslation hook inside component and translate guidelines
// Using regular expression to avoid newline mismatch issues
code = code.replace(
  /export const VideoProduction = \(\) => \{\s+const \[videos/g,
  "export const VideoProduction = () => {\n  const { t } = useTranslation();\n  const [videos"
);

code = code.replace(
  "rule:'Duration',             detail:'60–90 seconds ideal. Max 180 seconds. Never exceed.'",
  "rule:String(t('videoTracker.guidelines.rule1', 'Duration')),             detail:String(t('videoTracker.guidelines.detail1', '60–90 seconds ideal. Max 180 seconds. Never exceed.'))"
);
code = code.replace(
  "rule:'Square Format Only',   detail:'Always make square (1:1) videos. No landscape or portrait.'",
  "rule:String(t('videoTracker.guidelines.rule2', 'Square Format Only')),   detail:String(t('videoTracker.guidelines.detail2', 'Always make square (1:1) videos. No landscape or portrait.'))"
);
code = code.replace(
  "rule:'Content Types',       detail:'Service updates, social issues, leader decisions, motivational, live recaps.'",
  "rule:String(t('videoTracker.guidelines.rule3', 'Content Types')),       detail:String(t('videoTracker.guidelines.detail3', 'Service updates, social issues, leader decisions, motivational, live recaps.'))"
);
code = code.replace(
  "rule:'Go Live Often',        detail:'Maximize Facebook Live — algorithm gives it higher priority.'",
  "rule:String(t('videoTracker.guidelines.rule4', 'Go Live Often')),        detail:String(t('videoTracker.guidelines.detail4', 'Maximize Facebook Live — algorithm gives it higher priority.'))"
);
code = code.replace(
  "rule:'Documentary Ads',     detail:'1–2 min documentary about your work — great for organic reach.'",
  "rule:String(t('videoTracker.guidelines.rule5', 'Documentary Ads')),     detail:String(t('videoTracker.guidelines.detail5', '1–2 min documentary about your work — great for organic reach.'))"
);
code = code.replace(
  "rule:'Commentary Videos',    detail:'Personal social issue commentary — builds trust and engagement.'",
  "rule:String(t('videoTracker.guidelines.rule6', 'Commentary Videos')),    detail:String(t('videoTracker.guidelines.detail6', 'Personal social issue commentary — builds trust and engagement.'))"
);

// 4. Update Header
code = code.replace(
  "Video Production Tracker</h1>",
  "{t('videoTracker.title', 'Video Production Tracker')}</h1>"
);
code = code.replace(
  ">Plan, film and track all videos — square format, 60–90 seconds</p>",
  ">{t('videoTracker.subtitle', 'Plan, film and track all videos — square format, 60–90 seconds')}</p>"
);
code = code.replace(
  ">Add Video\n          </button>",
  ">{t('videoTracker.addVideo', 'Add Video')}\n          </button>"
);
code = code.replace(
  />Add Video<\/button>/g,
  ">{t('videoTracker.form.submit', 'Add Video')}</button>"
);
code = code.replace(
  "Video Guidelines (from document)\n              </h3>",
  "{t('videoTracker.guidelinesTitle', 'Video Guidelines (from document)')}\n              </h3>"
);

// 5. Stats area
code = code.replace(
  ">{s.label}</div>",
  ">{String(t(`videoTracker.status.${st}`, s.label))}</div>"
);

// 6. List Items
code = code.replace(
  "const dc = durationCheck(v.duration);",
  "const dc = durationCheck(v.duration, t);"
);
code = code.replace(
  ">{st.label}</span>",
  ">{String(t(`videoTracker.status.${v.status}`, st.label))}</span>"
);
code = code.replace(
  ">{v.category}</span>",
  ">{String(t(`videoTracker.categories.${v.category}`, v.category))}</span>"
);
code = code.replace(
  "<SquareIcon size={9}/> {v.format}",
  "<SquareIcon size={9}/> {String(t(`videoTracker.formats.${v.format}`, v.format))}"
);
code = code.replace(
  ">{v.title}</p>",
  ">{String(t(`videoTracker.mockData.v${v.id}.title`, v.title))}</p>"
);
code = code.replace(
  ">\"{v.note}\"</p>",
  ">\"{String(t(`videoTracker.mockData.v${v.id}.note`, v.note))}\"</p>"
);
code = code.replace(
  "<MonitorX size={12}/> Document says: avoid landscape format!",
  "<MonitorX size={12}/> {t('videoTracker.documentSaysLandscape', 'Document says: avoid landscape format!')}"
);
code = code.replace(
  "Move to {STATUS[NEXT_STATUS[v.status]].label}",
  "{t('videoTracker.moveTo', 'Move to')} {String(t(`videoTracker.status.${NEXT_STATUS[v.status]}`, STATUS[NEXT_STATUS[v.status]].label))}"
);
code = code.replace(
  ">No videos in pipeline yet.</p>",
  ">{t('videoTracker.noVideos', 'No videos in pipeline yet.')}</p>"
);

// 7. Modal Form
code = code.replace(
  ">Add Video</h3>",
  ">{t('videoTracker.form.addTitle', 'Add Video')}</h3>"
);
code = code.replace(
  ">Title</label>",
  ">{t('videoTracker.form.titleLabel', 'Title')}</label>"
);
code = code.replace(
  ">Category</label>",
  ">{t('videoTracker.form.categoryLabel', 'Category')}</label>"
);
code = code.replace(
  ">{c}</option>)}</select></div>",
  "value={c}>{String(t(`videoTracker.categories.${c}`, c))}</option>)}</select></div>"
);
code = code.replace(
  ">Duration (seconds)</label>",
  ">{t('videoTracker.form.durationLabel', 'Duration (seconds)')}</label>"
);
code = code.replace(
  "color:durationCheck(form.duration).color }}>{durationCheck(form.duration).msg}</p>",
  "color:durationCheck(form.duration, t).color }}>{durationCheck(form.duration, t).msg}</p>"
);
code = code.replace(
  ">Format</label>",
  ">{t('videoTracker.form.formatLabel', 'Format')}</label>"
);
code = code.replace(
  "<option value=\"square\">Square (Recommended)</option>",
  "<option value=\"square\">{String(t('videoTracker.formats.square', 'Square (Recommended)'))}</option>"
);
code = code.replace(
  "<option value=\"portrait\">Portrait</option>",
  "<option value=\"portrait\">{String(t('videoTracker.formats.portrait', 'Portrait'))}</option>"
);
code = code.replace(
  "<option value=\"landscape\">Landscape (Avoid)</option>",
  "<option value=\"landscape\">{String(t('videoTracker.formats.landscape', 'Landscape (Avoid)'))}</option>"
);
code = code.replace(
  ">Avoid landscape format!</p>",
  ">{t('videoTracker.documentSaysLandscape', 'Avoid landscape format!')}</p>"
);
code = code.replace(
  ">Assignee</label>",
  ">{t('videoTracker.form.assigneeLabel', 'Assignee')}</label>"
);
code = code.replace(
  ">Scheduled Date</label>",
  ">{t('videoTracker.form.scheduledDateLabel', 'Scheduled Date')}</label>"
);
code = code.replace(
  ">Note</label>",
  ">{t('videoTracker.form.noteLabel', 'Note')}</label>"
);
code = code.replace(
  ">Cancel</button>",
  ">{t('videoTracker.form.cancel', 'Cancel')}</button>"
);
// note: Add Video button replacement handled above using regex

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully patched VideoProduction.tsx');
