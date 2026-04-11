import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { ImagePlus } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export const Schedule = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    api.get('/oauth/accounts')
       .then(res => { setAccounts(res.data); if (res.data.length > 0) setAccountId(res.data[0].id); })
       .catch(err => console.error('No accounts loaded', err));
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    api.get('/schedule').then(res => setPosts(res.data)).catch(console.error);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setIsUploading(true);
    const fd = new FormData();
    fd.append('media', file);
    try {
      const res = await api.post('/schedule/upload', fd);
      setMediaUrl(res.data.url);
    } catch(err) { console.error(err); }
    setIsUploading(false);
  };

  const handleCreatePost = async (status: string = 'QUEUED') => {
    if (!accountId || !content || !date) return alert(t('schedule.alerts.missingFields', 'Missing required fields'));
    try {
      if (draftId) {
        await api.put(`/schedule/${draftId}`, { content, scheduledAt: date, status, mediaUrls: mediaUrl ? [mediaUrl] : [] });
      } else {
        await api.post('/schedule', { socialAccountId: accountId, content, scheduledAt: date, status, mediaUrls: mediaUrl ? [mediaUrl] : [] });
      }
      setContent(''); setDate(''); setMediaFile(null); setMediaUrl(null); setDraftId(null);
      fetchPosts();
      alert(`${t('schedule.alerts.success', 'Post successfully set to')} ${status}!`);
    } catch(err) { console.error('Error saving:', err); }
  };

  // Auto-draft every 30s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.length > 5 && date && accountId) handleCreatePost('DRAFT').catch(() => {});
    }, 30000);
    return () => clearTimeout(timer);
  }, [content, date, accountId]);

  const statusStyle = (status: string): React.CSSProperties => {
    if (status === 'PUBLISHED') return { background: '#10b981', color: '#fff' };
    if (status === 'FAILED')    return { background: '#ef4444', color: '#fff' };
    if (status === 'QUEUED')    return { background: 'var(--brand-600)', color: '#fff' };
    return { background: 'var(--slate-300)', color: '#fff' };
  };

  const calBoxStyle = (status: string): React.CSSProperties => {
    if (status === 'PUBLISHED') return { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
    if (status === 'FAILED')    return { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
    return { background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-100)' };
  };

  const getBrandIcon = (platform: string) => {
    const p = platform?.toUpperCase();
    if (p === 'INSTAGRAM') return <FaInstagram size={12} fill="#e1306c" />;
    if (p === 'TWITTER') return <FaTwitter size={12} fill="#1d9bf0" />;
    if (p === 'FACEBOOK') return <FaFacebookF size={12} fill="#1877f2" />;
    return null;
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: 'var(--slate-50)',
    border: '1px solid var(--slate-200)',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    color: 'var(--slate-900)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--brand-400)';
    e.target.style.boxShadow = '0 0 0 3px var(--brand-100)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'var(--slate-200)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden overflow-y-auto" style={{ background: 'var(--slate-50)' }}>

      {/* ── Left composer ── */}
      <div className="w-full lg:w-[460px] shrink-0 flex flex-col p-4 md:p-6 lg:p-8 lg:h-full lg:overflow-y-auto"
        style={{ background: '#ffffff', borderRight: '1px solid var(--slate-200)' }}>

        <h2 className="text-xl lg:text-2xl font-bold mb-6 lg:mb-8 tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
          {t('schedule.createDeployment', 'Create Deployment')}
        </h2>

        {/* Account select */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>
            {t('schedule.targetAccount', 'Target Account')}
          </label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}
            style={{ ...inputBase, cursor: 'pointer', fontWeight: 600, color: 'var(--slate-700)' }}
            onFocus={handleFocus as any} onBlur={handleBlur as any}>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.platform} — {a.accountHandle}</option>
            ))}
          </select>
        </div>

        {/* Caption */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>
            {t('schedule.captionContent', 'Caption / Content')}
          </label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
            style={{ ...inputBase, resize: 'none' } as React.CSSProperties}
            placeholder={t('schedule.captionPlaceholder', 'Write your post caption here…')}
            onFocus={handleFocus as any} onBlur={handleBlur as any}
          />
        </div>

        {/* Media upload */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>
            {t('schedule.mediaAttachment', 'Media Attachment')}
          </label>
          <div className="border-2 border-dashed rounded-xl p-7 flex flex-col items-center justify-center relative transition-colors group cursor-pointer"
            style={{ borderColor: 'var(--slate-300)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-300)'; (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--slate-300)'; (e.currentTarget as HTMLElement).style.background = ''; }}
          >
            <ImagePlus size={36} strokeWidth={1.5} className="mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold" style={{ color: 'var(--brand-600)' }}>
              {mediaFile ? mediaFile.name : t('schedule.uploadMedia', 'Upload Media')}
            </span>
            <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--slate-400)' }}>
              {t('schedule.mediaHint', 'Images & Video accepted')}
            </span>
            <input type="file" accept="image/*,video/*" onChange={handleMediaUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          {isUploading && (
            <div className="text-xs mt-2 font-bold text-center animate-pulse" style={{ color: 'var(--brand-500)' }}>
              {t('schedule.uploading', 'Uploading…')}
            </div>
          )}
          {mediaUrl && !isUploading && (
            <div className="mt-3 overflow-hidden rounded-xl h-32 relative">
              <img src={mediaUrl} className="w-full h-full object-cover" alt="preview" />
              <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest text-white" style={{ background: '#10b981' }}>
                {t('schedule.ready', 'Ready')}
              </div>
            </div>
          )}
        </div>

        {/* Scheduled date */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>
            {t('schedule.scheduledDateTime', 'Scheduled Date & Time')}
          </label>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
            style={{ ...inputBase, cursor: 'pointer', fontWeight: 600, color: 'var(--slate-700)' }}
            onFocus={handleFocus} onBlur={handleBlur}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={() => handleCreatePost('DRAFT')}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            style={{ background: '#fff', border: '2px solid var(--brand-200)', color: 'var(--brand-600)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
          >
            {t('schedule.saveDraft', 'Save Draft')}
          </button>
          <button onClick={() => handleCreatePost('QUEUED')}
            disabled={isUploading || !content || !date}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--brand-600)', boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
            onMouseEnter={e => { if (!isUploading && content && date) (e.currentTarget as HTMLElement).style.background = 'var(--brand-700)'; }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)'}
          >
            {t('schedule.queuePost', 'Queue Post 🚀')}
          </button>
        </div>
      </div>

      {/* ── Right feed ── */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto" style={{ background: 'var(--slate-50)' }}>
        <h2 className="text-2xl font-bold mb-7 tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
          {t('schedule.scheduledPosts', 'Scheduled Posts')}
        </h2>

        <div className="space-y-4">
          {posts.map(p => (
            <div key={p.id} className="flex items-center justify-between p-5 rounded-2xl transition-colors"
              style={{
                background: '#ffffff',
                border: '1px solid var(--slate-100)',
                boxShadow: '0 1px 4px rgba(2,132,199,0.05)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-200)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--slate-100)'}
            >
              <div className="flex items-center gap-5">
                {/* Calendar box */}
                <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold shrink-0"
                  style={calBoxStyle(p.status)}>
                  <span className="text-[10px] uppercase font-bold">
                    {new Date(p.scheduledAt).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="text-xl font-extrabold leading-none">
                    {new Date(p.scheduledAt).getDate()}
                  </span>
                </div>

                {/* Details */}
                <div>
                  <div className="flex gap-2 items-center mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"
                      style={{ background: 'var(--slate-100)', color: 'var(--slate-600)' }}>
                      {getBrandIcon(p.socialAccount?.platform)}
                      {p.socialAccount?.platform}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={statusStyle(p.status)}>
                      {p.status}
                    </span>
                  </div>
                  <p className="font-semibold line-clamp-1 mb-1" style={{ color: 'var(--slate-800)' }}>{p.content}</p>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--slate-400)' }}>
                    {new Date(p.scheduledAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Cancel button */}
              {p.status !== 'PUBLISHED' && (
                <button
                  onClick={async () => { await api.delete(`/schedule/${p.id}`); fetchPosts(); }}
                  className="text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors"
                  style={{ color: '#ef4444', border: '1px solid transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.borderColor = '#fecaca'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                >
                  {t('schedule.cancel', 'Cancel')}
                </button>
              )}
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center" style={{ color: 'var(--slate-400)' }}>
              <span className="text-5xl mb-4">🗓️</span>
              <p className="font-bold text-lg" style={{ color: 'var(--slate-500)', fontFamily: 'Outfit, sans-serif' }}>
                {t('schedule.noPosts', 'No scheduled posts yet.')}
              </p>
              <p className="text-sm mt-1">{t('schedule.noPostsHint', 'Queue a post from the composer to see it here.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
