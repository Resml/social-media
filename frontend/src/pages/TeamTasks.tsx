import React, { useState } from 'react';
import { Plus, X, Kanban, CheckCircle2, Circle, Clock, ChevronRight, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { TeamTasksReport } from '../components/TeamTasksReport';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

type Priority = 'high' | 'medium' | 'low';
type TaskStatus = 'todo' | 'inprogress' | 'done';

interface Task {
  id: string; title: string; category: string; assignee: string;
  priority: Priority; status: TaskStatus; dueDate: string;
}

const TEAM = ['Harshal Vora', 'Dr. Amol Pawar', 'Sagar'];
const CATEGORIES = ['Birthday Post','Festival Post','Social Issue','Poll','Live Video','Campaign','Repost','General'];

const PRIORITY_STYLE: Record<Priority, { bg: string; color: string; label: string; dot: string }> = {
  high:   { bg: 'var(--brand-50)',  color: 'var(--brand-700)', label: 'High',   dot: 'var(--brand-600)' },
  medium: { bg: 'var(--slate-100)', color: 'var(--slate-700)', label: 'Medium', dot: 'var(--slate-500)' },
  low:    { bg: 'var(--slate-50)',  color: 'var(--slate-500)', label: 'Low',    dot: 'var(--slate-300)' },
};

const COLUMNS: { id: TaskStatus; label: string; Icon: React.FC<any>; accent: string }[] = [
  { id:'todo',       label:'To Do',       Icon: Circle,       accent:'var(--slate-400)' },
  { id:'inprogress', label:'In Progress', Icon: Clock,        accent:'var(--brand-500)' },
  { id:'done',       label:'Done',        Icon: CheckCircle2, accent:'var(--brand-700)' },
];

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

const avatar = (name: string) => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

export const TeamTasks = () => {
  const { t } = useTranslation();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Task,'id'>>({ title:'', category:CATEGORIES[0], assignee:TEAM[0], priority:'medium', status:'todo', dueDate:'' });
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
      pdf.save(`TeamTasks_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const addTask    = () => { if(!form.title)return; setTasks(p=>[...p,{id:Date.now().toString(),...form}]); setShowForm(false); setForm({title:'',category:CATEGORIES[0],assignee:TEAM[0],priority:'medium',status:'todo',dueDate:''}); };
  const moveTask   = (id:string, status:TaskStatus) => setTasks(p=>p.map(t=>t.id===id?{...t,status}:t));
  const deleteTask = (id:string) => setTasks(p=>p.filter(t=>t.id!==id));

  const memberStats = TEAM.map(m=>({ name:m, total:tasks.filter(t=>t.assignee===m).length, done:tasks.filter(t=>t.assignee===m&&t.status==='done').length }));

  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <TeamTasksReport tasks={tasks} />
      </div>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--brand-600)'}}>
              <Kanban size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('teamTasks.title', 'Team Tasks')}</h1>
              <p className="text-sm" style={{color:'var(--slate-500)'}}>{t('teamTasks.subtitle', 'Assign and track post tasks across your team')}</p>
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
              <Plus size={16}/> {t('teamTasks.addTask', 'Add Task')}
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {memberStats.map(m=>{
            const pct = m.total ? Math.round(m.done/m.total*100) : 0;
            return (
              <div key={m.name} className="bg-white rounded-2xl p-4 border flex items-center gap-4" style={{borderColor:'var(--slate-200)'}}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{background:'var(--brand-600)'}}>
                  {avatar(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{color:'var(--slate-900)'}}>{t(`teamTasks.team.${m.name}`, m.name)}</p>
                  <p className="text-xs mb-1.5" style={{color:'var(--slate-500)'}}>{t('teamTasks.stats.tasksDone', '{{done}}/{{total}} tasks done', { done: m.done, total: m.total })}</p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{background:'var(--slate-100)'}}>
                    <div className="h-full rounded-full transition-all" style={{width:`${pct}%`, background:'var(--brand-500)'}}/>
                  </div>
                </div>
                <span className="font-black text-lg shrink-0" style={{color:'var(--brand-600)'}}>{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(col=>{
            const ColIcon = col.Icon;
            const colTasks = tasks.filter(t=>t.status===col.id);
            return (
              <div key={col.id}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <ColIcon size={16} style={{color:col.accent}}/>
                  <h3 className="font-bold text-sm" style={{color:'var(--slate-700)'}}>{t(`teamTasks.columns.${col.id}`, col.label)}</h3>
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'var(--slate-100)',color:'var(--slate-600)'}}>{colTasks.length}</span>
                </div>
                <div className="flex flex-col gap-3 min-h-[180px]">
                  {colTasks.map(task=>{
                    const pr = PRIORITY_STYLE[task.priority];
                    return (
                      <div key={task.id} className="bg-white rounded-xl p-4 border transition-all hover:shadow-md group" style={{borderColor:'var(--slate-200)'}}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-semibold text-sm leading-tight" style={{color:'var(--slate-900)'}}>{task.title}</p>
                          <button onClick={()=>deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0"><X size={14}/></button>
                        </div>
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:'var(--brand-50)',color:'var(--brand-700)'}}>{t(`teamTasks.categories.${task.category}`, task.category)}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{background:pr.bg,color:pr.color}}>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:pr.dot}}/>
                            {t(`teamTasks.priority.${task.priority}`, pr.label)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{background:'var(--brand-600)'}}>
                              {avatar(task.assignee)}
                            </div>
                            <span className="text-xs" style={{color:'var(--slate-500)'}}>{t(`teamTasks.team.${task.assignee}`, task.assignee).split(' ')[0]}</span>
                          </div>
                          {task.dueDate&&<p className="text-[10px] font-medium" style={{color:'var(--slate-400)'}}>{task.dueDate}</p>}
                        </div>
                        {/* Move buttons */}
                        <div className="flex gap-1 mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity" style={{borderColor:'var(--slate-100)'}}>
                          {COLUMNS.filter(c=>c.id!==col.id).map(c=>(
                            <button key={c.id} onClick={()=>moveTask(task.id,c.id)}
                              className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1 rounded-lg transition-colors hover:opacity-80"
                              style={{background:'var(--brand-50)',color:'var(--brand-700)'}}>
                              <ChevronRight size={10}/>{t(`teamTasks.columns.${c.id}`, c.label)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length===0&&(
                    <div className="text-sm text-center py-10 rounded-xl border-2 border-dashed" style={{color:'var(--slate-400)',borderColor:'var(--slate-200)'}}>{t('teamTasks.noTasks', 'No tasks here')}</div>
                  )}
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
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('teamTasks.form.title', 'Add Task')}</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('teamTasks.form.taskTitle', 'Task Title')}</label>
                <input style={inputStyle} placeholder={String(t('teamTasks.form.taskPlaceholder', 'What needs to be done?'))} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('teamTasks.form.category', 'Category')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{t(`teamTasks.categories.${c}`, c)}</option>)}</select></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('teamTasks.form.priority', 'Priority')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value as Priority}))}>
                    <option value="high">{t('teamTasks.priority.high', 'High')}</option><option value="medium">{t('teamTasks.priority.medium', 'Medium')}</option><option value="low">{t('teamTasks.priority.low', 'Low')}</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('teamTasks.form.assignTo', 'Assign To')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.assignee} onChange={e=>setForm(f=>({...f,assignee:e.target.value}))}>
                    {TEAM.map(m=><option key={m} value={m}>{t(`teamTasks.team.${m}`, m)}</option>)}</select></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('teamTasks.form.dueDate', 'Due Date')}</label>
                  <input type="date" style={{...inputStyle,cursor:'pointer'}} value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>{t('teamTasks.form.cancel', 'Cancel')}</button>
              <button onClick={addTask} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>{t('teamTasks.form.submit', 'Add Task')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
