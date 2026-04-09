import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../api/axios';
import {
  LayoutDashboard,
  Inbox,
  Search,
  CalendarClock,
  Bot,
  Download,
  MessageSquarePlus,
  Settings,
  BarChart3,
} from 'lucide-react';

const socket = io('http://localhost:3001');

const navItems = [
  { to: '/',              label: 'Dashboard',        Icon: LayoutDashboard },
  { to: '/inbox',         label: 'Unified Inbox',    Icon: Inbox,           isBadge: true },
  { to: '/search',        label: 'Post Search',      Icon: Search },
  { to: '/schedule',      label: 'Schedule',         Icon: CalendarClock },
  { to: '/ai',            label: 'AI Assistant',     Icon: Bot },
  { to: '/export',        label: 'Comment Exporter', Icon: Download },
  { to: '/quick-comment', label: 'Quick Commenter',  Icon: MessageSquarePlus },
];

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/inbox?unreadOnly=true').then(res => {
      setUnreadCount(res.data.total ?? 0);
    }).catch(() => {});

    socket.on('inbox:new_item:demo-user-id', () => {
      setUnreadCount(prev => prev + 1);
    });

    return () => { socket.off('inbox:new_item:demo-user-id'); };
  }, []);

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 shrink-0 flex flex-col transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}
      style={{ background: '#ffffff', borderRight: '1px solid var(--slate-200)' }}>

      {/* Close button for mobile */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>


      {/* Logo */}
      <div className="px-5 py-5 mb-1" style={{ borderBottom: '1px solid var(--slate-100)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-700))' }}>
            <BarChart3 size={16} strokeWidth={2.2} />
          </div>
          <span className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
            SocialHub
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest select-none"
          style={{ color: 'var(--slate-400)' }}>
          Navigation
        </p>

        {navItems.map(({ to, label, Icon, isBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="sidebar-link"
          >
            <span className="flex items-center gap-3">
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </span>
            {isBadge && unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full leading-none select-none"
                style={{ background: '#ef4444', color: '#fff' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Settings at bottom */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid var(--slate-200)' }}>
        <NavLink to="/settings" className="sidebar-link">
          <span className="flex items-center gap-3">
            <Settings size={17} strokeWidth={1.8} />
            Settings
          </span>
        </NavLink>
      </div>
    </div>
  );
};
