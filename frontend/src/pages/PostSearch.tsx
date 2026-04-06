import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { PostCard } from '../components/PostCard';

export const PostSearch = () => {
  const [query, setQuery] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [platform, setPlatform] = useState('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchResults(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, hashtag, platform, from, to]);

  const fetchResults = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (query.trim())   params.append('q', query.trim());
      if (hashtag.trim()) params.append('hashtag', hashtag.trim());
      if (platform !== 'ALL') params.append('platform', platform);
      if (from) params.append('from', from);
      if (to)   params.append('to', to);

      const res = await api.get(`/search/posts?${params.toString()}`);
      setResults(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch(err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--slate-50)',
    border: '1px solid var(--slate-200)',
    color: 'var(--slate-900)',
    fontSize: '0.875rem',
    borderRadius: '0.75rem',
    padding: '0.625rem 0.75rem',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--slate-50)', padding: '2rem' }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-7 h-full">

        {/* Filter Card */}
        <div className="rounded-2xl p-6 shrink-0"
          style={{ background: '#ffffff', border: '1px solid var(--slate-100)', boxShadow: '0 1px 4px rgba(2,132,199,0.06)' }}>
          <h1 className="text-2xl font-bold mb-6 tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-900)' }}>
            Post Repository Search
          </h1>

          <div className="flex flex-wrap gap-4 items-end">
            {/* Keyword */}
            <div className="flex-1 min-w-[250px]">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>
                Keyword Query
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5" style={{ color: 'var(--slate-400)' }}>🔍</span>
                <input
                  type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search captions contextually…"
                  style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--brand-400)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--brand-100)'; }}
                  onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = 'var(--slate-200)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
                />
              </div>
            </div>
            {/* Hashtag */}
            <div className="w-44">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>
                Hashtag Filter
              </label>
              <input type="text" value={hashtag} onChange={e => setHashtag(e.target.value)}
                placeholder="#milestone"
                style={inputStyle}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--brand-400)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px var(--brand-100)'; }}
                onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = 'var(--slate-200)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
              />
            </div>
            {/* Platform */}
            <div className="w-40">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>
                Platform
              </label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="ALL">ALL NETWORKS</option>
                <option value="INSTAGRAM">INSTAGRAM</option>
                <option value="TWITTER">TWITTER</option>
                <option value="FACEBOOK">FACEBOOK</option>
              </select>
            </div>
            {/* Date range */}
            <div className="flex gap-3">
              <div className="w-36">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>From</label>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
              </div>
              <div className="w-36">
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--slate-400)' }}>To</label>
                <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center px-1">
          <span className={`text-sm font-bold uppercase tracking-wider${isSearching ? ' animate-pulse' : ''}`}
            style={{ color: isSearching ? 'var(--brand-500)' : 'var(--slate-400)' }}>
            {isSearching ? 'Analyzing Post Database…' : `Retrieved ${total} matching entries`}
          </span>
        </div>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
               {results.map((r, i) => <PostCard key={`${r.id}-${i}`} post={r} />)}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center mt-24 opacity-80" style={{ color: 'var(--slate-400)' }}>
               <span className="text-5xl mb-6">📭</span>
               <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--slate-500)' }}>
                 No posts match criteria
               </h3>
               <p className="text-sm font-medium">Try generalizing your keywords or date range.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
