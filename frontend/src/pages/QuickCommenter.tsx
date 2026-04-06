import { useState } from 'react';
import { api } from '../api/axios';
import { MessageCircle, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export const QuickCommenter = () => {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const postComment = async () => {
    if (!url || !message) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await api.post('/engagement/quick-comment', { url, message });
      setSuccess(`Comment officially posted! (ID: ${resp.data.commentId})`);
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post comment. Ensure the link is valid and your account has permissions.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem 1.25rem',
    background: 'var(--slate-50)',
    border: '1px solid var(--slate-200)',
    borderRadius: '0.875rem',
    fontSize: '0.875rem',
    color: 'var(--slate-900)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--brand-400)';
    e.target.style.boxShadow = '0 0 0 3px var(--brand-100)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--slate-200)';
    e.target.style.boxShadow = 'none';
  };

  const detectedPlatform = url.includes('instagram.com')
    ? { label: 'Instagram App Detected', bg: 'linear-gradient(135deg,#e1306c,#f77737)', color: '#fff' }
    : url.includes('facebook') || url.includes('fb.watch')
    ? { label: 'Facebook App Detected', bg: 'var(--brand-600)', color: '#fff' }
    : null;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--slate-50)', padding: '2rem' }}>
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <header className="mb-8 text-center mt-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl mb-4"
            style={{ background: 'var(--brand-100)', color: 'var(--brand-600)' }}>
            <MessageCircle size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
            Quick Commenter
          </h1>
          <p className="text-lg" style={{ color: 'var(--slate-500)' }}>
            Post comments directly to any Facebook or Instagram link from your connected account.
          </p>
        </header>

        {/* Main card */}
        <div className="rounded-3xl p-8 mb-6"
          style={{
            background: '#ffffff',
            border: '1px solid var(--slate-100)',
            boxShadow: '0 4px 24px rgba(2,132,199,0.08)',
          }}
        >
          {/* URL field */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--slate-500)' }}>
              Target Post URL
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://www.facebook.com/share/p/…"
                style={{ ...inputBase, paddingRight: detectedPlatform ? '12rem' : '1.25rem' }}
                value={url}
                onChange={e => setUrl(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {detectedPlatform && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider"
                  style={{ background: detectedPlatform.bg, color: detectedPlatform.color }}>
                  {detectedPlatform.label}
                </span>
              )}
            </div>
          </div>

          {/* Comment textarea */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--slate-500)' }}>
              Your Comment
            </label>
            <textarea
              rows={4}
              placeholder="Write your genuine response here…"
              style={{ ...inputBase, resize: 'none' } as React.CSSProperties}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onFocus={handleFocus as any}
              onBlur={handleBlur as any}
            />
          </div>

          {/* Submit button */}
          <button
            onClick={postComment}
            disabled={loading || !url || !message}
            className="w-full py-4 text-lg font-bold rounded-2xl transition-all active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading || !url || !message ? 'var(--slate-200)' : 'var(--brand-600)',
              color: loading || !url || !message ? 'var(--slate-400)' : '#fff',
              boxShadow: loading || !url || !message ? 'none' : '0 3px 12px rgba(2,132,199,0.3)',
            }}
            onMouseEnter={e => { if (!loading && url && message) (e.currentTarget as HTMLElement).style.background = 'var(--brand-700)'; }}
            onMouseLeave={e => { if (!loading && url && message) (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)'; }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Publishing to Meta…
              </>
            ) : (
              <>
                <Send size={18} strokeWidth={2} />
                Send Comment
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="mt-5 p-4 rounded-2xl text-sm flex items-start gap-3"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
              <AlertCircle size={17} strokeWidth={2} className="shrink-0 mt-0.5" />
              <div><strong>Error:</strong> {error}</div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-5 p-4 rounded-2xl text-sm flex items-start gap-3 relative overflow-hidden"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
              <div className="absolute left-0 top-0 w-1 h-full" style={{ background: '#10b981' }} />
              <CheckCircle2 size={17} strokeWidth={2} className="shrink-0 mt-0.5" />
              <div><strong className="block mb-0.5">Success!</strong>{success}</div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs" style={{ color: 'var(--slate-400)' }}>
          ⚠️ Comments are posted securely using the official Meta Graph API via the account connected in Settings.
        </div>
      </div>
    </div>
  );
};
