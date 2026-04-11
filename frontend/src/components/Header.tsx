import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { io } from 'socket.io-client';
import { NavLink } from 'react-router-dom';
import { Bell, CheckCheck, Inbox, Menu, Languages } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import { haptics } from '../utils/haptics';
import { useTranslation } from 'react-i18next';

const socket = io('http://localhost:3001');

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
   const { t, i18n } = useTranslation();
   const [notifications, setNotifications] = useState<any[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

   useEffect(() => {
     fetchNotifs();
     socket.on('inbox:new_item:demo-user-id', (item) => {
       setNotifications(prev => [item, ...prev].slice(0, 10));
     });
     return () => { socket.off('inbox:new_item:demo-user-id'); };
   }, []);

   const fetchNotifs = async () => {
      try {
         const res = await api.get('/inbox?unreadOnly=true&limit=10');
         setNotifications(res.data.items);
      } catch (err) { console.error('Failed fetching alerts'); }
   };

   const markAllRead = async () => {
      try {
        await Promise.all(notifications.map(n => api.patch(`/inbox/${n.id}/read`)));
        setNotifications([]);
        setIsOpen(false);
      } catch (err) {}
   };

   const platformMeta = (platform: string): { color: string; icon: React.ReactNode } => {
     const p = platform?.toUpperCase();
     if (p === 'INSTAGRAM') return { color: '#e1306c', icon: <FaInstagram size={11} /> };
     if (p === 'FACEBOOK')  return { color: '#1877f2', icon: <FaFacebookF size={11} /> };
     if (p === 'TWITTER')   return { color: '#1d9bf0', icon: <FaTwitter size={11} /> };
     return { color: 'var(--brand-600)', icon: null };
   };

   return (
      <header className="h-16 flex items-center justify-between px-3 md:px-6 lg:px-8 shrink-0 relative z-50 transition-all"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--slate-200)',
          boxShadow: '0 1px 3px rgba(2, 132, 199, 0.04)',
        }}
      >
         <div className="flex items-center gap-4">
            <button 
              onClick={() => { onMenuClick(); haptics.medium(); }}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest hidden sm:inline-block" style={{ color: 'var(--slate-400)' }}>
              {t('header.workspaceHub', 'Workspace Hub')}
            </span>
         </div>

         <div className="flex items-center gap-2">
            <div className="relative">
               <button
                  onClick={() => { setIsLangMenuOpen(!isLangMenuOpen); haptics.medium(); setIsOpen(false); }}
                  className="flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all hover:bg-slate-100 text-slate-500"
               >
                  <Languages size={18} strokeWidth={1.8} />
                  <span className="hidden sm:inline">{i18n.language === 'en' ? 'English' : 'मराठी'}</span>
               </button>

               {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden py-1">
                     <button
                        onClick={() => { i18n.changeLanguage('mr'); setIsLangMenuOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${i18n.language === 'mr' ? 'text-brand-600 bg-brand-50' : 'text-slate-700'}`}
                     >
                        मराठी
                     </button>
                     <button
                        onClick={() => { i18n.changeLanguage('en'); setIsLangMenuOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${i18n.language === 'en' ? 'text-brand-600 bg-brand-50' : 'text-slate-700'}`}
                     >
                        English
                     </button>
                  </div>
               )}
            </div>

            <div className="relative">
            <button
               id="notification-bell-btn"
               onClick={() => { setIsOpen(!isOpen); haptics.medium(); setIsLangMenuOpen(false); }}
               className="relative p-2.5 rounded-xl transition-all"
               style={isOpen
                 ? { background: 'var(--brand-50)', color: 'var(--brand-600)' }
                 : { color: 'var(--slate-400)' }
               }
               onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = 'var(--slate-100)'; }}
               onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
               <Bell size={20} strokeWidth={1.8} />
               {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"
                    style={{ background: '#ef4444' }} />
               )}
            </button>

            {isOpen && (
               <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 rounded-2xl overflow-hidden flex flex-col"
                 style={{
                   background: '#ffffff',
                   border: '1px solid var(--slate-200)',
                   boxShadow: '0 10px 40px rgba(2,132,199,0.12)',
                 }}
               >
                  <div className="px-5 py-4 flex justify-between items-center"
                    style={{ borderBottom: '1px solid var(--slate-100)', background: 'var(--slate-50)' }}
                  >
                     <span className="font-bold tracking-tight flex items-center gap-2"
                       style={{ color: 'var(--slate-800)', fontFamily: 'Outfit, sans-serif' }}>
                       <Bell size={15} strokeWidth={2} style={{ color: 'var(--brand-600)' }} />
                       {t('header.alerts', 'Alerts')}
                     </span>
                     {notifications.length > 0 && (
                       <button onClick={markAllRead}
                         className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                         style={{ color: 'var(--brand-600)', background: 'var(--brand-50)' }}>
                         <CheckCheck size={12} />
                         {t('header.markAllRead', 'Mark all read')}
                       </button>
                     )}
                  </div>

                  <div className="max-h-[min(50vh,420px)] overflow-y-auto">
                     {notifications.length === 0 ? (
                       <div className="py-12 flex flex-col items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                           style={{ background: 'var(--slate-100)' }}>
                           <Inbox size={22} strokeWidth={1.5} style={{ color: 'var(--slate-400)' }} />
                         </div>
                         <p className="text-sm font-medium" style={{ color: 'var(--slate-400)' }}>
                           {t('header.noAlerts', 'No new engagement alerts.')}
                         </p>
                       </div>
                     ) : (
                       notifications.map(n => {
                         const meta = platformMeta(n.socialAccount?.platform);
                         return (
                           <NavLink key={n.id} to="/inbox" onClick={() => setIsOpen(false)}
                             className="p-4 flex gap-3 transition-colors cursor-pointer block"
                             style={{ borderBottom: '1px solid var(--slate-50)' }}
                             onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'}
                             onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                           >
                             {/* Avatar */}
                             <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                               style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                               {n.authorHandle?.charAt(1)?.toUpperCase() ?? '?'}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-0.5">
                                 <p className="text-xs font-bold truncate" style={{ color: 'var(--slate-800)' }}>
                                   {n.authorHandle}
                                 </p>
                                 <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                                   style={{ background: 'var(--slate-100)', color: 'var(--slate-500)' }}>
                                   {n.type}
                                 </span>
                               </div>
                               <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--slate-500)' }}>
                                 {n.content}
                               </p>
                               {/* Platform with real brand icon */}
                               <p className="text-[10px] mt-1 font-semibold flex items-center gap-1"
                                 style={{ color: meta.color }}>
                                 {meta.icon}
                                 {n.socialAccount?.platform}
                               </p>
                             </div>
                           </NavLink>
                         );
                       })
                     )}
                  </div>

                  {notifications.length > 0 && (
                     <div className="p-3 text-center" style={{ borderTop: '1px solid var(--slate-100)', background: 'var(--slate-50)' }}>
                       <NavLink to="/inbox" onClick={() => setIsOpen(false)}
                         className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                         style={{ color: 'var(--brand-600)' }}>
                         {t('header.viewAllInbox', 'View all in Unified Inbox')}
                       </NavLink>
                     </div>
                  )}
               </div>
            )}
            </div>
         </div>
      </header>
   );
};
