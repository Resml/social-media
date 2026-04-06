import { useState } from 'react';
import { api } from '../api/axios';

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export const CommentExporter = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setComments([]);
    setSource(null);
    try {
      const resp = await api.post('/export/comments', { url });
      setComments(resp.data.data);
      setSource(resp.data.source);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch comments. Make sure the post is public and from a connected account.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (comments.length === 0) return;
    const headers = ['Comment ID', 'Username', 'Comment Text', 'Timestamp'];
    const csvRows = [
      headers.join(','),
      ...comments.map(c => [
        c.id,
        `"${c.username.replace(/"/g, '""')}"`,
        `"${c.text.replace(/"/g, '""')}"`,
        new Date(c.timestamp).toLocaleString()
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.setAttribute('href', objectUrl);
    link.setAttribute('download', `comments_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const detectedPlatform = url.includes('instagram.com')
    ? { label: 'Instagram', color: '#e1306c', bg: '#fdf2f8' }
    : url.includes('facebook.com')
    ? { label: 'Facebook', color: '#1877f2', bg: '#eff6ff' }
    : null;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--slate-50)', padding: '2rem' }}>
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
            Comment Exporter
          </h1>
          <p style={{ color: 'var(--slate-500)' }}>
            Paste an Instagram or Facebook post link to fetch and download all comments as a CSV.
          </p>
        </header>

        {/* URL input card */}
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: '#ffffff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.06)' }}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="https://www.instagram.com/p/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  color: 'var(--slate-900)',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  paddingRight: detectedPlatform ? '8rem' : '1rem',
                }}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--brand-400)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--brand-100)'; }}
                onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = 'var(--slate-200)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
              />
              {detectedPlatform && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: detectedPlatform.color }}>
                  {detectedPlatform.label}
                </span>
              )}
            </div>
            <button
              onClick={fetchComments}
              disabled={loading || !url}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--brand-600)', boxShadow: '0 2px 8px rgba(2,132,199,0.25)' }}
              onMouseEnter={e => { if (!loading && url) (e.currentTarget as HTMLElement).style.background = 'var(--brand-700)'; }}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)'}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fetching…
                </span>
              ) : 'Fetch Comments'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl text-sm flex items-start gap-2"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results table */}
        {comments.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#ffffff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.06)' }}>
            {/* Table header bar */}
            <div className="px-6 py-4 flex justify-between items-center"
              style={{ borderBottom: '1px solid var(--slate-100)', background: 'var(--slate-50)' }}>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                  {comments.length} Comments Found
                </span>
                {source && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border`}
                    style={source.includes('Official')
                      ? { background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }
                      : { background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }
                    }>
                    {source.includes('Mock') ? '⚠️ MOCK SCRAPER MODE' : `Source: ${source}`}
                  </span>
                )}
              </div>
              <button onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white transition-colors"
                style={{ background: '#10b981' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#059669'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#10b981'}
              >
                📥 Download CSV
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: 'var(--slate-50)' }}>
                    {['User', 'Comment Text', 'Timestamp'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--slate-400)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comments.map(comment => (
                    <tr key={comment.id} className="transition-colors"
                      style={{ borderTop: '1px solid var(--slate-100)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                    >
                      <td className="px-6 py-4 font-semibold" style={{ color: 'var(--slate-900)' }}>@{comment.username}</td>
                      <td className="px-6 py-4 text-sm max-w-md truncate" style={{ color: 'var(--slate-500)' }}>{comment.text}</td>
                      <td className="px-6 py-4 text-xs" style={{ color: 'var(--slate-400)' }}>{new Date(comment.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && comments.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--slate-300)' }}>
            <div className="text-5xl mb-4">📑</div>
            <p className="text-lg font-medium" style={{ color: 'var(--slate-400)' }}>
              Paste a URL above to start exporting data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
