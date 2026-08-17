import React, { useState } from 'react';
import { Plus, X, Radio, CheckCircle, Clock, Target, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { LiveTrackerReport } from '../components/LiveTrackerReport';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

type LiveStatus = 'scheduled' | 'live' | 'done' | 'cancelled';

interface LiveSession {
  id: string; topic: string; platform: 'Facebook' | 'Instagram' | 'Both';
  via?: string;
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

export const LiveTracker = () => {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState<LiveSession[]>(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<LiveSession,'id'>>({ topic:'', platform:'Facebook', scheduledAt:'', duration:30, status:'scheduled', notes:'' });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    const toastId = toast.loading('Generating PDF report... Please wait.');
    
    try {
      const element = reportRef.current;
      
      const imgData = await htmlToImage.toPng(element, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        style: { opacity: '1' }
      });
      
      if (!imgData || imgData === 'data:,') {
        toast.error("Failed to capture report. Image is empty.", { id: toastId });
        return;
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`LiveTracker_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Update INITIAL with translations inside component
  React.useEffect(() => {
    setSessions([]);
  }, [t]);

  const addSession = () => {
    if(!form.topic||!form.scheduledAt) return;
    setSessions(p=>[...p,{id:Date.now().toString(),...form}]);
    setShowForm(false);
    setForm({topic:'',platform:'Facebook',via:'Direct',scheduledAt:'',duration:30,status:'scheduled',notes:''});
  };

  const updateStatus = (id:string, status:LiveStatus) => setSessions(p=>p.map(s=>s.id===id?{...s,status}:s));

  const doneCount   = sessions.filter(s=>s.status==='done').length;
  const monthlyGoal = 8;
  const progress    = Math.min(Math.round(doneCount/monthlyGoal*100), 100);

  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <LiveTrackerReport sessions={sessions} />
      </div>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--brand-600)'}}>
              <Radio size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('liveTracker.title', 'Live Video Tracker')}</h1>
              <p className="text-sm" style={{color:'var(--slate-500)'}}>{t('liveTracker.description', 'Schedule and track Facebook Live and Google Meet sessions')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generatePDF} disabled={isGeneratingReport}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`}
              style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : t('dashboard.report.downloadPdf', 'Download PDF')}
            </button>
            <button onClick={()=>setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)'}}>
              <Plus size={16}/> {t('liveTracker.scheduleLive', 'Schedule Live')}
            </button>
          </div>
        </div>

        {/* Goal Card */}
        <div className="bg-white rounded-2xl border p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{borderColor:'var(--slate-200)'}}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{background:'var(--brand-50)', color:'var(--brand-600)'}}>
            <Target size={26} strokeWidth={2}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold" style={{color:'var(--slate-900)'}}>{t('liveTracker.goal.title', 'Monthly Live Goal')}</p>
              <p className="font-black text-lg" style={{color:'var(--brand-600)'}}>{doneCount}/{monthlyGoal}</p>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{background:'var(--slate-100)'}}>
              <div className="h-full rounded-full transition-all" style={{width:`${progress}%`, background:progress>=100?'var(--brand-700)':'var(--brand-500)'}}/>
            </div>
            <p className="text-xs mt-1" style={{color:'var(--slate-500)'}}>{t('liveTracker.goal.subtitle', '{{progress}}% of monthly target · Document says: maximize live videos', { progress })}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(['scheduled','live','done','cancelled'] as LiveStatus[]).map(st=>{
            const s=STATUS_STYLE[st]; const cnt=sessions.filter(x=>x.status===st).length;
            const StIcon = s.Icon;
            return (
              <div key={st} className="bg-white rounded-xl border p-4 text-center" style={{borderColor:'var(--slate-200)'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{background:s.bg, color:s.color}}>
                  <StIcon size={16} strokeWidth={2}/>
                </div>
                <div className="font-black text-xl" style={{color:s.color}}>{cnt}</div>
                <div className="text-xs font-bold" style={{color:'var(--slate-500)'}}>{String(t(`liveTracker.status.${st}`))}</div>
              </div>
            );
          })}
        </div>

        {/* Session List */}
        <div className="space-y-3">
          {sessions.sort((a,b)=>new Date(b.scheduledAt).getTime()-new Date(a.scheduledAt).getTime()).map(s=>{
            const st=STATUS_STYLE[s.status]; const StIcon=st.Icon;
            return (
              <div key={s.id} className="bg-white rounded-2xl border p-5 group transition-all hover:shadow-md" style={{borderColor:'var(--slate-200)'}}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:st.bg, color:st.color}}>
                    <StIcon size={20} strokeWidth={2}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold" style={{color:'var(--slate-900)'}}>{String(t(`liveTracker.mockData.session${s.id}.topic`, s.topic))}</p>
                        <p className="text-xs mt-0.5" style={{color:'var(--slate-500)'}}>
                          {new Date(s.scheduledAt).toLocaleString(i18n.language.startsWith('hi') ? 'hi-IN' : i18n.language.startsWith('mr') ? 'mr-IN' : 'en-US')} · {s.duration} {t('liveTracker.card.min', 'min')} · {String(t(`dashboard.platforms.${s.platform.toLowerCase()}`, s.platform))}
                        </p>
                        {s.notes&&<p className="text-xs mt-1 italic" style={{color:'var(--slate-400)'}}>"{String(t(`liveTracker.mockData.session${s.id}.notes`, s.notes))}"</p>}
                      </div>
                      <button onClick={()=>setSessions(p=>p.filter(x=>x.id!==s.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0"><X size={15}/></button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{background:st.bg, color:st.color}}>{String(t(`liveTracker.status.${s.status}`))}</span>
                      {s.status==='scheduled'&&(
                        <>
                          <button onClick={()=>updateStatus(s.id,'live')} className="text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80" style={{borderColor:'var(--brand-200)',color:'var(--brand-700)',background:'var(--brand-50)'}}>{t('liveTracker.card.markLive', 'Mark Live')}</button>
                          <button onClick={()=>updateStatus(s.id,'done')} className="text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)',background:'var(--slate-50)'}}>{t('liveTracker.card.markDone', 'Mark Done')}</button>
                          <button onClick={()=>updateStatus(s.id,'cancelled')} className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors hover:opacity-80" style={{color:'var(--slate-400)'}}>{t('liveTracker.card.cancel', 'Cancel')}</button>
                        </>
                      )}
                      {s.status==='live'&&(
                        <button onClick={()=>updateStatus(s.id,'done')} className="text-[11px] font-bold px-2.5 py-1 rounded-lg animate-pulse" style={{background:'var(--brand-100)',color:'var(--brand-800)'}}>{t('liveTracker.card.endLive', 'End Live — Mark Done')}</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('liveTracker.form.createTitle', 'Schedule Live Session')}</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.topic', 'Topic')}</label>
                <input style={inputStyle} placeholder={String(t('liveTracker.form.topicPlaceholder', 'What will you talk about?'))} value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))}/></div>
              <div className="grid grid-cols-1 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.platform', 'Platform')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value as any}))}>
                    <option value="Facebook">{String(t('dashboard.platforms.facebook', 'Facebook'))}</option>
                    <option value="Instagram">{String(t('dashboard.platforms.instagram', 'Instagram'))}</option>
                    <option value="Both">{String(t('liveTracker.form.both', 'Both'))}</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.dateTime', 'Date & Time')}</label>
                  <input type="datetime-local" style={{...inputStyle,cursor:'pointer'}} value={form.scheduledAt} onChange={e=>setForm(f=>({...f,scheduledAt:e.target.value}))}/></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.duration', 'Duration (min)')}</label>
                  <input type="number" style={inputStyle} value={form.duration} onChange={e=>setForm(f=>({...f,duration:+e.target.value}))} min={5} max={180}/></div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('liveTracker.form.notes', 'Notes')}</label>
                <input style={inputStyle} placeholder={String(t('liveTracker.form.notesPlaceholder', 'Any notes…'))} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>{t('liveTracker.form.cancel', 'Cancel')}</button>
              <button onClick={addSession} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>{t('liveTracker.form.submit', 'Schedule Live')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
