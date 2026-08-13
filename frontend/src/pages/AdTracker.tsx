import React, { useState } from 'react';
import { Plus, X, TrendingUp, DollarSign, Eye, MousePointer, Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { AdTrackerReport } from '../components/AdTrackerReport';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Ad {
  id: string; month: string; campaign: string; spend: number;
  reach: number; clicks: number; platform: string; status: 'active'|'ended'; notes: string;
}


const inputStyle: React.CSSProperties = {
  width:'100%', padding:'0.65rem 0.9rem', borderRadius:'0.65rem',
  border:'1px solid var(--slate-200)', background:'var(--slate-50)',
  fontSize:'0.875rem', color:'var(--slate-900)', outline:'none',
};

export const AdTracker = () => {
  const { t } = useTranslation();

  const [ads, setAds] = useState<Ad[]>(() => [
    { id:'1', month:String(t('adTracker.mockData.campaign1.month', 'May 2025')), campaign:String(t('adTracker.mockData.campaign1.campaign', 'Ward development awareness')), spend:500, reach:18400, clicks:740, platform:'Facebook', status:'active', notes:String(t('adTracker.mockData.campaign1.notes', 'Running well')) },
    { id:'2', month:String(t('adTracker.mockData.campaign2.month', 'April 2025')), campaign:String(t('adTracker.mockData.campaign2.campaign', 'Community event promotion')), spend:400, reach:12300, clicks:510, platform:'Facebook', status:'ended', notes:String(t('adTracker.mockData.campaign2.notes', 'Good reach')) },
    { id:'3', month:String(t('adTracker.mockData.campaign3.month', 'March 2025')), campaign:String(t('adTracker.mockData.campaign3.campaign', 'Voter registration drive')), spend:600, reach:22100, clicks:890, platform:'Facebook', status:'ended', notes:String(t('adTracker.mockData.campaign3.notes', 'High engagement')) },
    { id:'4', month:String(t('adTracker.mockData.campaign4.month', 'February 2025')), campaign:String(t('adTracker.mockData.campaign4.campaign', 'Festival greetings sponsored')), spend:300, reach:8900, clicks:310, platform:'Facebook', status:'ended', notes:String(t('adTracker.mockData.campaign4.notes', '')) },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Ad,'id'>>({
    month:'', campaign:'', spend:0, reach:0, clicks:0, platform:'Facebook', status:'active', notes:''
  });
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
      pdf.save(`AdTracker_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const addAd = () => {
    if(!form.campaign||!form.month) return;
    setAds(p=>[{id:Date.now().toString(),...form},...p]);
    setShowForm(false);
    setForm({month:'',campaign:'',spend:0,reach:0,clicks:0,platform:'Facebook',status:'active',notes:''});
  };

  const totalSpend  = ads.reduce((a,d)=>a+d.spend, 0);
  const totalReach  = ads.reduce((a,d)=>a+d.reach, 0);
  const totalClicks = ads.reduce((a,d)=>a+d.clicks, 0);
  const avgCPC      = totalClicks>0 ? (totalSpend/totalClicks).toFixed(2) : '—';

  const statItems = [
    { label:t('adTracker.stats.totalSpent', 'Total Spent'),  value:`₹${totalSpend.toLocaleString()}`, Icon: DollarSign,   color:'var(--brand-800)', bg:'var(--brand-100)' },
    { label:t('adTracker.stats.totalReach', 'Total Reach'),  value:totalReach.toLocaleString(),         Icon: Eye,          color:'var(--brand-700)', bg:'var(--brand-50)'  },
    { label:t('adTracker.stats.totalClicks', 'Total Clicks'), value:totalClicks.toLocaleString(),        Icon: MousePointer, color:'var(--brand-600)', bg:'var(--brand-50)'  },
    { label:t('adTracker.stats.avgCPC', 'Avg. CPC'),     value:`₹${avgCPC}`,                        Icon: TrendingUp,   color:'var(--brand-900)', bg:'var(--brand-100)' },
  ];

  return (
    <div className="flex-1 overflow-y-auto relative z-0" style={{background:'var(--slate-50)', padding:'1.5rem'}}>
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <AdTrackerReport ads={ads} />
      </div>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--brand-600)'}}>
              <TrendingUp size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('adTracker.title', 'Ad Tracker')}</h1>
              <p className="text-sm" style={{color:'var(--slate-500)'}}>{t('adTracker.subtitle', 'Track monthly paid campaigns · Document goal: 1 paid ad per month')}</p>
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
              <Plus size={16}/> {t('adTracker.addCampaign', 'Add Campaign')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {statItems.map(s=>{
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

        {/* Ad Cards */}
        <div className="space-y-4">
          {ads.map(ad=>{
            const cpc = ad.clicks>0 ? (ad.spend/ad.clicks).toFixed(2) : '—';
            return (
              <div key={ad.id} className="bg-white rounded-2xl border p-5 group transition-all hover:shadow-md" style={{borderColor:'var(--slate-200)'}}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{background:ad.status==='active'?'var(--brand-100)':'var(--slate-100)', color:ad.status==='active'?'var(--brand-700)':'var(--slate-500)'}}>
                        {ad.status==='active'?t('adTracker.status.active', 'Active'):t('adTracker.status.ended', 'Ended')}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{background:'var(--brand-50)',color:'var(--brand-700)'}}>
                        {ad.platform === 'Facebook' ? t('dashboard.platforms.facebook', 'Facebook') : ad.platform === 'Instagram' ? t('dashboard.platforms.instagram', 'Instagram') : t('liveTracker.form.both', 'Both')}
                      </span>
                      <span className="text-[11px]" style={{color:'var(--slate-400)'}}>{ad.month}</span>
                    </div>
                    <h3 className="font-bold" style={{color:'var(--slate-900)'}}>{ad.campaign}</h3>
                    {ad.notes&&<p className="text-xs mt-0.5 italic" style={{color:'var(--slate-400)'}}>"{ad.notes}"</p>}
                  </div>
                  <button onClick={()=>setAds(p=>p.filter(x=>x.id!==ad.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 shrink-0"><X size={15}/></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {label:t('adTracker.card.spend', 'Spend'),   value:`₹${ad.spend.toLocaleString()}`,  Icon:DollarSign},
                    {label:t('adTracker.card.reach', 'Reach'),   value:ad.reach.toLocaleString(),          Icon:Eye},
                    {label:t('adTracker.card.clicks', 'Clicks'),  value:ad.clicks.toLocaleString(),         Icon:MousePointer},
                    {label:t('adTracker.card.cpc', 'CPC'),     value:`₹${cpc}`,                          Icon:TrendingUp},
                  ].map(m=>{
                    const MIcon=m.Icon;
                    return (
                      <div key={m.label} className="rounded-xl p-3 text-center" style={{background:'var(--brand-50)'}}>
                        <div className="flex items-center justify-center gap-1 mb-0.5" style={{color:'var(--brand-600)'}}>
                          <MIcon size={12} strokeWidth={2}/>
                          <span className="text-[11px] font-bold" style={{color:'var(--slate-500)'}}>{m.label}</span>
                        </div>
                        <div className="font-bold text-sm" style={{color:'var(--brand-700)'}}>{m.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {ads.length===0&&(
            <div className="text-center py-16 text-slate-400"><TrendingUp size={48} className="mx-auto mb-4 opacity-30"/><p className="font-bold">{t('adTracker.noCampaigns', 'No campaigns yet.')}</p></div>
          )}
        </div>
      </div>

      {showForm&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(15,23,42,0.5)', backdropFilter:'blur(4px)'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{fontFamily:'Outfit,sans-serif',color:'var(--slate-900)'}}>{t('adTracker.form.title', 'Add Campaign')}</h3>
              <button onClick={()=>setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('adTracker.form.month', 'Month')}</label>
                  <input style={inputStyle} placeholder={String(t('adTracker.form.monthPlaceholder', 'e.g. May 2025'))} value={form.month} onChange={e=>setForm(f=>({...f,month:e.target.value}))}/></div>
                <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('adTracker.form.platform', 'Platform')}</label>
                  <select style={{...inputStyle,cursor:'pointer'}} value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
                    <option value="Facebook">{t('dashboard.platforms.facebook', 'Facebook')}</option>
                    <option value="Instagram">{t('dashboard.platforms.instagram', 'Instagram')}</option>
                    <option value="Both">{t('liveTracker.form.both', 'Both')}</option></select></div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('adTracker.form.campaignName', 'Campaign Name')}</label>
                <input style={inputStyle} placeholder={String(t('adTracker.form.campaignPlaceholder', 'Campaign description…'))} value={form.campaign} onChange={e=>setForm(f=>({...f,campaign:e.target.value}))}/></div>
              <div className="grid grid-cols-3 gap-3">
                {(['spend','reach','clicks'] as const).map(field=>(
                  <div key={field}><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t(`adTracker.form.${field}`, field)}</label>
                    <input type="number" style={inputStyle} value={(form as any)[field]} onChange={e=>setForm(f=>({...f,[field]:+e.target.value}))} min={0}/></div>
                ))}
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{color:'var(--slate-400)'}}>{t('adTracker.form.notes', 'Notes')}</label>
                <input style={inputStyle} placeholder={String(t('adTracker.form.notesPlaceholder', 'Any notes…'))} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border hover:bg-slate-50" style={{borderColor:'var(--slate-200)',color:'var(--slate-600)'}}>{t('adTracker.form.cancel', 'Cancel')}</button>
              <button onClick={addAd} className="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 active:scale-95" style={{background:'var(--brand-600)'}}>{t('adTracker.form.submit', 'Add Campaign')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
