import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/axios';
import { Shield, Bell, Link2, ClipboardList, Save } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { FaInstagram, FaFacebookF, FaTwitter, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SafetyPrefs {
  dailyCap: number;
  gapSeconds: number;
  blackoutStart: number;
  blackoutEnd: number;
}

interface NotificationPrefs {
  frequency: string;
  email: string;
  notifyComments: boolean;
  notifyMentions: boolean;
  notifyTags: boolean;
}

interface SocialAccount {
  id: string;
  platform: string;
  accountHandle: string;
  tokenExpiresAt: string | null;
  notificationPrefs: NotificationPrefs;
  safetyPrefs: SafetyPrefs;
  createdAt: string;
}

interface UserSettings {
  id: string;
  email: string;
  globalSafetyPause: boolean;
  socialAccounts: SocialAccount[];
}

interface AuditLog {
  id: string;
  actionType: string;
  targetId: string;
  contentHash: string | null;
  outcome: string;
  executedAt: string;
  socialAccount: { platform: string; accountHandle: string };
}

// ─── Helper Components ────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
    style={active
      ? { background: 'var(--brand-600)', color: '#fff', boxShadow: '0 2px 6px rgba(2,132,199,0.25)' }
      : { color: 'var(--slate-500)' }
    }
    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--brand-600)'; (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'; } }}
    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'var(--slate-500)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
  >
    {children}
  </button>
);

const PlatformIcon = ({ platform }: { platform: string }) => {
  const map: Record<string, { icon: React.ReactNode; bg: string }> = {
    INSTAGRAM: { icon: <FaInstagram size={15} />, bg: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
    FACEBOOK:  { icon: <FaFacebookF size={15} />, bg: '#1877f2' },
    TWITTER:   { icon: <FaTwitter size={15} />,   bg: '#1d9bf0' },
  };
  const entry = map[platform?.toUpperCase()];
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
      style={{ background: entry?.bg ?? '#64748b' }}>
      {entry?.icon ?? <FaGlobe size={14} />}
    </div>
  );
};

const OutcomeBadge = ({ outcome }: { outcome: string }) => {
  const styles: Record<string, string> = {
    SUCCESS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-amber-100 text-amber-700 border-amber-200',
    FAILED: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[outcome] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
      {outcome}
    </span>
  );
};

// ─── Main Settings Page ───────────────────────────────────────────────────────
export const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'connections' | 'safety' | 'notifications' | 'audit'>('connections');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Safety working state
  const [globalPause, setGlobalPause] = useState(false);
  const [safetyByAccount, setSafetyByAccount] = useState<Record<string, SafetyPrefs>>({});

  // Notification working state
  const [notifByAccount, setNotifByAccount] = useState<Record<string, NotificationPrefs>>({});

  // Audit state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditFilters, setAuditFilters] = useState({ accountId: '', actionType: '', outcome: '', from: '', to: '' });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      const data: UserSettings = res.data;
      setSettings(data);
      setGlobalPause(data.globalSafetyPause);

      const safetyMap: Record<string, SafetyPrefs> = {};
      const notifMap: Record<string, NotificationPrefs> = {};
      data.socialAccounts.forEach((acc) => {
        safetyMap[acc.id] = { ...acc.safetyPrefs };
        notifMap[acc.id] = {
          frequency: acc.notificationPrefs?.frequency ?? 'OFF',
          email: acc.notificationPrefs?.email ?? '',
          notifyComments: acc.notificationPrefs?.notifyComments ?? true,
          notifyMentions: acc.notificationPrefs?.notifyMentions ?? true,
          notifyTags: acc.notificationPrefs?.notifyTags ?? true,
        };
      });
      setSafetyByAccount(safetyMap);
      setNotifByAccount(notifMap);
    } catch {
      showToast('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAudit = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(auditPage) });
      if (auditFilters.accountId) params.set('accountId', auditFilters.accountId);
      if (auditFilters.actionType) params.set('actionType', auditFilters.actionType);
      if (auditFilters.outcome) params.set('outcome', auditFilters.outcome);
      if (auditFilters.from) params.set('from', auditFilters.from);
      if (auditFilters.to) params.set('to', auditFilters.to);
      const res = await api.get(`/audit?${params.toString()}`);
      setLogs(res.data.logs);
      setAuditTotal(res.data.total);
      setAuditTotalPages(res.data.totalPages);
    } catch {
      showToast('error', 'Failed to load audit log');
    }
  }, [auditPage, auditFilters]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => {
    if (activeTab === 'audit') fetchAudit();
  }, [activeTab, fetchAudit]);

  // Handle OAuth redirect results from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('social_success');
    const error = params.get('social_error');

    if (success) {
      showToast('success', `Successfully connected ${success}!`);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      fetchSettings();
    }
    if (error) {
      showToast('error', `Failed to connect ${error}. Please try again.`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchSettings]);

  const handleDisconnect = async (accountId: string, handle: string) => {
    if (!confirm(t('settings.connections.disconnectConfirm', `Disconnect @${handle}? All associated data will be removed.`, { handle }))) return;
    try {
      await api.delete(`/settings/accounts/${accountId}`);
      showToast('success', `@${handle} disconnected.`);
      fetchSettings();
    } catch {
      showToast('error', 'Failed to disconnect account');
    }
  };

  const handleManualConnect = async (url: string) => {
    if (!url.includes('facebook') && !url.includes('instagram')) return showToast('error', 'Please enter a valid Meta (FB/IG) URL');
    setSaving(true);
    try {
      await api.post(`/settings/accounts/manual`, { url });
      showToast('success', `Apify Scraper linked successfully!`);
      (document.getElementById('apify-url-input') as HTMLInputElement).value = '';
      fetchSettings();
    } catch {
      showToast('error', 'Failed to link manual Apify URL');
    } finally {
      setSaving(false);
    }
  };

  const saveSafetySettings = async () => {
    setSaving(true);
    try {
      await api.put('/settings/safety', {
        globalSafetyPause: globalPause,
        accounts: Object.entries(safetyByAccount).map(([id, safetyPrefs]) => ({ id, safetyPrefs })),
      });
      showToast('success', 'Safety settings saved!');
      fetchSettings();
    } catch {
      showToast('error', 'Failed to save safety settings');
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      await api.put('/settings/notifications', {
        accounts: Object.entries(notifByAccount).map(([id, notificationPrefs]) => ({ id, notificationPrefs })),
      });
      showToast('success', 'Notification preferences saved!');
    } catch {
      showToast('error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--slate-50)' }}>
        <div className="flex flex-col items-center gap-4" style={{ color: 'var(--brand-400)' }}>
          <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
          <span className="font-semibold text-sm" style={{ color: 'var(--brand-600)' }}>{t('settings.loading', 'Loading settings…')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative" style={{ background: 'var(--slate-50)' }}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-3 animate-fade-in ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 lg:p-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>{t('settings.title', 'Settings')}</h1>
          <p className="text-xs lg:text-sm mt-1" style={{ color: 'var(--slate-500)' }}>{t('settings.description', 'Manage your connections, safety constraints, notifications, and action history.')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto overflow-y-hidden" 
          style={{ 
            background: '#fff', 
            border: '1px solid var(--slate-100)', 
            boxShadow: '0 1px 4px rgba(2,132,199,0.06)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
          <TabBtn active={activeTab === 'connections'} onClick={() => setActiveTab('connections')}><span className="flex items-center gap-1.5 whitespace-nowrap"><Link2 size={13} />{t('settings.tabs.connections', 'Connections')}</span></TabBtn>
          <TabBtn active={activeTab === 'safety'} onClick={() => setActiveTab('safety')}><span className="flex items-center gap-1.5 whitespace-nowrap"><Shield size={13} />{t('settings.tabs.safety', 'Safety')}</span></TabBtn>
          <TabBtn active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}><span className="flex items-center gap-1.5 whitespace-nowrap"><Bell size={13} />{t('settings.tabs.notifications', 'Notifications')}</span></TabBtn>
          <TabBtn active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}><span className="flex items-center gap-1.5 whitespace-nowrap"><ClipboardList size={13} />{t('settings.tabs.auditLog', 'Audit Log')}</span></TabBtn>
        </div>


        {/* ── TAB 1: Connections ───────────────────────────────────────────── */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            {settings?.socialAccounts.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--slate-200)', color: 'var(--slate-400)' }}>
                <p className="text-4xl mb-3">🔌</p>
                <p className="font-semibold" style={{ color: 'var(--slate-500)' }}>{t('settings.connections.noAccounts', 'No accounts connected yet.')}</p>
                <p className="text-sm mt-1">{t('settings.connections.noAccountsHint', 'Connect a platform below to get started.')}</p>
              </div>
            )}

            {settings?.socialAccounts.map((acc) => {
              const expiry = acc.tokenExpiresAt ? new Date(acc.tokenExpiresAt) : null;
              const isExpired = expiry ? expiry < new Date() : false;
              return (
                <div key={acc.id} className="rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                  style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-200)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--slate-100)'}
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                      style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
                      <PlatformIcon platform={acc.platform} />
                    </div>
                    <div>
                      <p className="font-bold text-base sm:text-lg" style={{ color: 'var(--slate-900)' }}>{acc.accountHandle}</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5" style={{ color: 'var(--slate-400)' }}>{acc.platform}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                        <span className={`text-[10px] sm:text-xs font-semibold ${isExpired ? 'text-red-500' : 'text-emerald-600'}`}>
                          {isExpired ? t('settings.connections.tokenExpired', 'Token expired') : expiry ? t('settings.connections.expires', 'Expires {{date}}', { date: expiry.toLocaleDateString() }) : t('settings.connections.active', 'Active')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { handleDisconnect(acc.id, acc.accountHandle); haptics.error(); }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    style={{ border: '1px solid #fecaca', color: '#ef4444' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fef2f2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >
                    {t('settings.connections.disconnect', 'Disconnect')}
                  </button>
                </div>
              );
            })}

            {/* Connect New Account */}
            <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-4" style={{ color: 'var(--slate-500)' }}>{t('settings.connections.connectNewAccount', 'Connect New Account')}</h3>
              <div className="flex gap-3">
                {['INSTAGRAM', 'TWITTER', 'FACEBOOK'].map((platform) => (
                  <a key={platform} href={`http://localhost:3001/auth/${platform.toLowerCase()}`}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors"
                    style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', color: 'var(--brand-700)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-100)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'}
                  >
                    <PlatformIcon platform={platform} />
                    {platform.charAt(0) + platform.slice(1).toLowerCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Connect Public Profile (Apify Proxy) */}
            <div className="rounded-2xl p-6 mt-4" style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}>
              <h3 className="font-bold text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--slate-500)' }}>{t('settings.connections.connectApify', 'Connect Public Profile (Apify Cloud Proxy)')}</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-2xl">
                {t('settings.connections.apifyHint', 'Bypass API blocks on personal profiles by pasting your public Facebook or Instagram URL below. Our backend will use enterprise Apify proxies to securely rip your public timeline without requiring an OAuth Developer token.')}
              </p>
              <div className="flex gap-3 max-w-xl">
                <input 
                  type="text" 
                  id="apify-url-input"
                  placeholder="https://facebook.com/your.username"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                  style={{ background: 'var(--slate-50)', borderColor: 'var(--slate-200)', color: 'var(--slate-900)' }}
                />
                <button 
                  disabled={saving}
                  onClick={() => {
                     const url = (document.getElementById('apify-url-input') as HTMLInputElement).value;
                     if(url) handleManualConnect(url);
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--brand-600)' }}
                  onMouseEnter={e => { if(!saving) (e.currentTarget as HTMLElement).style.background = 'var(--brand-500)'}}
                  onMouseLeave={e => { if(!saving) (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)'}}
                >
                  {saving ? t('settings.connections.linking', 'Linking...') : t('settings.connections.syncProxy', 'Sync via Proxy')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Safety Config ─────────────────────────────────────────── */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            {/* Global Pause Toggle */}
            <div className="rounded-2xl p-7 flex items-center justify-between" style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}>
              <div>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>{t('settings.safety.pauseAll', 'Pause All Automated Actions')}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--slate-500)' }}>{t('settings.safety.pauseHint', 'Immediately halts all AI replies and engagement posts across every account.')}</p>
              </div>
              <button onClick={() => setGlobalPause(!globalPause)}
                className="relative w-14 h-7 rounded-full transition-colors duration-300"
                style={{ background: globalPause ? '#ef4444' : 'var(--slate-200)' }}
              >
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${globalPause ? 'translate-x-7' : 'translate-x-0.5'}`}></span>
              </button>
            </div>

            {globalPause && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-700 text-sm font-semibold flex items-center gap-2">
                {t('settings.safety.pauseWarning', '⛔ All automated actions will be blocked until this is turned off.')}
              </div>
            )}

            {/* Per-Account Safety Sliders */}
            {settings?.socialAccounts.map((acc) => {
              const prefs = safetyByAccount[acc.id] ?? { dailyCap: 15, gapSeconds: 60, blackoutStart: 0, blackoutEnd: 6 };
              const update = (key: keyof SafetyPrefs, val: number) =>
                setSafetyByAccount((prev) => ({ ...prev, [acc.id]: { ...prev[acc.id], [key]: val } }));

              return (
                <div key={acc.id} className="rounded-2xl p-7" style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}>
                  <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <PlatformIcon platform={acc.platform} />
                    <div>
                      <p className="font-bold" style={{ color: 'var(--slate-900)' }}>{acc.accountHandle}</p>
                      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--slate-400)' }}>{acc.platform}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                    {/* Daily Cap */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--slate-400)' }}>{t('settings.safety.dailyCap', 'Daily Action Cap')}</label>
                        <span className="font-bold text-sm" style={{ color: 'var(--brand-600)' }}>{prefs.dailyCap}</span>
                      </div>
                      <input type="range" min={10} max={15} value={prefs.dailyCap}
                        onChange={e => update('dailyCap', Number(e.target.value))}
                        className="w-full" style={{ accentColor: 'var(--brand-600)' } as React.CSSProperties}
                      />
                      <div className="flex justify-between text-[10px] font-semibold mt-1" style={{ color: 'var(--slate-400)' }}><span>10</span><span>15</span></div>
                    </div>

                    {/* Gap Seconds */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--slate-400)' }}>{t('settings.safety.actionGap', 'Min Action Gap')}</label>
                        <span className="font-bold text-sm" style={{ color: 'var(--brand-600)' }}>{prefs.gapSeconds}s</span>
                      </div>
                      <input type="range" min={60} max={120} step={10} value={prefs.gapSeconds}
                        onChange={e => update('gapSeconds', Number(e.target.value))}
                        className="w-full" style={{ accentColor: 'var(--brand-600)' } as React.CSSProperties}
                      />
                      <div className="flex justify-between text-[10px] font-semibold mt-1" style={{ color: 'var(--slate-400)' }}><span>60s</span><span>120s</span></div>
                    </div>

                    {/* Blackout Start */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--slate-400)' }}>{t('settings.safety.blackoutStart', 'Blackout Start (UTC hour)')}</label>
                      <input type="number" min={0} max={23} value={prefs.blackoutStart}
                        onChange={e => update('blackoutStart', Number(e.target.value))}
                        className="w-full rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                        style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-800)' }}
                      />
                    </div>

                    {/* Blackout End */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--slate-400)' }}>{t('settings.safety.blackoutEnd', 'Blackout End (UTC hour)')}</label>
                      <input type="number" min={0} max={23} value={prefs.blackoutEnd}
                        onChange={e => update('blackoutEnd', Number(e.target.value))}
                        className="w-full rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                        style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-800)' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end">
              <button onClick={saveSafetySettings} disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                style={{ background: 'var(--brand-600)', boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
                onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = 'var(--brand-700)'; }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)'}
              >
                <Save size={15} />
                {saving ? t('settings.saving', 'Saving…') : t('settings.safety.saveSettings', 'Save Safety Settings')}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: Notifications ─────────────────────────────────────────── */}
        {activeTab === 'notifications' && (
          <div className="space-y-5">
            {settings?.socialAccounts.map((acc) => {
              const prefs = notifByAccount[acc.id] ?? { frequency: 'OFF', email: '', notifyComments: true, notifyMentions: true, notifyTags: true };
              const update = (key: keyof NotificationPrefs, val: any) =>
                setNotifByAccount((prev) => ({ ...prev, [acc.id]: { ...prev[acc.id], [key]: val } }));

              return (
                <div key={acc.id} className="rounded-2xl p-7" style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}>
                  <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <PlatformIcon platform={acc.platform} />
                    <div>
                      <p className="font-bold" style={{ color: 'var(--slate-900)' }}>{acc.accountHandle}</p>
                      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--slate-400)' }}>{acc.platform}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Toggle types */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--slate-400)' }}>{t('settings.notifications.alertTypes', 'Alert Types')}</p>
                      {([['notifyComments', t('settings.notifications.newComments', '💬 New Comments')], ['notifyMentions', t('settings.notifications.newMentions', '@ New Mentions')], ['notifyTags', t('settings.notifications.newTags', '🏷️ New Tags')]] as const).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                          <div onClick={() => update(key, !prefs[key])}
                            className="w-11 h-6 rounded-full transition-colors duration-200 relative cursor-pointer"
                            style={{ background: prefs[key] ? 'var(--brand-500)' : 'var(--slate-200)' }}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${prefs[key] ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: 'var(--slate-700)' }}>{label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--slate-400)' }}>{t('settings.notifications.digestFreq', 'Digest Frequency')}</label>
                        <select value={prefs.frequency} onChange={e => update('frequency', e.target.value)}
                          className="w-full rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
                          style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-800)', background: '#fff' }}
                        >
                          <option value="IMMEDIATE">{t('settings.notifications.freqOpts.IMMEDIATE', 'Immediate')}</option>
                          <option value="HOURLY">{t('settings.notifications.freqOpts.HOURLY', 'Hourly')}</option>
                          <option value="DAILY">{t('settings.notifications.freqOpts.DAILY', 'Daily')}</option>
                          <option value="OFF">{t('settings.notifications.freqOpts.OFF', 'Off')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--slate-400)' }}>{t('settings.notifications.digestEmail', 'Digest Email')}</label>
                        <input type="email" value={prefs.email} onChange={e => update('email', e.target.value)}
                          placeholder={settings?.email ?? 'your@email.com'}
                          className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none"
                          style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-800)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end">
              <button onClick={saveNotificationSettings} disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                style={{ background: 'var(--brand-600)', boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
                onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.background = 'var(--brand-700)'; }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)'}
              >
                <Save size={15} />
                {saving ? t('settings.saving', 'Saving…') : t('settings.notifications.savePrefs', 'Save Notification Preferences')}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 4: Audit Log ─────────────────────────────────────────────── */}
        {activeTab === 'audit' && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="rounded-2xl p-5 flex flex-wrap gap-3" style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}>
              {[
                { key: 'accountId', options: [{ value: '', label: t('settings.audit.allAccounts', 'All Accounts') }, ...(settings?.socialAccounts.map(acc => ({ value: acc.id, label: `${acc.accountHandle} (${acc.platform})` })) ?? [])] },
                { key: 'actionType', options: [{ value: '', label: t('settings.audit.allActionTypes', 'All Action Types') }, ...['COMMENT','REPLY','LIKE','FOLLOW'].map(a_opt => ({ value: a_opt, label: a_opt }))] },
                { key: 'outcome', options: [{ value: '', label: t('settings.audit.allOutcomes', 'All Outcomes') }, ...['SUCCESS','REJECTED','FAILED'].map(o => ({ value: o, label: o }))] },
              ].map(({ key, options }) => (
                <select key={key}
                  value={(auditFilters as any)[key]}
                  onChange={e => { setAuditFilters(f => ({ ...f, [key]: e.target.value })); setAuditPage(1); }}
                  className="rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-700)', background: '#fff' }}
                >
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ))}
              <input type="date" value={auditFilters.from}
                onChange={e => { setAuditFilters(f => ({ ...f, from: e.target.value })); setAuditPage(1); }}
                className="rounded-xl px-3 py-2 text-xs font-bold outline-none"
                style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-700)' }}
              />
              <input type="date" value={auditFilters.to}
                onChange={e => { setAuditFilters(f => ({ ...f, to: e.target.value })); setAuditPage(1); }}
                className="rounded-xl px-3 py-2 text-xs font-bold outline-none"
                style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-700)' }}
              />
              <button
                onClick={() => { setAuditFilters({ accountId: '', actionType: '', outcome: '', from: '', to: '' }); setAuditPage(1); }}
                className="ml-auto text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                style={{ color: 'var(--slate-400)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--brand-600)'; (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--slate-400)'; (e.currentTarget as HTMLElement).style.background = ''; }}
              >{t('settings.audit.clear', '✕ Clear')}</button>
            </div>

            {/* Audit Log Table - Desktop */}
            <div className="hidden md:block rounded-2xl overflow-x-auto" style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--slate-100)', background: 'var(--slate-50)' }}>
                    {['date', 'account', 'action', 'targetId', 'outcome'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--slate-400)' }}>
                        {t(`settings.audit.tableHeaders.${h}`, h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16" style={{ color: 'var(--slate-400)' }}>
                        <p className="text-3xl mb-2">📋</p>
                        <p className="font-semibold">{t('settings.audit.noEntries', 'No audit entries found.')}</p>
                      </td>
                    </tr>
                  ) : logs.map((log) => (
                    <tr key={log.id} className="transition-colors" style={{ borderTop: '1px solid var(--slate-50)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                    >
                      <td className="px-5 py-3.5 font-medium text-xs whitespace-nowrap" style={{ color: 'var(--slate-500)' }}>
                        {new Date(log.executedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={log.socialAccount.platform} />
                          <span className="font-semibold text-xs" style={{ color: 'var(--slate-800)' }}>{log.socialAccount.accountHandle}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
                          style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-100)' }}>
                          {log.actionType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono truncate max-w-[140px]" style={{ color: 'var(--slate-400)' }} title={log.targetId}>
                        {log.targetId.substring(0, 20)}…
                      </td>
                      <td className="px-5 py-3.5">
                        <OutcomeBadge outcome={log.outcome} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Audit Log - Mobile Cards */}
            <div className="md:hidden space-y-3">
              {logs.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px solid var(--slate-100)', color: 'var(--slate-400)' }}>
                  <p className="text-3xl mb-2">📋</p>
                  <p className="font-semibold">{t('settings.audit.noEntries', 'No audit entries found.')}</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="rounded-2xl p-4 space-y-3 transition-colors"
                    style={{ background: '#fff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.05)' }}
                  >
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                         <PlatformIcon platform={log.socialAccount.platform} />
                         <span className="font-bold text-xs" style={{ color: 'var(--slate-800)' }}>{log.socialAccount.accountHandle}</span>
                       </div>
                       <span className="text-[10px] font-medium" style={{ color: 'var(--slate-400)' }}>
                         {new Date(log.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider"
                         style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-100)' }}>
                         {log.actionType}
                       </span>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${log.outcome === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                         style={{ border: '1px solid border-current' }}>
                         {log.outcome}
                       </span>
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: 'var(--slate-400)' }}>
                       Target: {log.targetId.substring(0, 16)}…
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {auditTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: 'var(--slate-400)' }}>
                  {t('settings.audit.pagination', 'Showing page {{page}} of {{totalPages}} ({{total}} total entries)', { page: auditPage, totalPages: auditTotalPages, total: auditTotal })}
                </p>
                <div className="flex gap-2">
                  <button disabled={auditPage <= 1} onClick={() => setAuditPage(p => p - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-600)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--slate-50)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >{t('settings.audit.prev', '← Prev')}</button>
                  <button disabled={auditPage >= auditTotalPages} onClick={() => setAuditPage(p => p + 1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    style={{ border: '1px solid var(--slate-200)', color: 'var(--slate-600)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--slate-50)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >{t('settings.audit.next', 'Next →')}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
