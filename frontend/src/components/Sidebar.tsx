import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../api/axios';
import {
  LayoutDashboard,
  Inbox,
  Search,
  CalendarClock,
  CalendarDays,
  Bot,
  Download,
  MessageSquarePlus,
  Settings,
  BarChart3,
  BarChart2,
  RefreshCw,
  Video,
  TrendingUp as TrendingUpIcon,
  Kanban,
  Network,
  Users,
  ClipboardList,
  FileText,
  Clapperboard,
  Film,
  Palette
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { useTranslation } from 'react-i18next';

const socket = io('http://localhost:3001');

const navGroups = [
  {
    titleKey: 'sidebar.overview',
    defaultTitle: 'Overview',
    items: [
      { to: '/',              labelKey: 'sidebar.dashboard',        defaultLabel: 'Professional Dashboard', Icon: LayoutDashboard },
      { to: '/inbox',         labelKey: 'sidebar.inbox',            defaultLabel: 'Unified Inbox',          Icon: Inbox,           isBadge: true },
    ]
  },
  {
    titleKey: 'sidebar.content',
    defaultTitle: 'Content Management',
    items: [
      { to: '/search',        labelKey: 'sidebar.postSearch',       defaultLabel: 'Content Library',        Icon: Search },
      { to: '/schedule',      labelKey: 'sidebar.schedule',         defaultLabel: 'Schedule',               Icon: CalendarClock },
      { to: '/content-calendar', labelKey: 'sidebar.contentCalendar', defaultLabel: 'Content Calendar',     Icon: CalendarDays },
      { to: '/reposts',       labelKey: 'sidebar.reposts',          defaultLabel: 'Repost Reminder',        Icon: RefreshCw },
    ]
  },
  {
    titleKey: 'sidebar.tools',
    defaultTitle: 'Grow & Engage',
    items: [
      { to: '/ai',            labelKey: 'sidebar.aiAssistant',      defaultLabel: 'AI Assistant',           Icon: Bot },
      { to: '/ai-video',      labelKey: 'sidebar.aiVideoMaker',     defaultLabel: 'AI Video Maker',         Icon: Film },
      { to: '/psd-editor',    labelKey: 'sidebar.psdEditor',        defaultLabel: 'PSD Editor',             Icon: Palette },
      { to: '/quick-comment', labelKey: 'sidebar.quickCommenter',   defaultLabel: 'Quick Commenter',        Icon: MessageSquarePlus },
      { to: '/export',        labelKey: 'sidebar.commentExporter',  defaultLabel: 'Comment Exporter',       Icon: Download },
      { to: '/polls',         labelKey: 'sidebar.polls',            defaultLabel: 'Poll Manager',           Icon: BarChart2 },
      { to: '/live-tracker',  labelKey: 'sidebar.liveTracker',      defaultLabel: 'Live Tracker',           Icon: Video },
      { to: '/ads',           labelKey: 'sidebar.ads',              defaultLabel: 'Ad Tracker',             Icon: TrendingUpIcon },
    ]
  },
  {
    titleKey: 'sidebar.organization',
    defaultTitle: 'Organization',
    items: [
      { to: '/team-tasks',    labelKey: 'sidebar.teamTasks',        defaultLabel: 'Team Tasks',             Icon: Kanban },
      { to: '/network',       labelKey: 'sidebar.network',          defaultLabel: 'Network Builder',        Icon: Network },
      { to: '/groups',        labelKey: 'sidebar.groups',           defaultLabel: 'Groups Manager',         Icon: Users },
    ]
  },
  {
    titleKey: 'sidebar.analysis',
    defaultTitle: 'Analysis & Content',
    items: [
      { to: '/profile-audit', labelKey: 'sidebar.profileAudit',    defaultLabel: 'Profile Audit',          Icon: ClipboardList },
      { to: '/articles',      labelKey: 'sidebar.articles',         defaultLabel: 'Article Planner',        Icon: FileText },
      { to: '/videos',        labelKey: 'sidebar.videos',           defaultLabel: 'Video Tracker',          Icon: Clapperboard },
    ]
  }
];

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
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
            style={{ background: 'linear-gradient(135deg, #1877f2, #0056b3)' }}>
            <BarChart3 size={16} strokeWidth={2.2} />
          </div>
          <span className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
            {t('sidebar.brandName', 'SocialHub')}
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 px-3 py-4 flex flex-col gap-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.titleKey} className="flex flex-col gap-1">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest select-none"
              style={{ color: 'var(--slate-400)' }}>
              {t(group.titleKey, group.defaultTitle)}
            </p>

            {group.items.map(({ to, labelKey, defaultLabel, Icon, isBadge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => { haptics.success(); onClose(); }}
                className="sidebar-link"
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} strokeWidth={1.8} />
                  {t(labelKey, defaultLabel)}
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
        ))}
      </div>

      {/* Settings at bottom */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid var(--slate-200)' }}>
        <NavLink to="/settings" className="sidebar-link" onClick={() => { haptics.success(); onClose(); }}>
          <span className="flex items-center gap-3">
            <Settings size={17} strokeWidth={1.8} />
            {t('sidebar.settings', 'Settings')}
          </span>
        </NavLink>
      </div>
    </div>
  );
};
