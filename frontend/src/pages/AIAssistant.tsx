import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  PenTool, 
  Copy, 
  RefreshCw, 
  Wand2, 
  Check, 
  History, 
  Clock, 
  Search,
  Layout
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AIService, type ContentType, type ToneType, type LanguageType } from '../services/aiService';
import { AIHistoryService, type AIHistoryItem } from '../services/aiHistoryService';

export const AIAssistant = () => {
  const { t, i18n } = useTranslation();
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('Social Media Caption');
  const [tone, setTone] = useState<ToneType>('Enthusiastic');
  const [aiLanguage, setAiLanguage] = useState<LanguageType>(
    i18n.language.startsWith('mr') ? 'Marathi' : 'English'
  );

  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const items = await AIHistoryService.getHistory();
    setHistory(items);
    setHistoryLoading(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const content = await AIService.generateContent(topic, contentType, tone, aiLanguage);
      setGeneratedContent(content);
      setCopied(false);

      // Save to history
      await AIHistoryService.addToHistory({
        title: topic,
        contentType: contentType,
        tone: tone,
        language: aiLanguage,
        generatedContent: content
      });

      // Reload history to show new item
      loadHistory();
      toast.success(t('ai.successGenerated', 'Content generated successfully!'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromHistory = (item: AIHistoryItem) => {
    setTopic(item.title);
    setContentType(item.contentType as ContentType);
    setTone(item.tone as ToneType);
    setAiLanguage(item.language as LanguageType);
    setGeneratedContent(item.generatedContent);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success(t('ai.copied', 'Copied to clipboard!'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Wand2 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {t('sidebar.aiAssistant', 'AI Assistant')}
              </h1>
              <p className="text-slate-500 font-medium">
                {t('ai.subtitle', 'Generate premium content in seconds')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Card */}
            <div className="ns-card p-6 space-y-6">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <PenTool size={20} className="text-blue-600" />
                <h2>{t('ai.configuration', 'Configuration')}</h2>
              </div>

              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {t('ai.topicLabel', 'What is the topic?')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="ns-input resize-none"
                    placeholder={t('ai.topicPlaceholder', 'e.g., Opening of a new community park this Sunday...')}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t('ai.typeLabel', 'Content Type')}
                    </label>
                    <select
                      className="ns-input"
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as ContentType)}
                    >
                      <option value="Social Media Caption">{String(t('ai.types.Social Media Caption', 'Caption'))}</option>
                      <option value="Speech">{String(t('ai.types.Speech', 'Speech'))}</option>
                      <option value="Press Release">{String(t('ai.types.Press Release', 'Press Release'))}</option>
                      <option value="Article">{String(t('ai.types.Article', 'Article'))}</option>
                      <option value="Letter/Notice">{String(t('ai.types.Letter/Notice', 'Letter/Notice'))}</option>
                      <option value="Email">{String(t('ai.types.Email', 'Email'))}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      {t('ai.toneLabel', 'Tone')}
                    </label>
                    <select
                      className="ns-input"
                      value={tone}
                      onChange={(e) => setTone(e.target.value as ToneType)}
                    >
                      <option value="Enthusiastic">{String(t('ai.tones.Enthusiastic', 'Enthusiastic'))}</option>
                      <option value="Professional">{String(t('ai.tones.Professional', 'Professional'))}</option>
                      <option value="Formal">{String(t('ai.tones.Formal', 'Formal'))}</option>
                      <option value="Witty">{String(t('ai.tones.Witty', 'Witty'))}</option>
                      <option value="Emotional">{String(t('ai.tones.Emotional', 'Emotional'))}</option>
                      <option value="Urgent">{String(t('ai.tones.Urgent', 'Urgent'))}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {t('ai.languageLabel', 'Output Language')}
                  </label>
                  <select
                    className="ns-input"
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value as LanguageType)}
                  >
                    <option value="English">{String(t('ai.languages.English', 'English'))}</option>
                    <option value="Marathi">{String(t('ai.languages.Marathi', 'मराठी (Marathi)'))}</option>
                    <option value="Hindi">{String(t('ai.languages.Hindi', 'हिंदी (Hindi)'))}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !topic}
                  className="ns-btn-primary w-full py-3 shadow-blue-100"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      {t('ai.generating', 'Generating...')}
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      {t('ai.generateBtn', 'Generate Content')}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Output Card */}
            <div className="ns-card p-6 flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Layout size={20} className="text-blue-600" />
                  <h2>{t('ai.resultTitle', 'AI Result')}</h2>
                </div>
                {generatedContent && (
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-blue-600"
                    title={t('ai.copyBtn', 'Copy to clipboard')}
                  >
                    {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-5 overflow-y-auto relative">
                {!loading && !generatedContent && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <Wand2 size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">
                      {t('ai.emptyState', 'Configure the options and click generate to see the magic happen.')}
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-600 font-bold animate-pulse">{t('ai.analyzing', 'Synthesizing content...')}</p>
                  </div>
                )}

                {generatedContent && (
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed font-medium">
                    {generatedContent}
                  </div>
                )}
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
              {t('ai.historyTitle', 'History')}
            </h3>
            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
              {history.length}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('ai.searchHistory', 'Search history...')}
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
              <p className="text-xs font-medium">{t('ai.noHistory', 'No history yet')}</p>
            </div>
          ) : (
            history
              .filter(item => 
                item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
                item.generatedContent.toLowerCase().includes(historySearch.toLowerCase())
              )
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => handleLoadFromHistory(item)}
                  className="w-full text-left p-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {String(t(`ai.types.${item.contentType}`, item.contentType))}
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
