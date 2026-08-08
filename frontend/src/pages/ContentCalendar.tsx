import React, { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Calendar, Gift, Star, Scale, BarChart2, Megaphone, RefreshCw, Radio, AlignLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Category = 'birthday' | 'festival' | 'social' | 'poll' | 'campaign' | 'repost' | 'live';
type Status = 'draft' | 'ready' | 'posted';

interface CalendarEntry {
  id: string; date: number; month: number; year: number;
  category: Category; title: string; assignee: string; status: Status;
}

const CATEGORIES: { id: Category; label: string; Icon: React.FC<any>; color: string; bg: string; border: string }[] = [
  { id: 'birthday', label: 'Birthday / Anniversary', Icon: Gift,       color: 'var(--brand-800)', bg: 'var(--brand-100)', border: 'var(--brand-200)' },
  { id: 'festival', label: 'Festival / National Day',  Icon: Star,       color: 'var(--brand-700)', bg: 'var(--brand-50)',  border: 'var(--brand-100)' },
  { id: 'social',   label: 'Social Issue',             Icon: Scale,      color: 'var(--slate-700)', bg: 'var(--slate-100)', border: 'var(--slate-200)' },
  { id: 'poll',     label: 'Poll / Reaction',          Icon: BarChart2,  color: 'var(--brand-600)', bg: 'var(--brand-50)',  border: 'var(--brand-200)' },
  { id: 'campaign', label: 'Campaign / Ad',            Icon: Megaphone,  color: 'var(--brand-900)', bg: 'var(--brand-100)', border: 'var(--brand-300)' },
  { id: 'repost',   label: 'Repost',                   Icon: RefreshCw,  color: 'var(--slate-600)', bg: 'var(--slate-50)',  border: 'var(--slate-200)' },
  { id: 'live',     label: 'Live Video',               Icon: Radio,      color: 'var(--brand-700)', bg: 'var(--brand-100)', border: 'var(--brand-200)' },
];

const TEAM = ['Harshal Vora', 'Dr. Amol Pawar', 'Sagar'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const statusStyle: Record<Status, { bg: string; color: string }> = {
  draft:  { bg: 'var(--slate-100)', color: 'var(--slate-600)' },
  ready:  { bg: 'var(--brand-50)',  color: 'var(--brand-700)' },
  posted: { bg: 'var(--brand-600)', color: '#fff' },
};

const INITIAL: CalendarEntry[] = [
  { id:'1', date:1,  month:4, year:2025, category:'festival',  title:'Maharashtra Day',           assignee:'Harshal Vora',  status:'posted' },
  { id:'2', date:5,  month:4, year:2025, category:'birthday',  title:'Ambedkar Jayanti post',     assignee:'Harshal Vora',  status:'posted' },
  { id:'3', date:10, month:4, year:2025, category:'social',    title:'Water crisis awareness',    assignee:'Dr. Amol Pawar', status:'ready'  },
  { id:'4', date:14, month:4, year:2025, category:'poll',      title:'Development poll',          assignee:'Sagar',         status:'draft'  },
  { id:'5', date:18, month:4, year:2025, category:'live',      title:'Town hall live',            assignee:'Dr. Amol Pawar', status:'ready'  },
  { id:'6', date:22, month:4, year:2025, category:'campaign',  title:'Paid Facebook Ad',          assignee:'Sagar',         status:'draft'  },
  { id:'7', date:28, month:4, year:2025, category:'repost',    title:'Road work update repost',   assignee:'Harshal Vora',  status:'draft'  },
];

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

export const ContentCalendar = () => {
  const { t } = useTranslation();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [entries, setEntries]     = useState<CalendarEntry[]>(INITIAL);
  const [showForm, setShowForm]   = useState(false);
  const [selDate,  setSelDate]    = useState<number>(today.getDate());
  const [form, setForm] = useState({ title:'', category:'birthday' as Category, assignee:TEAM[0], status:'draft' as Status });

  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonth   = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth   = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const dayEntries  = (d:number) => entries.filter(e=>e.date===d&&e.month===viewMonth&&e.year===viewYear);
  const catOf       = (id:Category) => CATEGORIES.find(c=>c.id===id)!;

  const addEntry = () => {
    if (!form.title) return;
    setEntries(p=>[...p,{id:Date.now().toString(), date:selDate, month:viewMonth, year:viewYear, ...form}]);
    setShowForm(false);
    setForm({title:'', category:'birthday', assignee:TEAM[0], status:'draft'});
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--brand-600)'}}>
              <Calendar size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('calendar.title', 'Content Calendar')}</h1>
              <p className="text-sm" style={{color:'var(--slate-500)'}}>{t('calendar.subtitle', 'Plan daily posts by category and assign to team members')}</p>
            </div>
          </div>
          <button onClick={()=>{setSelDate(today.getDate());setShowForm(true);}}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)'}}>
            <Plus size={16}/> {t('calendar.addEntryBtn', 'Add Entry')}
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map(c=>{
            const CatIcon = c.Icon;
            return (
              <span key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
                style={{background:c.bg, color:c.color, borderColor:c.border}}>
                <CatIcon size={12} strokeWidth={2}/> {String(t(`calendar.categories.${c.id}`, c.label))}
              </span>
            );
          })}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl border p-5 mb-6" style={{borderColor:'var(--slate-200)', boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><ChevronLeft size={20}/></button>
            <h2 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{String(t(`calendar.months.${viewMonth}`, MONTHS[viewMonth]))} {viewYear}</h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><ChevronRight size={20}/></button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d,i)=><div key={d} className="text-center text-xs font-bold uppercase tracking-widest py-2" style={{color:'var(--slate-400)'}}>{String(t(`calendar.days.${i}`, d))}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day=i+1;
              const de=dayEntries(day);
              const isToday=day===today.getDate()&&viewMonth===today.getMonth()&&viewYear===today.getFullYear();
              return (
                <div key={day} onClick={()=>{setSelDate(day);setShowForm(true);}}
                  className="min-h-[76px] rounded-xl p-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{border:isToday?'2px solid var(--brand-500)':'1px solid var(--slate-100)', background:isToday?'var(--brand-50)':'#fff'}}>
                  <div className="text-xs font-bold mb-1 text-right" style={{color:isToday?'var(--brand-600)':'var(--slate-400)'}}>{day}</div>
                  {de.slice(0,2).map(e=>{
                    const cat=catOf(e.category);
                    const CatIcon=cat.Icon;
                    return (
                      <div key={e.id} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md mb-0.5 flex items-center gap-1 justify-between group"
                        style={{background:cat.bg, color:cat.color}} onClick={ev=>ev.stopPropagation()}>
                        <span className="flex items-center gap-1 truncate"><CatIcon size={9} strokeWidth={2}/> {e.title}</span>
                        <button onClick={()=>setEntries(p=>p.filter(x=>x.id!==e.id))} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><X size={9}/></button>
                      </div>
                    );
                  })}
                  {de.length>2&&<div className="text-[9px] font-bold text-center" style={{color:'var(--slate-400)'}}>+{de.length-2}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border p-5" style={{borderColor:'var(--slate-200)'}}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-800)'}}>
            <AlignLeft size={16} style={{color:'var(--brand-600)'}}/> {t('calendar.thisMonthsEntries', "This Month's Entries")}
          </h3>
          <div className="space-y-2">
            {entries.filter(e=>e.month===viewMonth&&e.year===viewYear).sort((a,b)=>a.date-b.date).map(e=>{
              const cat=catOf(e.category); const st=statusStyle[e.status]; const CatIcon=cat.Icon;
              return (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{borderColor:'var(--slate-100)'}}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:cat.bg, color:cat.color}}>
                    <CatIcon size={16} strokeWidth={2}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{color:'var(--slate-900)'}}>{e.title}</p>
                    <p className="text-xs" style={{color:'var(--slate-500)'}}>{String(t(`calendar.months.${e.month}`, MONTHS[e.month]))} {e.date} · {String(t(`calendar.team.${e.assignee}`, e.assignee))}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0" style={{background:st.bg, color:st.color}}>{String(t(`calendar.status.${e.status}`, e.status))}</span>
                  <button onClick={()=>setEntries(p=>p.filter(x=>x.id!==e.id))} className="text-slate-300 hover:text-red-400 transition-colors"><X size={15}/></button>
                </div>
              );
            })}
            {entries.filter(e=>e.month===viewMonth&&e.year===viewYear).length===0&&(
              <p className="text-sm italic text-center py-6" style={{color:'var(--slate-400)'}}>{t('calendar.noEntries', 'No entries this month. Click a date to add one.')}</p>
            )}
          </div>
        </div>
      </div>

      {showForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('calendar.addEntryModalTitle', { month: String(t(`calendar.months.${viewMonth}`, MONTHS[viewMonth])), date: selDate })}</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('calendar.form.title', 'Title')}</label>
                <input style={inputStyle} placeholder={String(t('calendar.form.titlePlaceholder', 'Post title or topic…'))} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('calendar.form.category', 'Category')}</label>
                <select style={{...inputStyle,cursor:'pointer'}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value as Category}))}>
                  {CATEGORIES.map(c=><option key={c.id} value={c.id}>{String(t(`calendar.categories.${c.id}`, c.label))}</option>)}</select></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('calendar.form.assignTo', 'Assign To')}</label>
                <select style={{...inputStyle,cursor:'pointer'}} value={form.assignee} onChange={e=>setForm(f=>({...f,assignee:e.target.value}))}>
                  {TEAM.map(m=><option key={m} value={m}>{String(t(`calendar.team.${m}`, m))}</option>)}</select></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('calendar.form.status', 'Status')}</label>
                <select style={{...inputStyle,cursor:'pointer'}} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as Status}))}>
                  <option value="draft">{String(t('calendar.status.draft', 'Draft'))}</option><option value="ready">{String(t('calendar.status.ready', 'Ready'))}</option><option value="posted">{String(t('calendar.status.posted', 'Posted'))}</option></select></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border transition-colors hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>{t('calendar.form.cancel', 'Cancel')}</button>
              <button onClick={addEntry} className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>{t('calendar.form.submit', 'Add to Calendar')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
