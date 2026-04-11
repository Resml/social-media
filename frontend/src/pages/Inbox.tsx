import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { io } from 'socket.io-client';
import { CheckCircle2, Sparkles, Target, Bot, ChevronLeft } from 'lucide-react';

import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
const socket = io('http://localhost:3001');
import { haptics } from '../utils/haptics';

export const Inbox = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [tone, setTone] = useState<'friendly' | 'professional' | 'witty' | 'empathetic'>('friendly');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastErr, setToastErr] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const getBrandIcon = (platform: string, size: number = 10) => {
    const p = platform?.toUpperCase();
    if (p === 'INSTAGRAM') return <FaInstagram size={size} fill="#e1306c" />;
    if (p === 'TWITTER') return <FaTwitter size={size} fill="#1d9bf0" />;
    if (p === 'FACEBOOK') return <FaFacebookF size={size} fill="#1877f2" />;
    return null;
  };

  useEffect(() => {
    fetchInbox();
    const socketEventStr = `inbox:new_item:demo-user-id`;
    socket.on(socketEventStr, (newItem) => {
      setItems(prev => {
        if (filter !== 'ALL' && newItem.type !== filter) return prev;
        return [newItem, ...prev];
      });
    });
    return () => { socket.off(socketEventStr); };
  }, [filter]);

  const fetchInbox = async () => {
    try {
      const res = await api.get(`/inbox?type=${filter}`);
      setItems(res.data.items);
    } catch(err) { console.error(err); }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/inbox/${id}/read`);
      setItems(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item));
      if (selectedItem?.id === id) setSelectedItem({ ...selectedItem, isRead: true });
    } catch(err) { console.error(err); }
  };

  const markAsResolved = async (id: string, e?: any) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/inbox/${id}/resolve`);
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      setSuggestions([]);
      setSelectedSuggestion(null);
    } catch(err) { console.error(err); }
  };

  const triggerAI = async (selectedTone: string = tone) => {
    if (!selectedItem) return;
    setIsGenerating(true);
    setSuggestions([]);
    setSelectedSuggestion(null);
    setToastErr(null);
    try {
       const res = await api.post(`/ai/suggest-reply`, { inboxItemId: selectedItem.id, tone: selectedTone });
       setSuggestions(res.data.suggestions || []);
    } catch (err: any) {
       setToastErr(t('inbox.ai.apiError', 'API limits reached or server failed to communicate with OpenAI. Try again later.'));
    } finally {
       setIsGenerating(false);
    }
  };

  const executeReply = async () => {
    if (!selectedItem || !selectedSuggestion) return;
    setIsPosting(true);
    setToastErr(null);
    try {
      await api.post(`/engagement/reply`, { inboxItemId: selectedItem.id, text: selectedSuggestion });
      await markAsResolved(selectedItem.id);
    } catch (err: any) {
       const reason = err.response?.data?.error || t('inbox.networkError', 'A network error occurred');
       setToastErr(`${t('inbox.safetyBlock', 'Safety Guard Blocked')}: ${reason}`);
    } finally {
       setIsPosting(false);
    }
  };

  const aiPills = ['friendly', 'professional', 'witty', 'empathetic'] as const;

  return (
    <div className="flex-1 flex overflow-hidden relative" style={{ background: 'var(--slate-50)' }}>

      {/* Error toast */}
      {toastErr && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl min-w-[320px]"
          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5">{t('inbox.policyRestriction', 'Policy Restriction')}</p>
            <p className="text-sm">{toastErr}</p>
          </div>
          <button onClick={() => setToastErr(null)} className="font-bold text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Left column — message list */}
      <div className={`
        w-full lg:w-[380px] shrink-0 flex flex-col h-full transition-all
        ${selectedItem ? 'hidden lg:flex' : 'flex'}
      `}
        style={{ background: '#ffffff', borderRight: '1px solid var(--slate-200)' }}>

        {/* Filter tabs */}
        <div className="p-4 flex gap-2 shrink-0" style={{ borderBottom: '1px solid var(--slate-100)' }}>
          {['ALL', 'COMMENT', 'MENTION', 'TAG'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all active:scale-95"
              style={filter === f
                ? { background: 'var(--brand-600)', color: '#fff', boxShadow: '0 2px 6px rgba(2,132,199,0.25)' }
                : { background: 'var(--slate-100)', color: 'var(--slate-500)' }
              }
            >
              {t(`inbox.filter.${f}`, f)}
            </button>
          ))}
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {items.map(item => (
            <div key={item.id}
              onClick={() => { haptics.success(); setSelectedItem(item); setSuggestions([]); setSelectedSuggestion(null); setToastErr(null); if (!item.isRead) markAsRead(item.id); }}
              className="p-4 cursor-pointer transition-colors flex gap-3"
              style={{
                borderBottom: '1px solid var(--slate-50)',
                background: item.id === selectedItem?.id ? 'var(--brand-50)' : undefined,
              }}
              onMouseEnter={e => { if (item.id !== selectedItem?.id) (e.currentTarget as HTMLElement).style.background = 'var(--slate-50)'; }}
              onMouseLeave={e => { if (item.id !== selectedItem?.id) (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: 'var(--brand-100)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}>
                {item.authorHandle?.charAt(1)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm truncate mr-2"
                    style={{ fontWeight: item.isRead ? 500 : 700, color: item.isRead ? 'var(--slate-600)' : 'var(--slate-900)' }}>
                    {item.authorHandle}
                  </span>
                  <span className="text-xs whitespace-nowrap" style={{ color: 'var(--slate-400)' }}>
                    {new Date(item.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex gap-1.5 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1"
                    style={{ background: 'var(--slate-100)', color: 'var(--slate-600)' }}>
                    {getBrandIcon(item.socialAccount?.platform)}
                    {item.socialAccount?.platform}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                    style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}>
                    {item.type}
                  </span>
                </div>
                <p className="text-sm line-clamp-2 leading-relaxed"
                  style={{ color: item.isRead ? 'var(--slate-400)' : 'var(--slate-700)', fontWeight: item.isRead ? 400 : 500 }}>
                  {item.content}
                </p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="h-full flex items-center justify-center text-sm font-medium italic" style={{ color: 'var(--slate-400)' }}>
              {t('inbox.emptyState', 'Inbox clear. Waiting for engagements…')}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — detail + AI */}
      <div 
        className={`
          flex-1 overflow-y-auto p-4 lg:p-8
          ${selectedItem ? 'flex flex-col' : 'hidden lg:flex flex-col items-center justify-center'}
        `} 
        style={{ background: 'var(--slate-50)' }}
        onTouchStart={(e) => {
          (window as any).swipeStartX = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const deltaX = e.changedTouches[0].clientX - ((window as any).swipeStartX || 0);
          if (deltaX > 80) setSelectedItem(null); // Swipe right to go back
        }}
      >
        {selectedItem ? (
          <div className="max-w-3xl w-full mx-auto rounded-2xl p-4 lg:p-8"
            style={{ background: '#ffffff', border: '1px solid var(--slate-100)', boxShadow: '0 2px 12px rgba(2,132,199,0.07)' }}>
            {/* Detail header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-7 pb-5" style={{ borderBottom: '1px solid var(--slate-100)' }}>
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => { setSelectedItem(null); haptics.medium(); }}
                   className="lg:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                 >
                   <ChevronLeft size={20} />
                 </button>
                 <div>
                   <h2 className="text-xl lg:text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
                     {selectedItem.authorHandle}
                   </h2>
                   <p className="text-[10px] lg:text-sm uppercase tracking-widest mt-1 flex items-center gap-1.5" style={{ color: 'var(--slate-400)' }}>
                     {getBrandIcon(selectedItem.socialAccount?.platform, 12)}
                     {selectedItem.socialAccount?.platform} {selectedItem.type}
                   </p>
                 </div>
               </div>
               <button onClick={(e) => { markAsResolved(selectedItem.id, e); haptics.success(); }}
                 className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95"
                 style={{ background: '#10b981', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                 <CheckCircle2 size={16} strokeWidth={2.5} /> {t('inbox.resolveThread', 'Resolve Thread')}
               </button>
            </div>

            {/* Content quote */}
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--slate-400)' }}>{t('inbox.engagementContent', 'Engagement Content')}</span>
            </div>
            <div className="p-6 rounded-xl text-lg leading-relaxed mb-9 shadow-inner"
              style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-100)', color: 'var(--slate-700)' }}>
              &quot;{selectedItem.content}&quot;
            </div>

            {/* AI Panel */}
            <div className="rounded-2xl p-7" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-extrabold text-xl flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--brand-900)' }}>
                   <Sparkles size={18} strokeWidth={2} /> {t('inbox.automatedEngagement', 'Automated Engagement')}
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {aiPills.map(t_opt => (
                     <button key={t_opt}
                       onClick={() => { setTone(t_opt); triggerAI(t_opt); }}
                       className="px-3 py-1.5 text-[10px] md:text-xs font-bold capitalize rounded-lg transition-colors border"
                       style={tone === t_opt
                         ? { background: 'var(--brand-600)', color: '#fff', borderColor: 'var(--brand-700)', boxShadow: '0 1px 3px rgba(2,132,199,0.3)' }
                         : { background: '#fff', color: 'var(--brand-500)', borderColor: 'var(--brand-200)' }
                       }
                     >
                       <span className="flex items-center gap-1">
                         {tone === t_opt && <Target size={12} strokeWidth={2.5} />}
                         {t(`inbox.tone.${t_opt}`, t_opt)}
                       </span>
                     </button>
                   ))}
                 </div>
               </div>

               {suggestions.length === 0 && !isGenerating ? (
                 <button onClick={() => triggerAI(tone)}
                   className="w-full rounded-xl p-8 border-2 border-dashed flex flex-col items-center justify-center transition-colors group cursor-pointer"
                   style={{ borderColor: 'var(--brand-300)', background: '#fff' }}
                   onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'}
                   onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                 >
                    <Bot size={36} strokeWidth={1.5} className="mb-3 group-hover:scale-110 transition-transform inline-block" />
                    <span className="font-bold text-lg" style={{ color: 'var(--brand-700)' }}>Generate Contextual Replies</span>
                    <span className="text-sm font-medium mt-1" style={{ color: 'var(--brand-400)' }}>Leveraging GPT-4o analysis</span>
                 </button>
               ) : isGenerating ? (
                 <div className="w-full rounded-xl p-10 flex flex-col items-center justify-center animate-pulse"
                   style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--brand-100)', color: 'var(--brand-600)' }}>
                    <svg className="animate-spin h-8 w-8 mb-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="font-bold">{t('inbox.ai.analyzing', 'Analyzing Context & Synthesizing Variations…')}</span>
                 </div>
               ) : (
                 <div className="flex flex-col gap-3">
                   {suggestions.map((s, idx) => (
                     <div key={idx} onClick={() => setSelectedSuggestion(s)}
                       className="p-4 bg-white rounded-xl border-2 cursor-pointer transition-all"
                       style={selectedSuggestion === s
                         ? { borderColor: 'var(--brand-500)', boxShadow: '0 0 0 3px var(--brand-100)' }
                         : { borderColor: 'transparent', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
                       }
                     >
                       <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--slate-800)' }}>{s}</p>
                     </div>
                   ))}
                   <div className="mt-4 flex justify-end">
                      <button disabled={!selectedSuggestion || isPosting} onClick={executeReply}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2 min-w-[200px] justify-center"
                        style={{ background: 'var(--brand-600)', boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
                        onMouseEnter={e => { if (!isPosting && selectedSuggestion) (e.currentTarget as HTMLElement).style.background = 'var(--brand-700)'; }}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)'}
                      >
                        {isPosting ? t('inbox.ai.executing', 'Executing…') : t('inbox.ai.approvePost', 'Approve & Post Reply 🚀')}
                      </button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center" style={{ color: 'var(--slate-300)' }}>
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span className="font-semibold text-lg tracking-wide" style={{ color: 'var(--slate-400)' }}>{t('inbox.selectThread', 'Select a thread to view details')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
