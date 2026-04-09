import { useEffect, useState, useRef } from 'react';
import { api } from '../api/axios';
import { StatCard } from '../components/StatCard';
import { EngagementChart, FollowerGrowthChart } from '../components/Charts';
import { Users, TrendingUp, Eye, AtSign, Globe, ArrowUp } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import { haptics } from '../utils/haptics';

export const Dashboard = () => {
  const [platform, setPlatform] = useState('ALL');
  const [summary, setSummary] = useState<any>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [engagement, setEngagement] = useState<any[]>([]);
  const [recentInbox, setRecentInbox] = useState<any[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const platforms = [
    { id: 'ALL',       label: 'All',       Icon: Globe },
    { id: 'INSTAGRAM', label: 'Instagram', Icon: FaInstagram },
    { id: 'TWITTER',   label: 'Twitter',   Icon: FaTwitter },
    { id: 'FACEBOOK',  label: 'Facebook',  Icon: FaFacebookF },
  ];

  useEffect(() => {
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

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [platform]);

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
      <div className="max-w-7xl mx-auto md:p-4">

        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
            Analytics Dashboard
          </h1>
          {/* Platform switcher */}
          <div className="flex p-1 rounded-xl sm:rounded-full gap-1 overflow-x-auto w-full sm:w-auto overflow-y-hidden"
            style={{ 
              background: '#ffffff', 
              border: '1px solid var(--slate-200)', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
          {platforms.map(p => (
              <button
                key={p.id}
                onClick={() => { setPlatform(p.id); haptics.medium(); }}
                className="px-3 lg:px-4 py-2 rounded-lg sm:rounded-full text-[10px] lg:text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
                style={platform === p.id
                  ? { background: 'var(--brand-600)', color: '#fff', boxShadow: '0 1px 4px rgba(2,132,199,0.3)' }
                  : { color: 'var(--slate-500)' }
                }
              >
                <p.Icon size={12} />
                {p.label}
              </button>
            ))}
          </div>
        </div>


        {/* Stat Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <StatCard label="Total Followers"  value={summary.totalFollowers.toLocaleString()} delta={summary.followerDelta}    deltaSuffix="%" icon={Users} />
            <StatCard label="Engagement Rate"  value={`${summary.engagementRate}%`}           delta={summary.engagementDelta}  deltaSuffix="%" icon={TrendingUp} />
            <StatCard label="Post Impressions" value={summary.postImpressions.toLocaleString()} delta={summary.impressionsDelta} deltaSuffix="%" icon={Eye} />
            <StatCard label="New Mentions"     value={summary.newMentions}                    delta={summary.mentionsDelta} icon={AtSign} />
          </div>
        )}

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
            Recent Inbox Activity
          </h2>
          <div className="space-y-4">
            {recentInbox.length === 0 ? (
              <div className="text-sm italic" style={{ color: 'var(--slate-400)' }}>
                No recent activity to show.
              </div>
            ) : (
              recentInbox.map((item, i, arr) => {
                const isBrand = item.type === 'COMMENT';
                const isAmber = item.type === 'MENTION';
                const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase();
                
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
                          {item.authorHandle} · {item.socialAccount?.platform} · {new Date(item.receivedAt).toLocaleDateString()}
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
