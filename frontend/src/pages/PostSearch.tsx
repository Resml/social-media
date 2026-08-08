import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { PostRow } from '../components/PostRow';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, Columns, Download, Info, ArrowUpDown, ChevronDown, Video } from 'lucide-react';

export const PostSearch = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('PUBLISHED');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchResults(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  const fetchResults = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      params.append('status', activeTab);
      if (query.trim()) params.append('q', query.trim());
      
      const res = await api.get(`/search/posts?${params.toString()}`);
      setResults(res.data.items || []);
    } catch(err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === results.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5]">
      <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
        
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[12px] text-[#65676B] mb-1">
             <span className="hover:underline cursor-pointer">Professional dashboard</span>
             <span>›</span>
             <span className="hover:underline cursor-pointer text-[#050505] font-medium">Content</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#050505]">Content</h1>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg border border-[#ced0d4] shadow-sm overflow-hidden">
          
          {/* Section Header */}
          <div className="p-4 border-b border-[#ced0d4]">
            <h2 className="text-[20px] font-bold text-[#050505] mb-4">Content Library</h2>
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-transparent">
              {['PUBLISHED', 'SCHEDULED', 'DRAFTS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-2 text-[15px] font-semibold transition-colors relative ${
                    activeTab === tab ? 'text-[#1877f2]' : 'text-[#65676B] hover:bg-gray-50'
                  }`}
                >
                  {t(`postSearch.tabs.${tab.toLowerCase()}`)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1877f2] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reel Alert (Matching screenshot) */}
          <div className="bg-[#E7F3FF] p-4 flex items-center gap-3 border-b border-[#ced0d4]">
             <div className="w-8 h-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white">
                <Video size={18} />
             </div>
             <div className="flex-1">
                <p className="text-[14px] font-bold text-[#050505]">Videos you post on Facebook are now reels</p>
                <p className="text-[13px] text-[#65676B]">You can still view your previously posted videos, but they will be combined under the reels filter.</p>
             </div>
             <button className="text-[#65676B] hover:bg-black/5 p-1 rounded-full">✕</button>
          </div>

          {/* Action Bar */}
          <div className="p-4 flex flex-wrap items-center gap-2 border-b border-[#ced0d4] bg-white">
            <div className="relative flex-1 min-w-[300px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" size={16} />
              <input
                type="text"
                placeholder="Search for posts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] rounded-full text-[14px] outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors">
                <Plus size={18} strokeWidth={3} />
                <span>Create</span>
                <ChevronDown size={14} />
              </button>

              <button className="flex items-center gap-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] px-3 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors">
                <Filter size={16} />
                <span>Filters</span>
                <ChevronDown size={14} />
              </button>

              <button className="flex items-center gap-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] px-3 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors">
                <Columns size={16} />
                <span>Columns</span>
                <ChevronDown size={14} />
              </button>

              <button className="flex items-center gap-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] px-3 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors">
                <span>Last 28 days: Mar 16 - Apr 13</span>
                <ChevronDown size={14} />
              </button>

              <button className="flex items-center gap-1.5 bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] px-3 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors ml-auto">
                <Download size={16} />
                <span>Export data</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Selection Info */}
          <div className="px-4 py-2 border-b border-[#ced0d4] bg-white">
             <span className="text-[12px] text-[#65676B] font-medium">
               {selectedIds.length}/{results.length} posts selected
             </span>
          </div>

          {/* Table Headers */}
          <div className="flex items-center bg-[#F2F3F5] border-b border-[#ced0d4] px-4 py-2 text-[12px] font-bold text-[#65676B] uppercase tracking-wide">
            <div className="flex items-center justify-center w-6 mr-4">
              <input 
                type="checkbox" 
                checked={selectedIds.length === results.length && results.length > 0} 
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#1877f2] focus:ring-[#1877f2]"
              />
            </div>
            <div className="flex-1 flex items-center gap-1 min-w-[300px]">
              {t('postSearch.table.preview')}
              <ChevronDown size={14} className="text-[#1877f2]" />
            </div>
            {['views', 'viewers', 'interactions', 'netFollows', 'impressions'].map(col => (
              <div key={col} className="w-32 flex items-center justify-center gap-1">
                {t(`postSearch.table.${col}`)}
                <Info size={14} className="text-gray-400" />
                <ArrowUpDown size={12} />
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div className="min-h-[400px]">
            {isSearching ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 text-[#65676B]">
                 <div className="w-10 h-10 border-4 border-[#1877f2] border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-[15px] font-semibold">{t('postSearch.analyzing')}</span>
              </div>
            ) : results.length > 0 ? (
              results.map(post => (
                <PostRow 
                  key={post.id} 
                  post={post} 
                  isSelected={selectedIds.includes(post.id)}
                  onSelect={toggleSelect}
                />
              ))
            ) : (
              <div className="p-20 flex flex-col items-center justify-center text-[#65676B]">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-bold mb-1 text-[#050505]">
                  {activeTab === 'PUBLISHED' ? t('postSearch.noPosts') : `No ${activeTab.toLowerCase()} posts found`}
                </h3>
                <p className="text-[14px]">{t('postSearch.noPostsHint')}</p>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Floating Create Button (Optional, Facebook has it in sidebar usually but adding a secondary one matches overall feel) */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all scale-100 hover:scale-105 active:scale-95 text-[#050505]">
         <Plus size={24} />
      </button>

    </div>
  );
};

