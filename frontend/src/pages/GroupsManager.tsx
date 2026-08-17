import React, { useState } from 'react';
import { Plus, X, Users, CheckCircle, AlertCircle, TrendingUp, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { GroupsReport } from '../components/GroupsReport';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Group {
  id: string; name: string; platform: string; members: number;
  admin: string; category: string; status: 'active'|'inactive'; joinedDate: string; notes: string;
}

const MIN_MEMBERS = 30;
const CATEGORIES  = ['Community','Youth','Events','Political','Women','Religious','Sports','Business','Charity'];
const TEAM        = ['Harshal Vora','Dr. Amol Pawar','Sagar','—'];



const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

export const GroupsManager = () => {
  const { t } = useTranslation();

  const [groups, setGroups] = useState<Group[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Group,'id'>>({ name:'', platform:'Facebook', members:0, admin:TEAM[0], category:CATEGORIES[0], status:'active', joinedDate:'', notes:'' });
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
      pdf.save(`Groups_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  React.useEffect(() => {
    setGroups([]);
  }, [t]);

  const addGroup = () => {
    if(!form.name) return;
    setGroups(p=>[...p,{id:Date.now().toString(),...form}]);
    setShowForm(false);
    setForm({name:'',platform:'Facebook',members:0,admin:TEAM[0],category:CATEGORIES[0],status:'active',joinedDate:'',notes:''});
  };

  const goalMet      = groups.filter(g=>g.members>=MIN_MEMBERS).length;
  const totalMembers = groups.reduce((a,g)=>a+g.members, 0);
  const activeCount  = groups.filter(g=>g.status==='active').length;

  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <GroupsReport groups={groups} />
      </div>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--brand-600)'}}>
              <Users size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('groupsManager.title', 'Groups Manager')}</h1>
              <p className="text-sm" style={{color:'var(--slate-500)'}}>{t('groupsManager.subtitle', 'Manage Facebook groups — minimum 30 members per group required')}</p>
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
              <Plus size={16}/> {t('groupsManager.addGroup', 'Add Group')}
            </button>
          </div>
        </div>

        {/* Rule Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl mb-6" style={{background:'var(--brand-50)', border:'1px solid var(--brand-100)'}}>
          <AlertCircle size={18} className="shrink-0 mt-0.5" style={{color:'var(--brand-600)'}}/>
          <p className="text-sm font-medium" style={{color:'var(--brand-800)'}}>
            <strong>{t('groupsManager.ruleTitle', 'Goal (from document):')}</strong> {t('groupsManager.ruleText', 'Create Facebook groups with at least 30 members. Join relevant political/social groups as a member to network and spread content.')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label:t('groupsManager.stats.totalGroups', 'Total Groups'),     value:groups.length,                     Icon:Users,       color:'var(--brand-700)', bg:'var(--brand-50)'  },
            { label:t('groupsManager.stats.activeGroups', 'Active Groups'),    value:activeCount,                        Icon:CheckCircle, color:'var(--brand-600)', bg:'var(--brand-50)'  },
            { label:t('groupsManager.stats.memberGoal', '30+ Member Goal'),  value:`${goalMet}/${groups.length}`,     Icon:TrendingUp,  color:'var(--brand-800)', bg:'var(--brand-100)' },
            { label:t('groupsManager.stats.totalReach', 'Total Reach'),      value:totalMembers.toLocaleString(),      Icon:Users,       color:'var(--brand-900)', bg:'var(--brand-100)' },
          ].map(s=>{
            const SIcon=s.Icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border p-4 text-center" style={{borderColor:'var(--slate-200)'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{background:s.bg, color:s.color}}>
                  <SIcon size={16} strokeWidth={2}/>
                </div>
                <div className="font-black text-xl mb-0.5" style={{color:s.color}}>{s.value}</div>
                <div className="text-xs font-bold" style={{color:'var(--slate-500)'}}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Groups List */}
        <div className="space-y-3">
          {groups.map(g=>{
            const goalAchieved = g.members>=MIN_MEMBERS;
            const needMore     = MIN_MEMBERS-g.members;
            return (
              <div key={g.id} className="bg-white rounded-2xl border p-5 group transition-all hover:shadow-md" style={{borderColor:'var(--slate-200)'}}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{background:goalAchieved?'var(--brand-50)':'var(--slate-100)', color:goalAchieved?'var(--brand-600)':'var(--slate-400)'}}>
                    {goalAchieved ? <CheckCircle size={22} strokeWidth={2}/> : <AlertCircle size={22} strokeWidth={2}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold" style={{color:'var(--slate-900)'}}>{g.name}</p>
                        <p className="text-xs mt-0.5" style={{color:'var(--slate-500)'}}>{t('groupsManager.list.meta', 'Admin: {{admin}} · {{platform}} · {{category}} · Joined {{date}}', { admin: g.admin==='—'?g.admin:t(`teamTasks.team.${g.admin}`, g.admin), platform: t(`groupsManager.platforms.${g.platform}`, g.platform), category: t(`groupsManager.categories.${g.category}`, g.category), date: g.joinedDate })}</p>
                        {g.notes&&<p className="text-xs mt-0.5 italic" style={{color:'var(--slate-400)'}}>"{g.notes}"</p>}
                      </div>
                      <button onClick={()=>setGroups(p=>p.filter(x=>x.id!==g.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0"><X size={15}/></button>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} style={{color:'var(--slate-400)'}}/>
                        <span className="font-black text-lg" style={{color:goalAchieved?'var(--brand-600)':'var(--slate-500)'}}>{g.members.toLocaleString()}</span>
                        <span className="text-xs" style={{color:'var(--slate-500)'}}>{t('groupsManager.list.members', 'members')}</span>
                      </div>
                      {goalAchieved ? (
                        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{background:'var(--brand-50)',color:'var(--brand-700)'}}>
                          <CheckCircle size={11}/> {t('groupsManager.list.goalMet', 'Goal met')}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:'var(--slate-100)',color:'var(--slate-600)'}}>{t('groupsManager.list.needMore', 'Need {{count}} more', { count: needMore })}</span>
                      )}
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:g.status==='active'?'var(--brand-50)':'var(--slate-100)',color:g.status==='active'?'var(--brand-700)':'var(--slate-500)'}}>
                        {g.status==='active'?t('groupsManager.list.active', 'Active'):t('groupsManager.list.inactive', 'Inactive')}
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full overflow-hidden" style={{background:'var(--slate-100)'}}>
                      <div className="h-full rounded-full transition-all" style={{width:`${Math.min(g.members/MIN_MEMBERS*100,100)}%`, background:goalAchieved?'var(--brand-500)':'var(--brand-200)'}}/>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{color:'var(--slate-400)'}}>{t('groupsManager.list.target', 'Target: {{count}} members minimum', { count: MIN_MEMBERS })}</p>
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
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('groupsManager.form.title', 'Add Group')}</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('groupsManager.form.groupName', 'Group Name')}</label>
                <input style={inputStyle} placeholder={String(t('groupsManager.form.groupNamePlaceholder', 'Group name…'))} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('groupsManager.form.platform', 'Platform')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
                    {['Facebook', 'WhatsApp', 'Telegram'].map(p=><option key={p} value={p}>{t(`groupsManager.platforms.${p}`, p)}</option>)}</select></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('groupsManager.form.category', 'Category')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{t(`groupsManager.categories.${c}`, c)}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('groupsManager.form.memberCount', 'Member Count')}</label>
                  <input type="number" style={inputStyle} value={form.members} onChange={e=>setForm(f=>({...f,members:+e.target.value}))} min={0}/></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('groupsManager.form.admin', 'Admin')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.admin} onChange={e=>setForm(f=>({...f,admin:e.target.value}))}>
                    {TEAM.map(m=><option key={m} value={m}>{m==='—'?m:t(`teamTasks.team.${m}`, m)}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('groupsManager.form.joinedDate', 'Joined Date')}</label>
                <input type="date" style={{...inputStyle,cursor:'pointer'}} value={form.joinedDate} onChange={e=>setForm(f=>({...f,joinedDate:e.target.value}))}/></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('groupsManager.form.notes', 'Notes')}</label>
                <input style={inputStyle} placeholder={String(t('groupsManager.form.notesPlaceholder', 'Any notes…'))} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>{t('groupsManager.form.cancel', 'Cancel')}</button>
              <button onClick={addGroup} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>{t('groupsManager.form.submit', 'Add Group')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
