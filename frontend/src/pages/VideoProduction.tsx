import React, { useState } from 'react';
import { Plus, X, Clapperboard, Info, CheckCircle, Clock, Scissors, SquareIcon, MonitorX } from 'lucide-react';

type VideoStatus = 'idea' | 'filming' | 'editing' | 'published';
type VideoFormat = 'square' | 'portrait' | 'landscape';

interface VideoEntry {
  id: string; title: string; category: string; duration: number;
  format: VideoFormat; status: VideoStatus; assignee: string; scheduledDate: string; note: string;
}

const VIDEO_CATEGORIES = [
  'Development Work Update',
  'Social Issue Commentary',
  'Cultural Institution Info',
  'Current Events Commentary',
  'Leader Decision Welcome',
  'Motivational Ad',
  'Google Meet + FB Live Recap',
  'Opposition Critique',
  'Documentary (1–2 min)',
  'General Campaign',
];

const WRITERS = ['Harshal Vora','Dr. Amol Pawar','Sagar','Satish Waghmare','Hemant'];

const STATUS: Record<VideoStatus, { bg: string; color: string; label: string; Icon: React.FC<any> }> = {
  idea:      { bg:'var(--slate-100)', color:'var(--slate-600)', label:'Idea',      Icon: Clapperboard  },
  filming:   { bg:'var(--brand-50)',  color:'var(--brand-700)', label:'Filming',   Icon: Clapperboard  },
  editing:   { bg:'var(--brand-100)', color:'var(--brand-800)', label:'Editing',   Icon: Scissors       },
  published: { bg:'var(--brand-100)', color:'var(--brand-900)', label:'Published', Icon: CheckCircle   },
};

const NEXT_STATUS: Record<VideoStatus, VideoStatus> = { idea:'filming', filming:'editing', editing:'published', published:'published' };

const durationLabel = (sec: number) => sec < 60 ? `${sec}s` : `${Math.floor(sec/60)}m ${sec % 60 > 0 ? ` ${sec%60}s` : ''}`.trim();

const durationCheck = (sec: number): { ok: boolean; msg: string; color: string } => {
  if (sec < 60)  return { ok:false, msg:'Too short — aim for 60–90 seconds',     color:'var(--slate-400)' };
  if (sec <= 90) return { ok:true,  msg:'Perfect length — 60–90 seconds',         color:'var(--brand-600)' };
  if (sec <= 120)return { ok:true,  msg:'Good — documentary length (1–2 min)',    color:'var(--brand-500)' };
  if (sec <= 180)return { ok:false, msg:'Getting long — max is 180 seconds',      color:'var(--brand-400)' };
  return           { ok:false, msg:'Too long! Document says: max 180 seconds',    color:'#dc2626'          };
};

const INITIAL: VideoEntry[] = [
  { id:'1', title:'Ward 12 Road Work Progress',    category:'Development Work Update', duration:75,  format:'square', status:'published', assignee:'Harshal Vora',  scheduledDate:'2025-05-10', note:'8k views' },
  { id:'2', title:'Water scarcity commentary',      category:'Social Issue Commentary', duration:60,  format:'square', status:'filming',   assignee:'Dr. Amol Pawar', scheduledDate:'2025-05-15', note:'' },
  { id:'3', title:'Youth empowerment motivational', category:'Motivational Ad',         duration:90,  format:'square', status:'editing',   assignee:'Sagar',          scheduledDate:'2025-05-17', note:'' },
  { id:'4', title:'Hospital expansion plan',        category:'Development Work Update', duration:120, format:'square', status:'idea',      assignee:'Harshal Vora',  scheduledDate:'2025-05-22', note:'Need drone footage' },
];

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

const WRITER_INITIALS = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

export const VideoProduction = () => {
  const [videos, setVideos]     = useState<VideoEntry[]>(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [form, setForm] = useState<Omit<VideoEntry,'id'>>({
    title:'', category:VIDEO_CATEGORIES[0], duration:75, format:'square',
    status:'idea', assignee:WRITERS[0], scheduledDate:'', note:''
  });

  const addVideo = () => {
    if (!form.title) return;
    setVideos(p => [...p, { id:Date.now().toString(), ...form }]);
    setShowForm(false);
    setForm({ title:'', category:VIDEO_CATEGORIES[0], duration:75, format:'square', status:'idea', assignee:WRITERS[0], scheduledDate:'', note:'' });
  };

  const advanceStatus = (id: string) =>
    setVideos(p => p.map(v => v.id === id ? { ...v, status:NEXT_STATUS[v.status] } : v));

  const guidelines = [
    { Icon: Clock,      rule:'Duration',             detail:'60–90 seconds ideal. Max 180 seconds. Never exceed.' },
    { Icon: SquareIcon, rule:'Square Format Only',   detail:'Always make square (1:1) videos. No landscape or portrait.' },
    { Icon: Clapperboard,rule:'Content Types',       detail:'Service updates, social issues, leader decisions, motivational, live recaps.' },
    { Icon: CheckCircle,rule:'Go Live Often',        detail:'Maximize Facebook Live — algorithm gives it higher priority.' },
    { Icon: Clapperboard,rule:'Documentary Ads',     detail:'1–2 min documentary about your work — great for organic reach.' },
    { Icon: Info,       rule:'Commentary Videos',    detail:'Personal social issue commentary — builds trust and engagement.' },
  ];

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'var(--brand-600)' }}>
              <Clapperboard size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ fontFamily:'Outfit,sans-serif', color:'var(--slate-900)' }}>Video Production Tracker</h1>
              <p className="text-sm" style={{ color:'var(--slate-500)' }}>Plan, film and track all videos — square format, 60–90 seconds</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
            <Plus size={16}/> Add Video
          </button>
        </div>

        {/* Guidelines */}
        {showGuide && (
          <div className="bg-white rounded-2xl border p-5 mb-6" style={{ borderColor:'var(--slate-200)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2" style={{ fontFamily:'Outfit,sans-serif', color:'var(--slate-900)' }}>
                <Info size={16} style={{ color:'var(--brand-600)' }}/> Video Guidelines (from document)
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {guidelines.map((g, i) => {
                const GIcon = g.Icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background:'var(--brand-50)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'var(--brand-100)', color:'var(--brand-700)' }}>
                      <GIcon size={15} strokeWidth={2}/>
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color:'var(--slate-900)' }}>{g.rule}</p>
                      <p className="text-xs mt-0.5" style={{ color:'var(--slate-500)' }}>{g.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {(['idea','filming','editing','published'] as VideoStatus[]).map(st => {
            const s = STATUS[st]; const cnt = videos.filter(v => v.status === st).length; const SIcon = s.Icon;
            return (
              <div key={st} className="bg-white rounded-xl border p-4 text-center" style={{ borderColor:'var(--slate-200)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background:s.bg, color:s.color }}>
                  <SIcon size={16} strokeWidth={2}/>
                </div>
                <div className="font-black text-xl" style={{ color:s.color }}>{cnt}</div>
                <div className="text-xs font-bold" style={{ color:'var(--slate-500)' }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Video List */}
        <div className="space-y-3">
          {videos.sort((a,b) => b.scheduledDate.localeCompare(a.scheduledDate)).map(v => {
            const st = STATUS[v.status]; const StIcon = st.Icon;
            const dc = durationCheck(v.duration);
            return (
              <div key={v.id} className="bg-white rounded-2xl border p-5 group transition-all hover:shadow-md" style={{ borderColor:'var(--slate-200)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background:st.bg, color:st.color }}>
                    <StIcon size={20} strokeWidth={2}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background:st.bg, color:st.color }}>{st.label}</span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background:'var(--slate-100)', color:'var(--slate-600)' }}>{v.category}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background:v.format==='square'?'var(--brand-50)':'var(--slate-100)', color:v.format==='square'?'var(--brand-700)':'var(--slate-500)' }}>
                            <SquareIcon size={9}/> {v.format}
                          </span>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background:'var(--slate-50)', color:dc.color }}>
                            {durationLabel(v.duration)}
                          </span>
                        </div>
                        <p className="font-bold" style={{ color:'var(--slate-900)' }}>{v.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black" style={{ background:'var(--brand-600)' }}>
                            {WRITER_INITIALS(v.assignee)}
                          </div>
                          <p className="text-xs" style={{ color:'var(--slate-500)' }}>{v.assignee} {v.scheduledDate && `· ${v.scheduledDate}`}</p>
                        </div>
                        <p className="text-xs mt-1 font-medium" style={{ color:dc.color }}>{dc.msg}</p>
                        {v.note && <p className="text-xs mt-1 italic" style={{ color:'var(--slate-400)' }}>"{v.note}"</p>}
                        {v.format === 'landscape' && (
                          <p className="text-xs mt-1 font-bold flex items-center gap-1" style={{ color:'#dc2626' }}>
                            <MonitorX size={12}/> Document says: avoid landscape format!
                          </p>
                        )}
                      </div>
                      <button onClick={() => setVideos(p => p.filter(x => x.id !== v.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0"><X size={15}/></button>
                    </div>
                    {v.status !== 'published' && (
                      <button onClick={() => advanceStatus(v.id)}
                        className="mt-3 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
                        style={{ background:'var(--brand-50)', color:'var(--brand-700)' }}>
                        Move to {STATUS[NEXT_STATUS[v.status]].label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {videos.length === 0 && (
            <div className="text-center py-16" style={{ color:'var(--slate-400)' }}>
              <Clapperboard size={48} className="mx-auto mb-4 opacity-30"/>
              <p className="font-bold">No videos in pipeline yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ fontFamily:'Outfit,sans-serif', color:'var(--slate-900)' }}>Add Video</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>Title</label>
                <input style={inputStyle} placeholder="Video title…" value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))}/></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>Category</label>
                <select style={{ ...inputStyle, cursor:'pointer' }} value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
                  {VIDEO_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>Duration (seconds)</label>
                  <input type="number" style={inputStyle} value={form.duration} onChange={e => setForm(f => ({ ...f, duration:+e.target.value }))} min={10} max={600}/>
                  <p className="text-[11px] mt-1 font-medium" style={{ color:durationCheck(form.duration).color }}>{durationCheck(form.duration).msg}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>Format</label>
                  <select style={{ ...inputStyle, cursor:'pointer' }} value={form.format} onChange={e => setForm(f => ({ ...f, format:e.target.value as VideoFormat }))}>
                    <option value="square">Square (Recommended)</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape (Avoid)</option>
                  </select>
                  {form.format === 'landscape' && <p className="text-[11px] mt-1 font-bold" style={{ color:'#dc2626' }}>Avoid landscape format!</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>Assignee</label>
                  <select style={{ ...inputStyle, cursor:'pointer' }} value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee:e.target.value }))}>
                    {WRITERS.map(w => <option key={w}>{w}</option>)}</select></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>Scheduled Date</label>
                  <input type="date" style={{ ...inputStyle, cursor:'pointer' }} value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate:e.target.value }))}/></div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>Note</label>
                <input style={inputStyle} placeholder="Any notes…" value={form.note} onChange={e => setForm(f => ({ ...f, note:e.target.value }))}/></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{ borderColor:'var(--slate-200)', color:'var(--slate-600)' }}>Cancel</button>
              <button onClick={addVideo} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{ background:'var(--brand-600)' }}>Add Video</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
