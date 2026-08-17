import { useEffect, useState, useRef } from 'react';
import { api } from '../api/axios';
import { StatCard } from '../components/StatCard';
import { EngagementChart, FollowerGrowthChart } from '../components/Charts';
import { Users, TrendingUp, Eye, AtSign, ArrowUp, Download } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { toast } from 'sonner';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { DashboardReport } from '../components/DashboardReport';
import { useTranslation } from 'react-i18next';

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const platform = 'ALL';
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [engagement, setEngagement] = useState<any[]>([]);
  const [recentInbox, setRecentInbox] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    api.get('/auth/accounts').then(res => {
      setAccounts(res.data);
      if (res.data.length > 0) setSelectedAccount(res.data[0].id);
    });
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, growRes, engRes, inboxRes] = await Promise.all([
        api.get(`/analytics/summary?platform=${platform}`),
        api.get(`/analytics/growth?platform=${platform}`),
        api.get(`/analytics/engagement-trend?platform=${platform}`),
        api.get(`/inbox?platform=${platform}&limit=4`)
      ]);
      setSummary(sumRes.data);
      setGrowth(growRes.data);
      setEngagement(engRes.data);
      setRecentInbox(inboxRes.data.items || []);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [platform]);

    const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    haptics.medium();
    const toastId = toast.loading('Generating PDF report... Please wait.');
    try {
      const element = reportRef.current;
      if (!element) {
        toast.error("Report template not found", { id: toastId });
        return;
      }
      
      const imgData = await htmlToImage.toPng(element, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff'
      });
      
      if (!imgData || imgData === 'data:,') {
        toast.error("Failed to capture report. Image is empty.", { id: toastId });
        return;
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleManualSync = async () => {
    if (!selectedAccount) return;
    setIsSyncing(true);
    haptics.medium();
    try {
      await api.post(`/social/sync/${selectedAccount}`);
      // Notify user or show status
      setTimeout(() => {
        setIsSyncing(false);
        fetchData(); // reload dashboard
      }, 5000);
    } catch (err) {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setShowScrollTop(scrollRef.current.scrollTop > 400);
      }
    };
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    haptics.medium();
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ background: 'var(--slate-50)', padding: '0.75rem' }}>
            <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: -50, width: '794px' }}>
        <DashboardReport summary={summary} growth={growth} engagement={engagement} />
      </div>

      <div className="w-full md:p-4">

        {/* Pro Header */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 mb-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--slate-900)' }}>
                {t('dashboard.professionalDashboard', 'Professional Dashboard')}
              </h1>
              <p className="text-slate-500 text-sm">
                {t('dashboard.trackPerformance', 'Track your performance and manage your content library.')}
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3 w-full lg:w-auto ml-auto">
              <select 
                value={selectedAccount || ''}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="flex-1 lg:w-48 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 outline-none focus:ring-2 focus:ring-brand-400"
                disabled={accounts.length === 0}
              >
                {accounts.length === 0 ? (
                  <option value="">{t('dashboard.noAccounts', 'No accounts connected')}</option>
                ) : (
                  accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{String(t(`dashboard.platforms.${acc.platform.toLowerCase()}`, acc.platform)).toUpperCase()}: {acc.accountHandle}</option>
                  ))
                )}
              </select>
              
              <button 
                onClick={generatePDF}
                disabled={isGeneratingReport}
                className={`px-2.5 py-1.5 h-fit rounded-lg border font-medium text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${isGeneratingReport ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-[#f0f8ff] text-[#0076ce] border-[#bfe0ff] hover:bg-[#e0f0ff]'}`}
              >
                {isGeneratingReport ? (
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={12} />}
                {isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : t('dashboard.report.downloadPdf', 'Download PDF')}
              </button>
              
              <button
                disabled={isSyncing}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {isSyncing ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <TrendingUp size={16} />}
                {isSyncing ? t('dashboard.syncing', 'Syncing...') : t('dashboard.syncContent', 'Sync Content')}
              </button>
            </div>
          </div>
        </div>

        {/* Performance Overview section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
             <h2 className="text-lg font-bold" style={{ color: 'var(--slate-800)' }}>{t('dashboard.performance', 'Performance')}</h2>
             <span className="text-xs text-slate-500 font-medium">{t('dashboard.last7Days', 'Last 7 days')}</span>
          </div>

          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <StatCard label={t('dashboard.stats.postImpressions', 'Post Reach')}  value={summary.postImpressions.toLocaleString()} delta={summary.impressionsDelta} deltaSuffix="%" icon={Eye} />
              <StatCard label={t('dashboard.stats.newMentions', 'New Mentions')} value={summary.newMentions} delta={summary.mentionsDelta} icon={AtSign} />
              <StatCard label={t('dashboard.stats.totalFollowers', 'Net Followers')} value={summary.totalFollowers.toLocaleString()} delta={summary.followerDelta}    deltaSuffix="%" icon={Users} />
              <StatCard label={t('dashboard.stats.engagementRate', 'Engagement Rate')} value={`${summary.engagementRate}%`} delta={summary.engagementDelta} deltaSuffix="%" icon={TrendingUp} />
            </div>
          )}
        </div>

        {/* Content Mix Formula (from document) */}
        <div className="mb-8 rounded-2xl p-5 border" style={{ background: '#fff', borderColor: 'var(--slate-200)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base flex items-center gap-2" style={{ fontFamily: 'Outfit,sans-serif', color: 'var(--slate-800)' }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'var(--brand-50)',color:'var(--brand-600)'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </span>
              {t('dashboard.contentMixFormula', 'Content Mix Formula')}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>{t('dashboard.fromStrategyDoc', 'From your strategy doc')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('dashboard.mix.personal', 'Personal Posts'),  pct: 50, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, shade: 'var(--brand-800)', bg: 'var(--brand-100)', tip: t('dashboard.mix.personalTip', 'Gets highest likes, shares & comments') },
              { label: t('dashboard.mix.motivational', 'Motivational'),    pct: 25, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, shade: 'var(--brand-700)', bg: 'var(--brand-50)', tip: t('dashboard.mix.motivationalTip', 'Inspiration and leadership content') },
              { label: t('dashboard.mix.educational', 'Educational'),    pct: 17, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, shade: 'var(--brand-600)', bg: 'var(--brand-50)', tip: t('dashboard.mix.educationalTip', 'Informative, awareness content') },
              { label: t('dashboard.mix.entertainment', 'Entertainment'),  pct: 17, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>, shade: 'var(--slate-600)', bg: 'var(--slate-100)', tip: t('dashboard.mix.entertainmentTip', 'Cultural, fun, engaging content') },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-4 text-center" style={{ background: item.bg }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{background:'#fff',color:item.shade}}>{item.icon}</div>
                <div className="font-black text-2xl mb-0.5" style={{ color: item.shade }}>{item.pct}%</div>
                <div className="font-bold text-sm mb-1" style={{ color: item.shade }}>{item.label}</div>
                <div className="text-[11px]" style={{ color: 'var(--slate-500)' }}>{item.tip}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
          <div className="xl:col-span-2">
            <FollowerGrowthChart data={growth} />
          </div>
          <div>
            <EngagementChart data={engagement} />
          </div>
        </div>

        {/* Recent Inbox Activity */}
        <div className="rounded-2xl p-6"
          style={{
            background: '#ffffff',
            border: '1px solid var(--slate-100)',
            boxShadow: '0 1px 4px rgba(2, 132, 199, 0.06)',
          }}
        >
          <h2 className="font-bold mb-5" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-800)', fontSize: '1rem' }}>
            {t('dashboard.recentInbox.title', 'Recent Inbox Activity')}
          </h2>
          <div className="space-y-4">
            {recentInbox.length === 0 ? (
              <div className="text-sm italic" style={{ color: 'var(--slate-400)' }}>
                {t('dashboard.recentInbox.noActivity', 'No recent activity to show.')}
              </div>
            ) : (
              recentInbox.map((item, i, arr) => {
                const isBrand = item.type === 'COMMENT';
                const isAmber = item.type === 'MENTION';
                const typeLabel = String(t(`inbox.filter.${item.type}`, item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase()));
                
                return (
                  <div key={item.id} className={`flex gap-4 items-start pb-4 ${i < arr.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'var(--slate-100)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: isBrand ? 'var(--brand-100)' : isAmber ? '#fef3c7' : '#ccfbf1',
                        color:      isBrand ? 'var(--brand-700)' : isAmber ? '#b45309'  : '#0f766e',
                      }}>
                      {item.authorHandle ? item.authorHandle.substring(1, 3).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold tracking-wide"
                          style={{
                            background: isBrand ? 'var(--brand-50)' : isAmber ? '#fffbeb' : '#f0fdf9',
                            color:      isBrand ? 'var(--brand-600)' : isAmber ? '#b45309' : '#0f766e',
                          }}>
                          {typeLabel}
                        </span>
                        <span className="text-xs font-medium" style={{ color: 'var(--slate-400)' }}>
                          {item.authorHandle} · {item.socialAccount?.platform ? String(t(`dashboard.platforms.${item.socialAccount.platform.toLowerCase()}`, item.socialAccount.platform)).toUpperCase() : ''} · {new Date(item.receivedAt).toLocaleDateString(i18n.language.startsWith('hi') ? 'hi-IN' : i18n.language.startsWith('mr') ? 'mr-IN' : i18n.language.startsWith('hi') ? 'hi-IN' : 'en-US')}
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--slate-700)' }}>{item.content}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Engagement Tips */}
        <div className="mt-8 rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c3b6e 100%)', border: '1px solid #1e293b' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'rgba(2,132,199,0.3)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
            </div>
            <h2 className="font-bold text-white" style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1rem' }}>{t('dashboard.algorithmTips', 'Algorithm Tips — From Your Strategy Document')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              { svgPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', tip: t('dashboard.tips.postDaily', 'Post 2–3 times daily'), detail: t('dashboard.tips.postDailyDetail', 'Stay consistent — daily activity boosts reach significantly.') },
              { svgPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', tip: t('dashboard.tips.useImages', 'Use images in every post'), detail: t('dashboard.tips.useImagesDetail', 'Image posts get 2× more engagement than text-only posts.') },
              { svgPath: 'M7 20l4-16m2 16 4-16M6 9h14M4 15h14', tip: t('dashboard.tips.hashtags', '2–3 hashtags only'), detail: t('dashboard.tips.hashtagsDetail', 'Using too many hashtags reduces reach. Stick to 2–3 relevant ones.') },
              { svgPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', tip: t('dashboard.tips.repost', 'Repost after 15 days'), detail: t('dashboard.tips.repostDetail', 'Facebook shows posts to only 5–7% of followers. Repost important content.') },
              { svgPath: 'M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z', tip: t('dashboard.tips.goLive', 'Go Live as often as possible'), detail: t('dashboard.tips.goLiveDetail', 'Live videos get higher priority in the algorithm and build trust.') },
              { svgPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', tip: t('dashboard.tips.comment', 'Comment on others\' posts'), detail: t('dashboard.tips.commentDetail', 'Engaging with others increases your own post visibility in the feed.') },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{background:'rgba(2,132,199,0.25)'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2"><path d={item.svgPath}/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white mb-0.5">{item.tip}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll to Top FAB */}
        {showScrollTop && (
          <button 
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center text-brand-600 border border-slate-100 z-50 transition-all hover:scale-110 active:scale-90"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
          >
            <ArrowUp size={24} strokeWidth={2.5} />
          </button>
        )}

      </div>
    </div>
  );
};
