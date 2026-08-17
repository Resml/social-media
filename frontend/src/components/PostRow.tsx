import { MoreHorizontal, Globe, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PostRowProps {
  post: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  previewMode?: 'detailed' | 'compact';
}

export const PostRow = ({ post, isSelected, onSelect, previewMode = 'detailed' }: PostRowProps) => {
  const { t, i18n } = useTranslation();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const locale = i18n.language.startsWith('hi') ? 'hi-IN' : i18n.language.startsWith('mr') ? 'mr-IN' : i18n.language.startsWith('hi') ? 'hi-IN' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) + ` ${t('postRow.at', 'at')} ` + 
           date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const truncate = (text: string, length: number) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  // Default to zero if metrics not present
  const metrics = post.metrics || {
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    viewers: 0,
    impressions: 0,
  };

  const interactions = metrics.likes + metrics.comments + metrics.shares;

  return (
    <div 
      className={`group flex items-center border-b border-[#ced0d4] hover:bg-[#F2F3F5] transition-colors cursor-pointer py-3 px-4 ${isSelected ? 'bg-[#E7F3FF]' : 'bg-white'}`}
      onClick={() => onSelect(post.id)}
    >
      {/* Selection */}
      <div className="flex items-center justify-center w-6 mr-4">
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => {}} // Handled by div click
          className="w-4 h-4 rounded border-gray-300 text-[#1877f2] focus:ring-[#1877f2]"
        />
      </div>

      {/* Preview Column */}
      <div className="flex flex-1 min-w-[300px] items-center gap-3">
        {previewMode === 'detailed' && (
          <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
            {post.mediaUrls?.[0] ? (
              <img src={post.mediaUrls[0]} alt="Thumbnail" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                <span className="text-[10px] font-bold">TEXT</span>
              </div>
            )}
            {post.platform === 'FACEBOOK' && post.mediaUrls?.[0] && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                 <Play size={16} color="white" fill="white" className="opacity-80" />
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[14px] font-medium text-[#050505] leading-tight mb-1">
            {truncate(post.caption, 45) || t('postCard.noCaption', 'No caption available')}
          </span>
          <div className="flex items-center gap-1.5 text-[12px] text-[#65676B]">
            <Globe size={12} />
            <span>{t('postSearch.tabs.published', 'Published')}</span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </div>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-1 hover:bg-white rounded-full border border-transparent hover:border-gray-200 shadow-sm">
             <MoreHorizontal size={20} color="#65676B" />
           </button>
        </div>
      </div>

      {/* Views */}
      <div className="w-32 text-center text-[14px] text-[#050505]">
        {metrics.views?.toLocaleString() || '--'}
      </div>

      {/* Viewers */}
      <div className="w-32 text-center text-[14px] text-[#050505]">
        {metrics.viewers?.toLocaleString() || '--'}
      </div>

      {/* Interactions */}
      <div className="w-32 text-center text-[14px] text-[#050505]">
        {interactions?.toLocaleString() || '--'}
      </div>

      {/* Net Follows */}
      <div className="w-32 text-center text-[14px] text-[#050505]">
        {Math.floor(Math.random() * 50) || '--'}
      </div>

      {/* Impressions */}
      <div className="w-32 text-center text-[14px] text-[#050505]">
        {metrics.impressions?.toLocaleString() || '--'}
      </div>
    </div>
  );
};
