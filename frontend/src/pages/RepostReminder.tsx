import React, { useState } from 'react';
import { Plus, X, RefreshCw, Clock, CheckCircle, Info } from 'lucide-react';

interface RepostItem {
  id: string; content: string; originalDate: string;
  platform: string; category: string; repostedDate?: string;
}

const daysSince = (d: string) => Math.floor((Date.now()-new Date(d).getTime())/(1000*60*60*24));

const INITIAL: RepostItem[] = [
  { id:'1', content:'Road work underway in Ward 12 — update from the site!',            originalDate:'2025-04-10', platform:'Facebook', category:'Campaign' },
  { id:'2', content:'Ambedkar Jayanti celebration at community center.',                  originalDate:'2025-04-14', platform:'Facebook', category:'Birthday Post', repostedDate:'2025-05-01' },
  { id:'3', content:'Our promise: safe drinking water for every household by June 2025.', originalDate:'2025-04-05', platform:'Facebook', category:'Social Issue' },
  { id:'4', content:'Join us for the free health camp this Sunday!',                       originalDate:'2025-04-28', platform:'Instagram', category:'Campaign' },
  { id:'5', content:'Youth skill development workshop — registrations open!',              originalDate:'2025-04-20', platform:'Facebook', category:'Campaign' },
];

const CATEGORIES = ['Birthday Post','Festival','Social Issue','Campaign','Live Recap','General'];
const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

export const RepostReminder = () => {
  const [items, setItems]       = useState<RepostItem[]>(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ content:'', originalDate:'', platform:'Facebook', category:CATEGORIES[0] });

  const addItem       = () => { if(!form.content||!form.originalDate)return; setItems(p=>[{id:Date.now().toString(),...form},...p]); setShowForm(false); setForm({content:'',originalDate:'',platform:'Facebook',category:CATEGORIES[0]}); };
  const markReposted  = (id:string) => setItems(p=>p.map(x=>x.id===id?{...x,repostedDate:new Date().toISOString().slice(0,10)}:x));
  const eligible      = (item:RepostItem) => !item.repostedDate&&daysSince(item.originalDate)>=15;
  const tooSoon       = (item:RepostItem) => !item.repostedDate&&daysSince(item.originalDate)<15;
  const daysLeft      = (item:RepostItem) => 15-daysSince(item.originalDate);

  const eligibleCount = items.filter(eligible).length;

  return (
    <div className="flex-1 overflow-y-auto" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--brand-600)'}}>
              <RefreshCw size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>Repost Reminder</h1>
              <p className="text-sm" style={{color:'var(--slate-500)'}}>Track posts eligible for repost — minimum 15-day gap required</p>
            </div>
          </div>
          <button onClick={()=>setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)'}}>
            <Plus size={16}/> Add Post
          </button>
        </div>

        {/* Rule Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl mb-6" style={{background:'var(--brand-50)', border:'1px solid var(--brand-100)'}}>
          <Info size={18} className="shrink-0 mt-0.5" style={{color:'var(--brand-600)'}}/>
          <div>
            <p className="font-bold text-sm" style={{color:'var(--brand-800)'}}>15-Day Repost Rule (from the document)</p>
            <p className="text-xs mt-0.5" style={{color:'var(--brand-700)'}}>
              Facebook shows posts to only 5–7% of followers. Repost important content after at least 15 days to reach more people.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {label:'Eligible to Repost', value:eligibleCount,                              Icon:CheckCircle, color:'var(--brand-700)', bg:'var(--brand-50)'},
            {label:'Too Soon',            value:items.filter(tooSoon).length,               Icon:Clock,       color:'var(--slate-600)', bg:'var(--slate-100)'},
            {label:'Already Reposted',    value:items.filter(x=>x.repostedDate).length,    Icon:RefreshCw,   color:'var(--brand-500)', bg:'var(--brand-50)'},
          ].map(s=>{
            const SIcon=s.Icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border p-4 text-center" style={{borderColor:'var(--slate-200)'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{background:s.bg, color:s.color}}>
                  <SIcon size={16} strokeWidth={2}/>
                </div>
                <div className="font-black text-2xl mb-0.5" style={{color:s.color}}>{s.value}</div>
                <div className="text-xs font-bold" style={{color:'var(--slate-500)'}}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Eligible */}
        {eligibleCount>0&&(
          <div className="mb-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{color:'var(--brand-700)'}}>
              <CheckCircle size={16}/> Ready to Repost ({eligibleCount})
            </h3>
            <div className="space-y-3">
              {items.filter(eligible).map(item=>(
                <div key={item.id} className="bg-white rounded-2xl border-2 p-4 group transition-all hover:shadow-md" style={{borderColor:'var(--brand-200)'}}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:'var(--brand-50)', color:'var(--brand-600)'}}>
                      <CheckCircle size={18} strokeWidth={2}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{color:'var(--slate-900)'}}>{item.content}</p>
                      <p className="text-xs mt-1" style={{color:'var(--slate-500)'}}>Originally posted: {item.originalDate} · {daysSince(item.originalDate)} days ago · {item.platform} · {item.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={()=>markReposted(item.id)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
                        style={{background:'var(--brand-600)'}}>
                        <RefreshCw size={12}/> Repost Now
                      </button>
                      <button onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"><X size={14}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Too Soon */}
        {items.filter(tooSoon).length>0&&(
          <div className="mb-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{color:'var(--slate-600)'}}>
              <Clock size={16}/> Waiting — Too Soon ({items.filter(tooSoon).length})
            </h3>
            <div className="space-y-3">
              {items.filter(tooSoon).map(item=>(
                <div key={item.id} className="bg-white rounded-2xl border p-4 group" style={{borderColor:'var(--slate-200)'}}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:'var(--slate-100)', color:'var(--slate-500)'}}>
                      <Clock size={18} strokeWidth={2}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{color:'var(--slate-900)'}}>{item.content}</p>
                      <p className="text-xs mt-1" style={{color:'var(--slate-500)'}}>{item.originalDate} · {daysSince(item.originalDate)} days ago · {item.platform}</p>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="font-black text-xl" style={{color:'var(--brand-600)'}}>{daysLeft(item)}</div>
                      <div className="text-[10px] font-bold" style={{color:'var(--slate-500)'}}>days left</div>
                    </div>
                    <button onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"><X size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reposted */}
        {items.filter(x=>x.repostedDate).length>0&&(
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{color:'var(--slate-500)'}}>
              <RefreshCw size={16}/> Already Reposted
            </h3>
            <div className="space-y-2">
              {items.filter(x=>x.repostedDate).map(item=>(
                <div key={item.id} className="bg-white rounded-xl border p-3 opacity-60 group flex items-center gap-3" style={{borderColor:'var(--slate-100)'}}>
                  <RefreshCw size={16} style={{color:'var(--slate-400)', flexShrink:0}}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{color:'var(--slate-700)'}}>{item.content}</p>
                    <p className="text-xs" style={{color:'var(--slate-400)'}}>Reposted: {item.repostedDate}</p>
                  </div>
                  <button onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"><X size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>Add Post to Tracker</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>Post Content</label>
                <textarea style={{...inputStyle,resize:'none'} as React.CSSProperties} rows={3} placeholder="Paste your post content…" value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>Original Post Date</label>
                  <input type="date" style={{...inputStyle,cursor:'pointer'}} value={form.originalDate} onChange={e=>setForm(f=>({...f,originalDate:e.target.value}))}/></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>Platform</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
                    <option>Facebook</option><option>Instagram</option><option>Twitter</option></select></div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>Category</label>
                <select style={{...inputStyle,cursor:'pointer'}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>Cancel</button>
              <button onClick={addItem} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>Add to Tracker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
