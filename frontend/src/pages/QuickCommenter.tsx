import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { 
  MessageCircle, 
  Send, 
  User, 
  Wand2, 
  RefreshCw, 
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AIService } from '../services/aiService';
import { toast } from 'sonner';

interface SocialAccount {
  id: string;
  platform: string;
  accountHandle: string;
}

interface TargetProfile {
  id: string;
  name: string;
  facebookId: string;
  platform: 'Facebook' | 'Instagram';
  lastPost: string;
}

const MOCK_PROFILES: TargetProfile[] = [
  { id: '1', name: 'Rahul Sharma', facebookId: 'fb.rahul.123', platform: 'Facebook', lastPost: 'Just finished a great workout!' },
  { id: '2', name: 'Anjali Patil', facebookId: 'fb.anjali.p', platform: 'Facebook', lastPost: 'Beautiful sunset in Mumbai.' },
  { id: '3', name: 'Vikram Singh', facebookId: 'fb.vikram.s', platform: 'Facebook', lastPost: 'Excited for the new project launch.' },
  { id: '4', name: 'Sneha Gupta', facebookId: 'fb.sneha.g', platform: 'Facebook', lastPost: 'Had an amazing dinner tonight.' },
  { id: '5', name: 'Amit Verma', facebookId: 'fb.amit.v', platform: 'Facebook', lastPost: 'Weekend vibes!' },
  { id: '6', name: 'Priya Reddy', facebookId: 'fb.priya.r', platform: 'Facebook', lastPost: 'Exploring the mountains.' },
  { id: '7', name: 'Sandeep K.', facebookId: 'fb.sandeep.k', platform: 'Facebook', lastPost: 'Congratulations to the team!' },
  { id: '8', name: 'Meera Das', facebookId: 'fb.meera.d', platform: 'Facebook', lastPost: 'Book club meeting was fun.' },
  { id: '9', name: 'Rohan Mehta', facebookId: 'fb.rohan.m', platform: 'Facebook', lastPost: 'New car alert!' },
  { id: '10', name: 'Kavita Iyer', facebookId: 'fb.kavita.i', platform: 'Facebook', lastPost: 'Teaching my kids Marathi today.' },
];

export const QuickCommenter = () => {
  const { t, i18n } = useTranslation();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [comments, setComments] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Manual URL state
  const [manualUrl, setManualUrl] = useState('');
  const [manualComment, setManualComment] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/settings');
      const socialAccounts = res.data.socialAccounts || [];
      setAccounts(socialAccounts);
      if (socialAccounts.length > 0) {
        setSelectedAccountId(socialAccounts[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      toast.error("Failed to load social accounts");
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleGenerateAI = async (profile: TargetProfile) => {
    setGenerating(prev => ({ ...prev, [profile.id]: true }));
    try {
      const lang = i18n.language.startsWith('mr') ? 'Marathi' : 'English';
      const suggestion = await AIService.generateQuickComment(profile.name, profile.facebookId, lang as any);
      setComments(prev => ({ ...prev, [profile.id]: suggestion }));
      toast.success(t('ai.suggestSuccess', 'AI suggestion generated!'));
    } catch (err) {
      toast.error("Failed to generate AI suggestion");
    } finally {
      setGenerating(prev => ({ ...prev, [profile.id]: false }));
    }
  };

  const handlePostComment = async (profile: TargetProfile) => {
    const message = comments[profile.id];
    if (!message || !selectedAccountId) return;

    setLoading(prev => ({ ...prev, [profile.id]: true }));
    try {
      await api.post('/engagement/quick-comment', {
        accountId: selectedAccountId,
        targetId: profile.facebookId,
        message: message
      });
      toast.success(t('quickCommenter.success', 'Comment posted successfully!'));
      setComments(prev => ({ ...prev, [profile.id]: '' }));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to post comment");
    } finally {
      setLoading(prev => ({ ...prev, [profile.id]: false }));
    }
  };

  const handlePostManualComment = async () => {
    if (!manualUrl || !manualComment || !selectedAccountId) return;
    setManualLoading(true);
    try {
      await api.post('/engagement/quick-comment', {
        accountId: selectedAccountId,
        url: manualUrl,
        message: manualComment
      });
      toast.success(t('quickCommenter.success', 'Comment posted successfully!'));
      setManualUrl('');
      setManualComment('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to post comment");
    } finally {
      setManualLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <MessageCircle size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {t('quickCommenter.title', 'Quick Commenter')}
              </h1>
              <p className="text-slate-500 font-medium">
                {t('quickCommenter.description', 'Post AI-powered comments to targeted profiles')}
              </p>
            </div>
          </div>

          {/* Account Selector */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">
              {t('quickCommenter.postFrom', 'Post From:')}
            </label>
            <select
              className="bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              {accounts.length === 0 ? (
                <option value="">{t('quickCommenter.noAccounts', 'No accounts connected')}</option>
              ) : (
                accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    @{acc.accountHandle} ({acc.platform})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Manual URL Input Section */}
        <div className="ns-card p-6 bg-white shadow-md border-blue-100">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ExternalLink size={14} className="text-blue-600" />
            {t('quickCommenter.manualInput', 'Direct Link Comment')}
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <input
                type="text"
                className="ns-input"
                placeholder={String(t('quickCommenter.urlPlaceholder', 'Paste Facebook or Instagram Post URL here...'))}
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
              />
              <textarea
                rows={2}
                className="ns-input resize-none"
                placeholder={t('quickCommenter.placeholder', 'Write your comment...')}
                value={manualComment}
                onChange={(e) => setManualComment(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handlePostManualComment}
                disabled={manualLoading || !manualUrl || !manualComment || !selectedAccountId}
                className="ns-btn-primary h-12 px-8 w-full md:w-auto shadow-blue-100"
              >
                {manualLoading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    {t('quickCommenter.sendComment', 'Post Now')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Profile List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">
            {t('quickCommenter.targetProfiles', 'Frequent Targets')}
          </h2>
          <div className="grid grid-cols-1 gap-4">
          {MOCK_PROFILES.map((profile) => (
            <div key={profile.id} className="ns-card p-5 hover:border-blue-200 transition-all group">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Profile Info */}
                <div className="flex items-start gap-4 lg:w-1/3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                    <User size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{String(t(`quickCommenter.mockProfiles.${profile.id}.name`, profile.name))}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {String(t(`dashboard.platforms.${profile.platform.toLowerCase()}`, profile.platform))}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mb-2 truncate">@{profile.facebookId}</p>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 italic text-[11px] text-slate-600 line-clamp-1">
                      "{String(t(`quickCommenter.mockProfiles.${profile.id}.post`, profile.lastPost))}"
                    </div>
                  </div>
                </div>

                {/* Comment Action */}
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full relative">
                    <input
                      type="text"
                      className="ns-input pr-12"
                      placeholder={t('quickCommenter.placeholder', 'Write a comment...')}
                      value={comments[profile.id] || ''}
                      onChange={(e) => setComments(prev => ({ ...prev, [profile.id]: e.target.value }))}
                    />
                    <button
                      onClick={() => handleGenerateAI(profile)}
                      disabled={generating[profile.id]}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title={t('ai.generateBtn', 'Generate AI Comment')}
                    >
                      {generating[profile.id] ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Wand2 size={18} />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => handlePostComment(profile)}
                    disabled={loading[profile.id] || !comments[profile.id] || !selectedAccountId}
                    className="ns-btn-primary px-6 h-10 w-full sm:w-auto shadow-blue-100 whitespace-nowrap"
                  >
                    {loading[profile.id] ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        {t('quickCommenter.sendComment', 'Post')}
                      </>
                    )}
                  </button>
                </div>

                {/* View Link */}
                <div className="hidden lg:flex items-center justify-center px-4 border-l border-slate-100">
                  <a 
                    href={`https://facebook.com/${profile.facebookId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
};
