import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Globe } from 'lucide-react';

export const PostCard = ({ post }: { post: any }) => {
  const getInitials = (name?: string) => name ? name.substring(0, 2).toUpperCase() : 'U';

  const timeAgo = (dateStr: string) => {
    const s = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s / 60)} m`;
    if (s < 86400) return `${Math.floor(s / 3600)} h`;
    return `${Math.floor(s / 86400)} d`;
  };

  return (
    <div className="text-left overflow-hidden flex flex-col mb-4 bg-white"
      style={{
        border: '1px solid #ced0d4',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center p-3 gap-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
             style={{ backgroundColor: post.platform === 'FACEBOOK' ? '#1877f2' : (post.platform === 'INSTAGRAM' ? '#e1306c' : '#1d9bf0') }}>
          {getInitials(post.accountHandle)}
        </div>
        <div className="flex-1 leading-tight">
          <div className="font-semibold text-sm text-[var(--slate-900)]">
            {post.accountHandle || 'Unknown User'}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[13px]" style={{ color: '#65676B' }}>
            <span>{timeAgo(post.publishedAt)}</span>
            <span aria-hidden="true"> · </span>
            <Globe size={12} />
          </div>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors" style={{ color: '#65676B' }}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Caption Text */}
      {post.caption && (
        <div className="px-4 pb-3 text-[15px] whitespace-pre-wrap" style={{ color: '#050505', lineHeight: '1.4' }}>
          {post.caption}
        </div>
      )}

      {/* Full-width Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="w-full bg-slate-100">
          <img src={post.mediaUrls[0]} alt="Post media" className="w-full object-cover max-h-[500px]" />
        </div>
      )}

      {/* Metrics Row */}
      <div className="px-4 py-2.5 flex justify-between items-center text-[13px]" style={{ color: '#65676b', borderBottom: '1px solid #ced0d4' }}>
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
          {post.metrics?.likes > 0 ? (
             <>
               <div className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
                 <ThumbsUp size={9} color="white" fill="white" />
               </div>
               <span>{post.metrics?.likes.toLocaleString()}</span>
             </>
          ) : (
             <span>Be the first to like this</span>
          )}
        </div>
        <div className="flex gap-3">
           {post.metrics?.comments > 0 && <span className="cursor-pointer hover:underline">{post.metrics?.comments.toLocaleString()} comments</span>}
           {post.metrics?.shares > 0 && <span className="cursor-pointer hover:underline">{post.metrics?.shares.toLocaleString()} shares</span>}
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="flex items-center justify-between px-2 py-1 text-[15px] font-semibold" style={{ color: '#65676b' }}>
        <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-[4px] hover:bg-slate-100 transition-colors">
          <ThumbsUp size={20} strokeWidth={2} />
          <span>Like</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-[4px] hover:bg-slate-100 transition-colors">
          <MessageSquare size={20} strokeWidth={2} />
          <span>Comment</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 py-2 rounded-[4px] hover:bg-slate-100 transition-colors">
          <Share2 size={20} strokeWidth={2} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
