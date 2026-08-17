import React, { useState } from 'react';
import { Plus, X, FileText, BookOpen, AlignLeft, CheckCircle, Clock, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { ArticlePlannerReport } from '../components/ArticlePlannerReport';
import { useRef } from 'react';
import { Download } from 'lucide-react';

type ArticleType   = 'daily-short' | 'weekly-big';
type ArticleStatus = 'idea' | 'draft' | 'published';

interface Article {
  id: string; type: ArticleType; category: string; title: string;
  writer: string; status: ArticleStatus; dueDate: string; note: string;
}

const WRITERS = ['Satish Waghmare', 'Sagar', 'Hemant', 'Harshal Vora', 'Dr. Amol Pawar'];

const DAILY_CATEGORIES = [
  'Daily Activities / Personal',
  'State / Central Opposition Critique',
  'Worker Appreciation',
  'Social Movements & Events',
  'Demographic Issues (age / gender / profession)',
  'Ward Development Issues',
  'Comparative Article',
  'Social Awareness Commentary',
  'Political Current Events',
  'Youth Achievement',
  'Poetry / Creative Branding',
  'Public Useful Info (prices, jobs, courses)',
  'Motivational',
  'Development Work Invitation',
];

const WEEKLY_CATEGORIES = [
  'Letter to CM / Party Leaders',
  'Letter to Official about social issue',
  'Ward scheme / MLA fund suggestions copy',
  'Candidate appreciation letter',
  'Worker-penned article about our work',
  'Area social problems & deficiencies',
  'Future plans for people',
  'Personal qualities & characteristics',
  'Interview by journalist',
  'Thoughts on national event',
  'New idea on social problem',
  'Committee / assembly attendance (last 6 months)',
  'Public questions on development / politics',
  'Analysis / Opinion piece',
];

const STATUS: Record<ArticleStatus, { bg: string; color: string; label: string; Icon: React.FC<any> }> = {
  idea:      { bg:'var(--slate-100)', color:'var(--slate-600)', label:'Idea',      Icon: Lightbulb     },
  draft:     { bg:'var(--brand-50)',  color:'var(--brand-700)', label:'Draft',     Icon: AlignLeft      },
  published: { bg:'var(--brand-100)', color:'var(--brand-800)', label:'Published', Icon: CheckCircle    },
};

const WRITER_INITIALS = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();



const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

export const ArticlePlanner = () => {
  const { t } = useTranslation();
  const [articles, setArticles]     = useState<Article[]>([]);
  const [showForm, setShowForm]     = useState(false);
  const [showGuide, setShowGuide]   = useState(false);
  const [activeTab, setActiveTab]   = useState<ArticleType>('daily-short');
  const [form, setForm] = useState<Omit<Article,'id'>>({
    type:'daily-short', category:DAILY_CATEGORIES[0], title:'', writer:WRITERS[0], status:'idea', dueDate:'', note:''
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    const toastId = toast.loading('Generating PDF report... Please wait.');
    try {
      const element = reportRef.current;
      const imgData = await htmlToImage.toPng(element, { pixelRatio: 2, backgroundColor: '#ffffff', style: { opacity: '1' } });
      if (!imgData || imgData === 'data:,') { toast.error("Failed to capture report. Image is empty.", { id: toastId }); return; }
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Article_Planner_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const addArticle = () => {
    if (!form.title) return;
    setArticles(p => [...p, { id:Date.now().toString(), ...form }]);
    setShowForm(false);
    setForm({ type:'daily-short', category:DAILY_CATEGORIES[0], title:'', writer:WRITERS[0], status:'idea', dueDate:'', note:'' });
  };

  const advanceStatus = (id: string) =>
    setArticles(p => p.map(a => {
      if (a.id !== id) return a;
      const next: ArticleStatus = a.status === 'idea' ? 'draft' : a.status === 'draft' ? 'published' : 'published';
      return { ...a, status: next };
    }));

  const todayStr         = new Date().toISOString().slice(0, 10);
  const publishedToday   = articles.filter(a => a.status === 'published' && a.type === 'daily-short' && a.dueDate === todayStr).length;
  const displayed        = articles.filter(a => a.type === activeTab);

  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{ background:'var(--slate-50)', padding:'1.5rem' }}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <ArticlePlannerReport articles={articles} />
      </div>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'var(--brand-600)' }}>
              <FileText size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ fontFamily:'Outfit,sans-serif', color:'var(--slate-900)' }}>{t('articlePlanner.title', 'Article Planner')}</h1>
              <p className="text-sm" style={{ color:'var(--slate-500)' }}>{t('articlePlanner.subtitle', 'Daily 10-line articles + Weekly big articles — assigned to team writers')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowGuide(g => !g)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors hover:bg-slate-50"
              style={{ borderColor:'var(--slate-200)', color:'var(--slate-600)' }}>
              <BookOpen size={15}/> {t('articlePlanner.buttons.guide', 'Guide')}
            </button>
            <button onClick={generatePDF} disabled={isGeneratingReport} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isGeneratingReport ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}`} style={{boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
              {isGeneratingReport ? (<div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />) : <Download size={16}/>}
              {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : t('dashboard.report.downloadPdf', 'Download PDF')}
            </button>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background:'var(--brand-600)', boxShadow:'0 2px 8px rgba(2,132,199,0.25)' }}>
              <Plus size={16}/> {t('articlePlanner.buttons.addArticle', 'Add Article')}
            </button>
          </div>
        </div>

        {/* Daily streak banner */}
        <div className="flex items-center gap-4 p-4 rounded-2xl mb-6"
          style={{ background:'var(--brand-50)', border:'1px solid var(--brand-100)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:'var(--brand-600)' }}>
            {publishedToday > 0
              ? <CheckCircle size={20} color="#fff" strokeWidth={2}/>
              : <Clock size={20} color="#fff" strokeWidth={2}/>}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color:'var(--brand-800)' }}>
              {publishedToday > 0 ? t('articlePlanner.streak.published', "Today's article published!") : t('articlePlanner.streak.notPublished', "No article published today yet")}
            </p>
            <p className="text-xs mt-0.5" style={{ color:'var(--brand-700)' }}>
              {t('articlePlanner.streak.rule', "Document says: Write one 10-line article every day — personal, opposition critique, worker appreciation…")}
            </p>
          </div>
        </div>

        {/* Category Guide */}
        {showGuide && (
          <div className="bg-white rounded-2xl border p-5 mb-6" style={{ borderColor:'var(--slate-200)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2" style={{ fontFamily:'Outfit,sans-serif', color:'var(--slate-900)' }}>
                <BookOpen size={16} style={{ color:'var(--brand-600)' }}/> {t('articlePlanner.guide.title', 'Article Categories Guide')}
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color:'var(--brand-700)' }}>
                  <FileText size={13}/> {t('articlePlanner.guide.dailyTitle', 'Daily Short Articles (10 lines, every day)')}
                </h4>
                <ul className="space-y-1.5">
                  {DAILY_CATEGORIES.map((c,i) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color:'var(--slate-700)' }}>
                      <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background:'var(--brand-400)' }}/>
                      {t(`articlePlanner.categories.${c}`, c)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color:'var(--brand-800)' }}>
                  <BookOpen size={13}/> {t('articlePlanner.guide.weeklyTitle', 'Weekly Big Articles (1 per week)')}
                </h4>
                <ul className="space-y-1.5">
                  {WEEKLY_CATEGORIES.map((c,i) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color:'var(--slate-700)' }}>
                      <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background:'var(--brand-600)' }}/>
                      {t(`articlePlanner.categories.${c}`, c)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label:t('articlePlanner.stats.dailyPub', 'Daily Published'), value:articles.filter(a=>a.type==='daily-short'&&a.status==='published').length, color:'var(--brand-800)', bg:'var(--brand-100)' },
            { label:t('articlePlanner.stats.dailyDraft', 'Daily Drafts'),    value:articles.filter(a=>a.type==='daily-short'&&a.status==='draft').length,    color:'var(--brand-600)', bg:'var(--brand-50)'  },
            { label:t('articlePlanner.stats.weeklyPub', 'Weekly Published'),value:articles.filter(a=>a.type==='weekly-big' &&a.status==='published').length,color:'var(--brand-700)', bg:'var(--brand-50)'  },
            { label:t('articlePlanner.stats.weeklyDraft', 'Weekly Drafts'),   value:articles.filter(a=>a.type==='weekly-big' &&a.status==='draft').length,    color:'var(--slate-600)', bg:'var(--slate-100)' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border p-3 text-center" style={{ borderColor:'var(--slate-200)' }}>
              <div className="font-black text-2xl mb-0.5" style={{ color:s.color }}>{s.value}</div>
              <div className="text-xs font-bold" style={{ color:'var(--slate-500)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-xl p-1 border w-fit" style={{ borderColor:'var(--slate-200)' }}>
          <button onClick={() => setActiveTab('daily-short')}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all"
            style={{ background:activeTab==='daily-short'?'var(--brand-600)':'transparent', color:activeTab==='daily-short'?'#fff':'var(--slate-600)' }}>
            <FileText size={14}/> {t('articlePlanner.tabs.daily', 'Daily Articles')}
          </button>
          <button onClick={() => setActiveTab('weekly-big')}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all"
            style={{ background:activeTab==='weekly-big'?'var(--brand-600)':'transparent', color:activeTab==='weekly-big'?'#fff':'var(--slate-600)' }}>
            <BookOpen size={14}/> {t('articlePlanner.tabs.weekly', 'Weekly Articles')}
          </button>
        </div>

        {/* Article List */}
        <div className="space-y-3">
          {displayed.sort((a,b) => b.dueDate.localeCompare(a.dueDate)).map(article => {
            const st = STATUS[article.status]; const StIcon = st.Icon;
            return (
              <div key={article.id} className="bg-white rounded-2xl border p-4 group transition-all hover:shadow-md" style={{ borderColor:'var(--slate-200)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:st.bg, color:st.color }}>
                    <StIcon size={17} strokeWidth={2}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background:st.bg, color:st.color }}>{t(`articlePlanner.status.${article.status}`, st.label)}</span>
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background:'var(--brand-50)', color:'var(--brand-700)' }}>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black" style={{ background:'var(--brand-600)' }}>
                          {WRITER_INITIALS(t(`team.${article.writer}`, article.writer))}
                        </div>
                        {t(`team.${article.writer}`, article.writer)}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background:'var(--slate-100)', color:'var(--slate-600)' }}>{t(`articlePlanner.categories.${article.category}`, article.category)}</span>
                      {article.dueDate && <span className="text-[11px]" style={{ color:'var(--slate-400)' }}>{article.dueDate}</span>}
                    </div>
                    <p className="font-bold text-sm" style={{ color:'var(--slate-900)' }}>{article.title}</p>
                    {article.note && <p className="text-xs mt-1 italic" style={{ color:'var(--slate-400)' }}>"{article.note}"</p>}
                    {article.status !== 'published' && (
                      <button onClick={() => advanceStatus(article.id)}
                        className="mt-3 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
                        style={{ background:'var(--brand-50)', color:'var(--brand-700)' }}>
                        {article.status === 'idea' ? t('articlePlanner.actions.moveToDraft', 'Move to Draft') : t('articlePlanner.actions.markPublished', 'Mark Published')}
                      </button>
                    )}
                  </div>
                  <button onClick={() => setArticles(p => p.filter(a => a.id !== article.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0"><X size={15}/></button>
                </div>
              </div>
            );
          })}
          {displayed.length === 0 && (
            <div className="text-center py-16" style={{ color:'var(--slate-400)' }}>
              <FileText size={48} className="mx-auto mb-4 opacity-30"/>
              <p className="font-bold">{activeTab === 'daily-short' ? t('articlePlanner.empty.noDaily', 'No daily articles yet.') : t('articlePlanner.empty.noWeekly', 'No weekly articles yet.')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ fontFamily:'Outfit,sans-serif', color:'var(--slate-900)' }}>{t('articlePlanner.form.title', 'Add Article')}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>{t('articlePlanner.form.type', 'Type')}</label>
                <div className="flex gap-2">
                  {(['daily-short','weekly-big'] as ArticleType[]).map(typeOption => (
                    <button key={typeOption} onClick={() => setForm(f => ({ ...f, type:typeOption, category:typeOption==='daily-short'?DAILY_CATEGORIES[0]:WEEKLY_CATEGORIES[0] }))}
                      className="flex-1 py-2 rounded-xl font-bold text-sm border transition-all"
                      style={{ background:form.type===typeOption?'var(--brand-600)':'#fff', color:form.type===typeOption?'#fff':'var(--slate-600)', borderColor:form.type===typeOption?'var(--brand-600)':'var(--slate-200)' }}>
                      {typeOption === 'daily-short' ? t('articlePlanner.form.dailyShort', 'Daily Short') : t('articlePlanner.form.weeklyBig', 'Weekly Big')}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>{t('articlePlanner.form.category', 'Category')}</label>
                <select style={{ ...inputStyle, cursor:'pointer' }} value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
                  {(form.type === 'daily-short' ? DAILY_CATEGORIES : WEEKLY_CATEGORIES).map(c => <option key={c} value={c}>{t(`articlePlanner.categories.${c}`, c)}</option>)}
                </select></div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>{t('articlePlanner.form.topicLabel', 'Title / Topic')}</label>
                <input style={inputStyle} placeholder={String(t('articlePlanner.form.topicPlaceholder', 'Article title or topic…'))} value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>{t('articlePlanner.form.assignedWriter', 'Assigned Writer')}</label>
                  <select style={{ ...inputStyle, cursor:'pointer' }} value={form.writer} onChange={e => setForm(f => ({ ...f, writer:e.target.value }))}>
                    {WRITERS.map(w => <option key={w} value={w}>{t(`team.${w}`, w)}</option>)}</select></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>{t('articlePlanner.form.dueDate', 'Due Date')}</label>
                  <input type="date" style={{ ...inputStyle, cursor:'pointer' }} value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate:e.target.value }))}/></div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'var(--slate-400)' }}>{t('articlePlanner.form.noteLabel', 'Note')}</label>
                <input style={inputStyle} placeholder={String(t('articlePlanner.form.notePlaceholder', 'Any notes…'))} value={form.note} onChange={e => setForm(f => ({ ...f, note:e.target.value }))}/></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{ borderColor:'var(--slate-200)', color:'var(--slate-600)' }}>{t('articlePlanner.form.cancel', 'Cancel')}</button>
              <button onClick={addArticle} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{ background:'var(--brand-600)' }}>{t('articlePlanner.form.submit', 'Add Article')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
