const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/LiveTracker.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacement = `import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

type LiveStatus = 'scheduled' | 'live' | 'done' | 'cancelled';

interface LiveSession {
  id: string; topic: string; platform: 'Facebook' | 'Instagram' | 'Both';
  scheduledAt: string; duration: number;
  status: LiveStatus; notes: string;
}

const STATUS_STYLE: Record<LiveStatus, { bg: string; color: string; Icon: React.FC<any> }> = {
  scheduled: { bg: 'var(--brand-50)',  color: 'var(--brand-700)', Icon: Clock },
  live:      { bg: 'var(--brand-100)', color: 'var(--brand-800)', Icon: Radio },
  done:      { bg: 'var(--slate-100)', color: 'var(--slate-700)', Icon: CheckCircle },
  cancelled: { bg: 'var(--slate-50)',  color: 'var(--slate-400)', Icon: X },
};

const INITIAL: LiveSession[] = [
  { id:'1', topic:'Ward development progress update',  platform:'Facebook', scheduledAt:'2025-05-10T19:00', duration:30, status:'done',      notes:'Good turnout' },
  { id:'2', topic:'Water crisis: open discussion',     platform:'Facebook', scheduledAt:'2025-05-18T20:00', duration:45, status:'scheduled', notes:'' },
  { id:'3', topic:'Social cultural event highlights',  platform:'Both',     scheduledAt:'2025-05-22T18:30', duration:20, status:'scheduled', notes:'' },
  { id:'4', topic:'Road work inspection live',         platform:'Facebook', scheduledAt:'2025-04-28T17:00', duration:15, status:'done',      notes:'Shared to group' },
];

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

export const LiveTracker = () => {`;

content = content.replace(
  /import { LiveTrackerReport } from '\.\.\/components\/LiveTrackerReport';[\s\S]*?export const LiveTracker = \(\) => {/,
  `import { LiveTrackerReport } from '../components/LiveTrackerReport';\n${replacement}`
);

fs.writeFileSync(filePath, content, 'utf8');
