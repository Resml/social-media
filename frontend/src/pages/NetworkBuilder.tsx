import React, { useState } from 'react';
import { Plus, X, Search, Network, Tag, User, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { NetworkReport } from '../components/NetworkReport';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

type Tag = 'Supporter' | 'Influencer' | 'Voter' | 'Activist' | 'Opponent' | 'Neutral';

interface Contact {
  id: string; name: string; location: string; interest: string;
  platform: string; phone: string; tag: Tag; note: string;
}

const TAG_STYLE: Record<Tag, { color: string; bg: string; border: string }> = {
  Supporter:  { color: 'var(--brand-700)', bg: 'var(--brand-50)',  border: 'var(--brand-200)' },
  Influencer: { color: 'var(--brand-800)', bg: 'var(--brand-100)', border: 'var(--brand-300)' },
  Voter:      { color: 'var(--brand-600)', bg: 'var(--brand-50)',  border: 'var(--brand-200)' },
  Activist:   { color: 'var(--slate-700)', bg: 'var(--slate-100)', border: 'var(--slate-200)' },
  Opponent:   { color: '#dc2626',          bg: '#fef2f2',          border: '#fecaca'          },
  Neutral:    { color: 'var(--slate-500)', bg: 'var(--slate-50)',  border: 'var(--slate-200)' },
};

const TAGS: Tag[] = ['Supporter','Influencer','Voter','Activist','Opponent','Neutral'];
const INTERESTS = ['Politics','Social Work','Culture','Sports','Education','Health','Environment','Youth','Women Empowerment','Business'];



const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

const initials = (name: string) => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

export const NetworkBuilder = () => {
  const { t } = useTranslation();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState('');
  const [filterTag, setFilterTag] = useState<Tag|'All'>('All');
  const [form, setForm] = useState<Omit<Contact,'id'>>({ name:'', location:'', interest:INTERESTS[0], platform:'Facebook', phone:'', tag:'Supporter', note:'' });
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
      pdf.save(`Network_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const addContact = () => {
    if(!form.name) return;
    setContacts(p=>[...p,{id:Date.now().toString(),...form}]);
    setShowForm(false);
    setForm({name:'',location:'',interest:INTERESTS[0],platform:'Facebook',phone:'',tag:'Supporter',note:''});
  };

  const filtered = contacts.filter(c=>{
    const matchSearch = !search||c.name.toLowerCase().includes(search.toLowerCase())||c.location.toLowerCase().includes(search.toLowerCase())||c.interest.toLowerCase().includes(search.toLowerCase());
    const matchTag    = filterTag==='All'||c.tag===filterTag;
    return matchSearch&&matchTag;
  });

  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <NetworkReport contacts={contacts} />
      </div>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--brand-600)'}}>
              <Network size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('networkBuilder.title', 'Network Builder')}</h1>
              <p className="text-sm" style={{color:'var(--slate-500)'}}>{t('networkBuilder.subtitle', 'Build and manage supporters, influencers and voter network')}</p>
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
              <Plus size={16}/> {t('networkBuilder.addContact', 'Add Contact')}
            </button>
          </div>
        </div>

        {/* Tag filter stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {TAGS.map(tagItem=>{
            const st=TAG_STYLE[tagItem]; const cnt=contacts.filter(c=>c.tag===tagItem).length;
            return (
              <button key={tagItem} onClick={()=>setFilterTag(filterTag===tagItem?'All':tagItem)}
                className="rounded-xl border p-3 text-center transition-all hover:scale-105 active:scale-95"
                style={{background:filterTag===tagItem?st.bg:'#fff', borderColor:filterTag===tagItem?st.color:'var(--slate-200)', borderWidth:filterTag===tagItem?2:1}}>
                <div className="font-black text-lg leading-none mb-0.5" style={{color:filterTag===tagItem?st.color:'var(--slate-600)'}}>{cnt}</div>
                <div className="text-[10px] font-bold leading-tight" style={{color:'var(--slate-500)'}}>{t(`networkBuilder.tags.${tagItem}`, tagItem)}</div>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'var(--slate-400)'}}/>
            <input style={{...inputStyle,paddingLeft:'2.5rem'}} placeholder={String(t('networkBuilder.searchPlaceholder', 'Search by name, location or interest…'))} value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {filterTag!=='All'&&(
            <button onClick={()=>setFilterTag('All')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-sm transition-colors hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>
              <X size={14}/> {t('networkBuilder.clear', 'Clear')}
            </button>
          )}
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c=>{
            const st=TAG_STYLE[c.tag];
            return (
              <div key={c.id} className="bg-white rounded-2xl border p-4 group transition-all hover:shadow-md hover:-translate-y-0.5" style={{borderColor:'var(--slate-200)'}}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                      style={{background:'var(--brand-600)'}}>
                      {initials(c.name)}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{color:'var(--slate-900)'}}>{c.name}</p>
                      <p className="text-xs" style={{color:'var(--slate-500)'}}>{c.location}</p>
                    </div>
                  </div>
                  <button onClick={()=>setContacts(p=>p.filter(x=>x.id!==c.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"><X size={14}/></button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border" style={{background:st.bg,color:st.color,borderColor:st.border}}>{t(`networkBuilder.tags.${c.tag}`, c.tag)}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{background:'var(--slate-100)',color:'var(--slate-600)'}}>{t(`networkBuilder.interests.${c.interest}`, c.interest)}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{background:'var(--brand-50)',color:'var(--brand-700)'}}>{t(`networkBuilder.platforms.${c.platform}`, c.platform)}</span>
                </div>
                {c.phone&&<p className="text-xs font-medium flex items-center gap-1" style={{color:'var(--slate-500)'}}><User size={11}/>{c.phone}</p>}
                {c.note&&<p className="text-xs mt-1 italic" style={{color:'var(--slate-400)'}}>"{c.note}"</p>}
              </div>
            );
          })}
          {filtered.length===0&&(
            <div className="col-span-full text-center py-16" style={{color:'var(--slate-400)'}}>
              <Network size={48} className="mx-auto mb-4 opacity-30"/>
              <p className="font-bold">{t('networkBuilder.noContacts', 'No contacts found.')}</p>
            </div>
          )}
        </div>
      </div>

      {showForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('networkBuilder.form.title', 'Add Contact')}</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('networkBuilder.form.fullName', 'Full Name')}</label>
                  <input style={inputStyle} placeholder={String(t('networkBuilder.form.namePlaceholder', 'Name…'))} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('networkBuilder.form.location', 'Location / Ward')}</label>
                  <input style={inputStyle} placeholder={String(t('networkBuilder.form.locationPlaceholder', 'Ward / Area…'))} value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('networkBuilder.form.interest', 'Interest')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.interest} onChange={e=>setForm(f=>({...f,interest:e.target.value}))}>
                    {INTERESTS.map(i=><option key={i} value={i}>{t(`networkBuilder.interests.${i}`, i)}</option>)}</select></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('networkBuilder.form.platform', 'Platform')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
                    {['Facebook', 'Instagram', 'WhatsApp', 'None'].map(p=><option key={p} value={p}>{t(`networkBuilder.platforms.${p}`, p)}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('networkBuilder.form.phone', 'Phone')}</label>
                  <input style={inputStyle} placeholder={String(t('networkBuilder.form.phonePlaceholder', 'Phone number…'))} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('networkBuilder.form.tag', 'Tag')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value as Tag}))}>
                    {TAGS.map(tOption=><option key={tOption} value={tOption}>{t(`networkBuilder.tags.${tOption}`, tOption)}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('networkBuilder.form.note', 'Note')}</label>
                <input style={inputStyle} placeholder={String(t('networkBuilder.form.notePlaceholder', 'Any notes…'))} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>{t('networkBuilder.form.cancel', 'Cancel')}</button>
              <button onClick={addContact} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>{t('networkBuilder.form.submit', 'Add Contact')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
