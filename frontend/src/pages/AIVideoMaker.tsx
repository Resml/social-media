import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { toast } from 'sonner';
import { 
  Video, Wand2, Play, Settings, Film, RefreshCw, History, Search, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AIHistoryService, type AIHistoryItem } from '../services/aiHistoryService';

export const AIVideoMaker = () => {
  const { t } = useTranslation();
  
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [format, setFormat] = useState('Landscape (16:9)');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    api.get('/oauth/accounts')
       .then(res => { 
         setAccounts(res.data); 
         if (res.data.length > 0) setAccountId(res.data[0].id); 
       })
       .catch(err => console.error('No accounts loaded', err));
       
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const items = await AIHistoryService.getHistory();
      setHistory(items.filter(i => i.contentType === 'Video'));
    } catch (err) {
      console.error(err);
    }
    setHistoryLoading(false);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error(t('aiVideo.missingPrompt', 'Please enter a video prompt'));
      return;
    }

    setIsGenerating(true);
    setGeneratedVideoUrl(null);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) {
          clearInterval(interval);
          return 95;
        }
        return p + Math.random() * 10;
      });
    }, 500);

    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);
      
      const placeholderVideo = "https://www.w3schools.com/html/mov_bbb.mp4"; 
      setGeneratedVideoUrl(placeholderVideo);
      setIsGenerating(false);
      
      try {
        await AIHistoryService.addToHistory({
          title: prompt,
          contentType: 'Video',
          tone: style,
          language: format,
          generatedContent: placeholderVideo
        });
        loadHistory();
      } catch (err) {
        console.error("Failed to save history");
      }

      toast.success(t('aiVideo.successGenerated', 'Video generated successfully!'));
    }, 4000);
  };

  const handleLoadFromHistory = (item: AIHistoryItem) => {
    setPrompt(item.title);
    setStyle(item.tone);
    setFormat(item.language);
    setGeneratedVideoUrl(item.generatedContent);
  };

  const handleCreatePost = async (status: string = 'QUEUED') => {
    if (!accountId || !caption || !date || !generatedVideoUrl) {
      return toast.error(t('schedule.alerts.missingFields', 'Missing required fields'));
    }
    
    setIsScheduling(true);
    try {
      await api.post('/schedule', { 
        socialAccountId: accountId, 
        content: caption, 
        scheduledAt: date, 
        status, 
        mediaUrls: [generatedVideoUrl] 
      });
      setCaption(''); 
      setDate(''); 
      setGeneratedVideoUrl(null);
      setProgress(0);
      toast.success(`${t('schedule.alerts.success', 'Post successfully set to')} ${status}!`);
    } catch(err) { 
      console.error('Error saving:', err);
      toast.error('Failed to schedule video post.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Video size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {t('aiVideo.title', 'AI Video Maker')}
              </h1>
              <p className="text-slate-500 font-medium">
                {t('aiVideo.subtitle', 'Create stunning videos from text prompts')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Configuration & Generation */}
            <div className="ns-card p-6 space-y-6">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Settings size={20} className="text-blue-600" />
                <h2>{t('aiVideo.configTitle', 'Video Configuration')}</h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {t('aiVideo.promptLabel', 'Video Prompt')}
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="ns-input resize-none"
                    placeholder={t('aiVideo.promptPlaceholder', 'Describe what you want to generate...')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t('aiVideo.styleLabel', 'Video Style')}
                    </label>
                    <select
                      className="ns-input"
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                    >
                      <option value="Cinematic">Cinematic</option>
                      <option value="Animation">3D Animation</option>
                      <option value="Anime">Anime Style</option>
                      <option value="Photorealistic">Photorealistic</option>
                      <option value="Cartoon">Cartoon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t('aiVideo.formatLabel', 'Format')}
                    </label>
                    <select
                      className="ns-input"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      <option value="Landscape (16:9)">Landscape (16:9)</option>
                      <option value="Square (1:1)">Square (1:1)</option>
                      <option value="Portrait (9:16)">Portrait (9:16)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt}
                  className="ns-btn-primary w-full py-3 shadow-blue-100"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      {t('aiVideo.generating', 'Generating Video...')} {Math.floor(progress)}%
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      {t('aiVideo.generateBtn', 'Generate Video')}
                    </>
                  )}
                </button>
              </form>
              
              {isGenerating && (
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Right: Result & Scheduling Pipeline */}
            <div className="ns-card p-6 flex flex-col h-full min-h-[400px] space-y-6">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Film size={20} className="text-blue-600" />
                <h2>{t('aiVideo.previewTitle', 'Video Preview')}</h2>
              </div>

              {/* Video Player */}
              <div className="w-full bg-slate-50 rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-100" style={{ aspectRatio: format.includes('9:16') ? '9/16' : format.includes('1:1') ? '1/1' : '16/9', maxHeight: '350px' }}>
                {generatedVideoUrl ? (
                  <video 
                    src={generatedVideoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full h-full object-contain bg-black"
                  />
                ) : isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-600 font-bold animate-pulse">{t('aiVideo.generating', 'Generating Video...')}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <Play size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">{t('aiVideo.noVideo', 'Click generate to see your video.')}</p>
                  </div>
                )}
              </div>

              {/* Scheduling Form (Only active if video generated) */}
              <div className={`flex-1 flex flex-col gap-5 transition-opacity duration-500 ${generatedVideoUrl ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4">{t('aiVideo.postTitle', 'Schedule this video')}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <select 
                        className="ns-input w-full"
                        value={accountId} 
                        onChange={e => setAccountId(e.target.value)}
                      >
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.platform} — {a.accountHandle}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <textarea 
                        className="ns-input resize-none w-full"
                        value={caption} 
                        onChange={e => setCaption(e.target.value)} 
                        rows={3}
                        placeholder={t('aiVideo.captionPlaceholder', 'Write video caption...')}
                      />
                    </div>

                    <div>
                      <input 
                        type="datetime-local" 
                        className="ns-input w-full"
                        value={date} 
                        onChange={e => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-2">
                  <button onClick={() => handleCreatePost('DRAFT')} disabled={isScheduling}
                    className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:bg-slate-50 border-2 border-slate-200 text-slate-700"
                  >
                    {t('schedule.saveDraft', 'Save Draft')}
                  </button>
                  <button onClick={() => handleCreatePost('QUEUED')} disabled={isScheduling || !caption || !date}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 bg-blue-600 hover:bg-blue-700"
                  >
                    {isScheduling ? '...' : t('schedule.queuePost', 'Queue Post 🚀')}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              {t('aiVideo.historyTitle', 'History')}
            </h3>
            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
              {history.length}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('aiVideo.searchHistory', 'Search history...')}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {historyLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl animate-pulse">
                <div className="h-4 w-20 bg-slate-200 rounded mb-3"></div>
                <div className="h-3 w-full bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
              </div>
            ))
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-xs font-medium">{t('aiVideo.noHistory', 'No history yet')}</p>
            </div>
          ) : (
            history
              .filter(item => 
                item.title.toLowerCase().includes(historySearch.toLowerCase())
              )
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => handleLoadFromHistory(item)}
                  className="w-full text-left p-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {item.contentType}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-blue-700">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.generatedContent}
                  </p>
                </button>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
