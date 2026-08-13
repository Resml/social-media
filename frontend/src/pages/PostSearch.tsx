import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { PostRow } from '../components/PostRow';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Download, Info, ArrowUpDown, ChevronDown, Video, X } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { PostSearchReport } from '../components/PostSearchReport';
import { useRef } from 'react';

const TABLE_COL_LABELS: Record<string, string> = {
  views: 'VIEWS',
  viewers: 'VIEWERS',
  interactions: 'INTERACTIONS',
  netFollows: 'NET FOLLOWERS',
  impressions: 'IMPRESSIONS'
};

export const PostSearch = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('PUBLISHED');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostPlatform, setNewPostPlatform] = useState('Facebook');
  const [showPreviewDropdown, setShowPreviewDropdown] = useState(false);
  const [previewMode, setPreviewMode] = useState<'detailed' | 'compact'>('detailed');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleCreatePost = () => {
    if (!newPostText.trim()) return;
    toast.success(t('postSearch.createModal.success', 'Successfully scheduled to {{platform}}!', { platform: newPostPlatform }));
    setShowCreateModal(false);
    setNewPostText('');
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    
    try {
      const element = reportRef.current;
      
      const imgData = await htmlToImage.toPng(element, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        style: { opacity: '1' }
      });
      
      if (!imgData || imgData === 'data:,') {
        toast.error("Failed to capture report. Image is empty.", { id: toastId });
        return;
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Content_Library_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error('Failed to generate PDF', err);
      toast.error("Error generating PDF: " + (err?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsGeneratingReport(false);
    }
  };

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
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5] relative z-0">
      <div ref={reportRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', width: '794px' }}>
        <PostSearchReport activeTab={activeTab} results={results} />
      </div>
      <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
        
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[12px] text-[#65676B] mb-1">
             <span className="hover:underline cursor-pointer">{t('postSearch.breadcrumbs.dashboard', 'Professional dashboard')}</span>
             <span>›</span>
             <span className="hover:underline cursor-pointer text-[#050505] font-medium">{t('postSearch.breadcrumbs.content', 'Content')}</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#050505]">{t('postSearch.headerContent', 'Content')}</h1>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg border border-[#ced0d4] shadow-sm overflow-hidden">
          
          {/* Section Header */}
          <div className="p-4 border-b border-[#ced0d4]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[20px] font-bold text-[#050505]">{t('postSearch.subtitle', 'Content Library')}</h2>
              <button 
                onClick={generatePDF}
                disabled={isGeneratingReport}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors ${isGeneratingReport ? 'bg-slate-100 text-slate-400' : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505]'}`}
              >
                {isGeneratingReport ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : <Download size={16} />}
                <span>{isGeneratingReport ? t('dashboard.report.downloading', 'Generating...') : t('dashboard.report.downloadPdf', 'Download PDF')}</span>
              </button>
            </div>
            
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
                <p className="text-[14px] font-bold text-[#050505]">{t('postSearch.reelsAlert.title', 'Videos you post on Facebook are now reels')}</p>
                <p className="text-[13px] text-[#65676B]">{t('postSearch.reelsAlert.desc', 'You can still view your previously posted videos, but they will be combined under the reels filter.')}</p>
             </div>
             <button className="text-[#65676B] hover:bg-black/5 p-1 rounded-full">✕</button>
          </div>

          {/* Action Bar */}
          <div className="p-4 flex flex-wrap items-center gap-2 border-b border-[#ced0d4] bg-white">
            <div className="relative flex-1 min-w-[300px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" size={16} />
              <input
                type="text"
                placeholder={t('postSearch.searchPlaceholder', 'Search for posts')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] rounded-full text-[14px] outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-1.5 rounded-[6px] text-[14px] font-bold transition-colors">
                <Plus size={18} strokeWidth={3} />
                <span>{t('postSearch.actions.create', 'Create')}</span>
                <ChevronDown size={14} />
              </button>


            </div>
          </div>

          {/* Selection Info */}
          <div className="px-4 py-2 border-b border-[#ced0d4] bg-white">
             <span className="text-[12px] text-[#65676B] font-medium">
               {selectedIds.length}/{results.length} {t('postSearch.postsSelected', 'posts selected')}
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
            <div className="flex-1 min-w-[300px] relative">
              <button 
                onClick={() => setShowPreviewDropdown(!showPreviewDropdown)}
                className="flex items-center gap-1 hover:bg-[#e4e6eb] px-2 py-1 rounded-[6px] transition-colors -ml-2 text-[#65676B] outline-none"
              >
                {t('postSearch.table.preview', 'PREVIEW')}
                <ChevronDown size={14} className={`text-[#1877f2] transition-transform ${showPreviewDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showPreviewDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowPreviewDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#ced0d4] shadow-[0_12px_28px_rgba(0,0,0,0.2)] rounded-[8px] z-20 py-2 font-normal normal-case animate-in fade-in zoom-in-95 duration-200">
                    <button 
                      onClick={() => { setPreviewMode('detailed'); setShowPreviewDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F2F3F5] flex items-center gap-3 text-[#050505] text-[15px] font-medium transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full border ${previewMode === 'detailed' ? 'bg-[#1877f2] border-[#1877f2]' : 'border-gray-400'}`} />
                      {t('postSearch.preview.detailed', 'Detailed View')}
                    </button>
                    <button 
                      onClick={() => { setPreviewMode('compact'); setShowPreviewDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F2F3F5] flex items-center gap-3 text-[#050505] text-[15px] font-medium transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full border ${previewMode === 'compact' ? 'bg-[#1877f2] border-[#1877f2]' : 'border-gray-400'}`} />
                      {t('postSearch.preview.compact', 'Compact View')}
                    </button>
                  </div>
                </>
              )}
            </div>
            {['views', 'viewers', 'interactions', 'netFollows', 'impressions'].map(col => (
              <div key={col} className="w-32 flex items-center justify-center gap-1">
                {t(`postSearch.table.${col}`, TABLE_COL_LABELS[col])}
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
                  previewMode={previewMode}
                />
              ))
            ) : (
              <div className="p-20 flex flex-col items-center justify-center text-[#65676B]">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-bold mb-1 text-[#050505]">
                  {activeTab === 'PUBLISHED' ? t('postSearch.noPosts') : t('postSearch.noPostsTab', 'No {{tab}} posts found', { tab: t(`postSearch.tabs.${activeTab.toLowerCase()}`) })}
                </h3>
                <p className="text-[14px]">{t('postSearch.noPostsHint')}</p>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Floating Create Button (Optional, Facebook has it in sidebar usually but adding a secondary one matches overall feel) */}
      <button onClick={() => setShowCreateModal(true)} className="fixed bottom-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all scale-100 hover:scale-105 active:scale-95 text-[#050505]">
         <Plus size={24} />
      </button>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-[0_12px_28px_rgba(0,0,0,0.2)] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-[#ced0d4]">
              <h3 className="text-[20px] font-bold text-[#050505]">{t('postSearch.createModal.title', 'Create Post')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 bg-[#e4e6eb] rounded-full hover:bg-[#d8dadf] transition-colors text-[#050505]">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[15px] font-semibold text-[#050505] mb-1">{t('postSearch.createModal.selectPlatform', 'Select Platform')}</label>
                <select 
                  value={newPostPlatform} 
                  onChange={(e) => setNewPostPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] rounded-[6px] outline-none text-[15px] text-[#050505]"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter / X</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>
              <div>
                <label className="block text-[15px] font-semibold text-[#050505] mb-1">{t('postSearch.createModal.postContent', 'Post Content')}</label>
                <textarea 
                  rows={4}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder={t('postSearch.createModal.placeholder', "What's on your mind?")}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] rounded-[6px] outline-none resize-none text-[15px] text-[#050505]"
                />
              </div>
            </div>
            <div className="p-4 bg-white border-t border-[#ced0d4] flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-[6px] font-semibold text-[#050505] bg-[#e4e6eb] hover:bg-[#d8dadf] transition-colors text-[15px]">
                {t('postSearch.createModal.cancel', 'Cancel')}
              </button>
              <button onClick={handleCreatePost} className="px-4 py-2 rounded-[6px] font-semibold text-white bg-[#1877f2] hover:bg-[#166fe5] transition-colors text-[15px]">
                {t('postSearch.createModal.publish', 'Publish')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

