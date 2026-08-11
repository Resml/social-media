import React, { useState } from 'react';
import { Plus, X, BarChart2, ThumbsUp, TrendingUp, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { PollReport } from '../components/PollReport';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface PollOption { id: string; text: string; votes: number; }
interface Poll {
  id: string; question: string; options: PollOption[];
  platform: string; status: 'active' | 'closed'; createdAt: string; totalVotes: number;
}

const INITIAL_POLLS: Poll[] = [
  { id:'1', question:'Which ward development work should we prioritize?', platform:'Facebook', status:'active', createdAt:'2025-05-10', totalVotes:342,
    options:[{id:'a',text:'Road repair',votes:158},{id:'b',text:'Water supply',votes:112},{id:'c',text:'Street lights',votes:72}] },
  { id:'2', question:'Are you satisfied with our work this year?', platform:'Facebook', status:'closed', createdAt:'2025-04-20', totalVotes:521,
    options:[{id:'a',text:'Very satisfied',votes:230},{id:'b',text:'Somewhat satisfied',votes:189},{id:'c',text:'Not satisfied',votes:102}] },
  { id:'3', question:'Which social issue concerns you most?', platform:'Instagram', status:'active', createdAt:'2025-05-14', totalVotes:87,
    options:[{id:'a',text:'Unemployment',votes:41},{id:'b',text:'Education',votes:28},{id:'c',text:'Health',votes:18}] },
];

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

export const PollManager = () => {
  const { t } = useTranslation();
  const [polls, setPolls]       = useState<Poll[]>(INITIAL_POLLS);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [opts, setOpts]         = useState(['','','']);
  const [platform, setPlatform] = useState('Facebook');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    
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
      pdf.save(`Poll_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  React.useEffect(() => {
    setPolls([
      { id:'1', question:String(t('pollManager.mockData.poll1.question', 'Which ward development work should we prioritize?')), platform:'Facebook', status:'active', createdAt:'2025-05-10', totalVotes:342,
        options:[{id:'a',text:String(t('pollManager.mockData.poll1.opta', 'Road repair')),votes:158},{id:'b',text:String(t('pollManager.mockData.poll1.optb', 'Water supply')),votes:112},{id:'c',text:String(t('pollManager.mockData.poll1.optc', 'Street lights')),votes:72}] },
      { id:'2', question:String(t('pollManager.mockData.poll2.question', 'Are you satisfied with our work this year?')), platform:'Facebook', status:'closed', createdAt:'2025-04-20', totalVotes:521,
        options:[{id:'a',text:String(t('pollManager.mockData.poll2.opta', 'Very satisfied')),votes:230},{id:'b',text:String(t('pollManager.mockData.poll2.optb', 'Somewhat satisfied')),votes:189},{id:'c',text:String(t('pollManager.mockData.poll2.optc', 'Not satisfied')),votes:102}] },
      { id:'3', question:String(t('pollManager.mockData.poll3.question', 'Which social issue concerns you most?')), platform:'Instagram', status:'active', createdAt:'2025-05-14', totalVotes:87,
        options:[{id:'a',text:String(t('pollManager.mockData.poll3.opta', 'Unemployment')),votes:41},{id:'b',text:String(t('pollManager.mockData.poll3.optb', 'Education')),votes:28},{id:'c',text:String(t('pollManager.mockData.poll3.optc', 'Health')),votes:18}] },
    ]);
  }, [t]);

  const addOption  = () => { if(opts.length<4) setOpts(p=>[...p,'']); };
  const removeOption=(i:number)=>{ if(opts.length>2) setOpts(p=>p.filter((_,idx)=>idx!==i)); };

  const createPoll = () => {
    if(!question||opts.filter(o=>o.trim()).length<2) return;
    setPolls(p=>[{id:Date.now().toString(), question, platform, status:'active', createdAt:new Date().toISOString().slice(0,10), totalVotes:0, options:opts.filter(o=>o.trim()).map((text,i)=>({id:String(i),text,votes:0}))},...p]);
    setShowForm(false); setQuestion(''); setOpts(['','','']); setPlatform('Facebook');
  };

  const toggleStatus = (id:string) => setPolls(p=>p.map(pl=>pl.id===id?{...pl,status:pl.status==='active'?'closed':'active'}:pl));

  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <PollReport polls={polls} />
      </div>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--brand-600)'}}>
              <BarChart2 size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('pollManager.title', 'Poll Manager')}</h1>
              <p className="text-sm" style={{color:'var(--slate-500)'}}>{t('pollManager.description', 'Create and track audience engagement polls')}</p>
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
              <Plus size={16}/> {t('pollManager.createPoll', 'Create Poll')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {label:String(t('pollManager.stats.totalPolls', 'Total Polls')),   value:polls.length,                                Icon: BarChart2,   color:'var(--brand-700)', bg:'var(--brand-50)'},
            {label:String(t('pollManager.stats.activePolls', 'Active Polls')),  value:polls.filter(p=>p.status==='active').length,  Icon: TrendingUp,  color:'var(--brand-600)', bg:'var(--brand-50)'},
            {label:String(t('pollManager.stats.totalVotes', 'Total Votes')),   value:polls.reduce((a,p)=>a+p.totalVotes,0).toLocaleString(), Icon: ThumbsUp, color:'var(--brand-800)', bg:'var(--brand-100)'},
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

        {/* Poll list */}
        <div className="space-y-4">
          {polls.map(poll=>{
            const maxVotes=Math.max(...poll.options.map(o=>o.votes),1);
            return (
              <div key={poll.id} className="bg-white rounded-2xl border p-5 group transition-all hover:shadow-md" style={{borderColor:'var(--slate-200)'}}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{background:poll.status==='active'?'var(--brand-50)':'var(--slate-100)', color:poll.status==='active'?'var(--brand-700)':'var(--slate-500)'}}>
                        {poll.status==='active' ? String(t('pollManager.pollStatus.active', 'Active')) : String(t('pollManager.pollStatus.closed', 'Closed'))}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{background:'var(--brand-50)',color:'var(--brand-700)'}}>{String(t(`dashboard.platforms.${poll.platform.toLowerCase()}`, poll.platform))}</span>
                      <span className="text-[11px]" style={{color:'var(--slate-400)'}}>{poll.createdAt}</span>
                    </div>
                    <h3 className="font-bold text-base" style={{color:'var(--slate-900)'}}>{String(t(`pollManager.mockData.poll${poll.id}.question`, poll.question))}</h3>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{color:'var(--slate-500)'}}>
                      <ThumbsUp size={11}/>{poll.totalVotes} {t('pollManager.pollCard.totalVotes', 'total votes')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={()=>toggleStatus(poll.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>
                      {poll.status==='active' ? String(t('pollManager.pollCard.close', 'Close')) : String(t('pollManager.pollCard.reopen', 'Reopen'))}
                    </button>
                    <button onClick={()=>setPolls(p=>p.filter(x=>x.id!==poll.id))} className="text-slate-300 hover:text-red-400 transition-colors"><X size={15}/></button>
                  </div>
                </div>
                <div className="space-y-2">
                  {poll.options.map(opt=>{
                    const pct=poll.totalVotes?Math.round(opt.votes/poll.totalVotes*100):0;
                    const isLeading=opt.votes===maxVotes&&poll.totalVotes>0;
                    return (
                      <div key={opt.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium" style={{color:'var(--slate-800)'}}>
                            {isLeading&&<span className="mr-1 text-xs font-bold" style={{color:'var(--brand-600)'}}>▲</span>}
                            {String(t(`pollManager.mockData.poll${poll.id}.opt${opt.id}`, opt.text))}
                          </span>
                          <span className="text-xs font-bold" style={{color:'var(--slate-500)'}}>{opt.votes} ({pct}%)</span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{background:'var(--slate-100)'}}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{width:`${pct}%`, background:isLeading?'var(--brand-500)':'var(--brand-200)'}}/>
                        </div>
                      </div>
                    );
                  })}
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
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('pollManager.form.createTitle', 'Create Poll')}</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('pollManager.form.question', 'Question')}</label>
                <input style={inputStyle} placeholder={String(t('pollManager.form.questionPlaceholder', 'Ask your audience…'))} value={question} onChange={e=>setQuestion(e.target.value)}/></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('pollManager.form.platform', 'Platform')}</label>
                <select style={{...inputStyle,cursor:'pointer'}} value={platform} onChange={e=>setPlatform(e.target.value)}>
                  <option value="Facebook">{String(t('dashboard.platforms.facebook', 'Facebook'))}</option>
                  <option value="Instagram">{String(t('dashboard.platforms.instagram', 'Instagram'))}</option>
                  <option value="Twitter">{String(t('dashboard.platforms.twitter', 'Twitter'))}</option>
                </select></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('pollManager.form.options', 'Options (min 2, max 4)')}</label>
                <div className="space-y-2">
                  {opts.map((o,i)=>(
                    <div key={i} className="flex gap-2">
                      <input style={{...inputStyle,flex:1}} placeholder={String(t('pollManager.form.optionPlaceholder', 'Option {{num}}', { num: i+1 }))} value={o} onChange={e=>setOpts(p=>p.map((x,j)=>j===i?e.target.value:x))}/>
                      {opts.length>2&&<button onClick={()=>removeOption(i)} className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"><X size={15}/></button>}
                    </div>
                  ))}
                  {opts.length<4&&<button onClick={addOption} className="text-xs font-bold py-1.5 px-3 rounded-lg border transition-colors hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--brand-600)'}}>{t('pollManager.form.addOption', '+ Add Option')}</button>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>{t('pollManager.form.cancel', 'Cancel')}</button>
              <button onClick={createPoll} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>{t('pollManager.form.submit', 'Create Poll')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
