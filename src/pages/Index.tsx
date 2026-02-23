import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PostGrid } from '@/components/PostGrid';
import { FAQSection } from '@/components/FAQSection';
import { usePosts } from '@/hooks/usePosts';
import { Category, Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { ArrowRight, Grid3x3, X, Heart, MessageCircle, Share2, FileText, BadgeCheck, Play, Flame, Sparkles, Users, UserPlus, GraduationCap, Plus, Smile, School, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getRoleColor } from '@/lib/roleUtils';

// Helper for category colors (Gradients)

// Helper function to convert video URLs to embed format
function getVideoEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playlist=${videoId}`;
    }
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop();
      if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1`;
    }
    return url;
  } catch {
    return null;
  }
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const avatarColors = ['bg-pink-100 text-pink-600', 'bg-violet-100 text-violet-600', 'bg-cyan-100 text-cyan-600', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-600'];

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      if (urlObj.port === '8000' || urlObj.hostname === '127.0.0.1' || urlObj.hostname === 'localhost') {
        return urlObj.pathname;
      }
    } catch (e) {
      return url;
    }
  }
  return url;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Tech': return 'bg-blue-600';
    case 'Story': return 'bg-amber-500';
    case 'Science': return 'bg-emerald-600';
    case 'Photo': return 'bg-pink-600';
    case 'Poem': return 'bg-purple-600';
    case 'Design': return 'bg-cyan-600';
    default: return 'bg-slate-700';
  }
};

const SharedPostCard = ({ post, onClick, isLatestSort = false, isFollowingSort = false }: { post: Post, onClick: () => void, isLatestSort?: boolean, isFollowingSort?: boolean }) => {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const displayImage = post.image_url || post.image;
  const displayVideo = post.video_url || post.video_file;
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { }); // catch auto-play errors
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Use latest sharer info if available and in "Fresh" mode
  // If "Following" mode, use the author info
  const topPillUser = isLatestSort && post.latest_shared_by
    ? { username: post.latest_shared_by.username, avatar: post.latest_shared_by.avatar, id: post.latest_shared_by.id, role: post.latest_shared_by.role }
    : isFollowingSort
      ? { username: post.author_name, avatar: post.author_image, id: post.author_id, role: post.author_role }
      : null;

  const recentSharers = isLatestSort && post.recent_sharers ? post.recent_sharers : [];
  const hasMultipleSharers = recentSharers.length > 1;

  const { isAuthenticated } = useAuth();

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Please log in to view profiles.", {
        action: { label: "Log In", onClick: () => navigate('/login') }
      });
      return;
    }
    navigate(`/profile/${userId}`);
  };
  // ... (rest of component) ...
  // Update usage in Index component:
  // <SharedPostCard
  //   key={post.id}
  //   post={post}
  //   isLatestSort={spotlightSort === 'latest'}
  //   isFollowingSort={spotlightSort === 'following'} // Add this line
  //   onClick={() => { ...

  return (
    <div
      className="relative flex-shrink-0 w-36 h-56 md:w-48 md:h-72 rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group shadow-md hover:shadow-xl border border-border/10 bg-muted transform-gpu [backface-visibility:hidden] isolation-isolate [mask-image:radial-gradient(white,black)]"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background/Image/Video Layer */}
      {
        displayImage && !imgError ? (
          <img
            src={getImageUrl(displayImage)}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : post.video_file ? (
          <video
            ref={videoRef}
            src={getImageUrl(post.video_file)}
            muted
            playsInline
            loop
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : post.video_url && getVideoEmbedUrl(post.video_url) ? (
          <div className="w-full h-full relative bg-slate-900 group-hover:scale-105 transition-transform duration-700 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Wrapper to center and crop the video */}
              <iframe
                src={getVideoEmbedUrl(post.video_url)}
                className="min-w-[177.77vh] min-h-[100vh] w-auto h-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-[0.6] md:scale-[0.8]" // Scale down slightly to fit card context better while maintaining cover
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={post.title}
                tabIndex={-1}
              />
            </div>
            {/* Block Start Overlay to prevent interaction and allow card click */}
            <div className="absolute inset-0 bg-transparent z-10" />
          </div>
        ) : (
          // Attractive Fallback if Image Fails
          <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-700 ${getCategoryColor(post.category)}`}>
            {/* Abstract Texture Overlay */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            <FileText className="w-8 h-8 md:w-10 md:h-10 text-white/60 mb-3 relative z-10" />
            {/* Title removed from here to avoid duplication with the bottom caption */}
          </div>
        )
      }

      {/* Dark Overlay for Text Readability: Stronger for images, lighter for solid colors */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none",
          displayImage && !imgError ? "opacity-80" : "opacity-40"
        )}
      />

      {/* Top: Shared Information & Engagement Metrics */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 gap-2">
        {/* Left: Sharer Info (if available) */}
        <div className="flex items-center min-w-0">
          {hasMultipleSharers ? (
            <div className="flex items-center pl-1">
              {recentSharers.slice(0, 3).map((sharer, i) => (
                <div
                  key={sharer.id}
                  className={cn(
                    "relative w-7 h-7 rounded-full border-2 border-background/20 overflow-hidden cursor-pointer hover:scale-110 hover:z-20 transition-transform shadow-sm ring-1 ring-black/20",
                    i > 0 ? "-ml-3" : ""
                  )}
                  style={{ zIndex: 10 - i }}
                  onClick={(e) => handleProfileClick(e, sharer.id)}
                  title={sharer.username}
                >
                  <Avatar className={cn(
                    "w-full h-full border-2",
                    getRoleColor(sharer.role).border
                  )}>
                    <AvatarImage src={getImageUrl(sharer.avatar)} className="object-cover" />
                    <AvatarFallback
                      className={cn(
                        "text-[9px] font-bold text-white flex items-center justify-center w-full h-full",
                        ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"][
                        (sharer.username.charCodeAt(0) + sharer.username.length) % 6
                        ]
                      )}
                    >
                      {sharer.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          ) : topPillUser ? (
            <div
              className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full pl-1 pr-3 py-1 border border-white/10 shadow-sm max-w-full cursor-pointer hover:bg-black/80 transition-colors"
              onClick={(e) => topPillUser.id && handleProfileClick(e, topPillUser.id)}
            >
              <Avatar className={cn(
                "w-5 h-5 border-2",
                getRoleColor(topPillUser.role).border
              )}>
                <AvatarImage src={getImageUrl(topPillUser.avatar)} />
                <AvatarFallback
                  className={cn(
                    "text-[8px] text-white flex items-center justify-center w-full h-full",
                    ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"][
                    (topPillUser.username.charCodeAt(0) + topPillUser.username.length) % 6
                    ]
                  )}
                >
                  {topPillUser.username.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-bold text-white truncate max-w-[80px]">
                {topPillUser.username}
              </span>
              <BadgeCheck className="w-3 h-3 text-blue-400 fill-blue-400/20" />
            </div>
          ) : null}
        </div>

        {/* Right: Engagement Stats (Hidden if 0) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {post.likes_count > 0 && (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/10 shadow-sm transition-all animate-in fade-in zoom-in duration-300">
              <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" />
              <span className="text-[9px] font-bold text-white">
                {post.likes_count}
              </span>
            </div>
          )}
          {post.share_count > 0 && (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/10 shadow-sm transition-all animate-in fade-in zoom-in duration-300">
              <Share2 className="w-2.5 h-2.5 text-white/80" />
              <span className="text-[9px] font-bold text-white">
                {post.share_count}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Post Info with Avatar */}
      <div className="absolute bottom-4 left-3 right-3 flex flex-col gap-2 z-20">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 bg-primary/80 px-1.5 py-0.5 rounded-sm">
            {post.category}
          </span>
        </div>

        <h3 className="text-white font-bold text-xs md:text-sm leading-tight line-clamp-1 drop-shadow-sm group-hover:text-primary-foreground transition-colors break-words">
          {post.title}
        </h3>

        <div
          className="flex items-center gap-2 mt-1.5 cursor-pointer hover:opacity-80 transition-opacity w-fit"
          onClick={(e) => post.author_id && handleProfileClick(e, post.author_id)}
        >
          <Avatar className={cn(
            "w-6 h-6 border-2 shadow-sm",
            getRoleColor(post.author_role).border
          )}>
            <AvatarImage src={getImageUrl(post.author_image)} alt={post.author_name} />
            <AvatarFallback className="text-[9px] bg-white/10 text-white backdrop-blur-sm">
              {post.author_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center">
            <span className="text-[7px] text-white/50 uppercase tracking-widest leading-none mb-0.5 font-bold">
              Author
            </span>
            <span className="text-white/95 text-[10px] font-medium leading-tight line-clamp-1">
              {post.author_name}
            </span>
          </div>
        </div>
      </div>
    </div >
  );
};

const SharedPostDetail = ({ post, isOpen, onClose }: { post: Post | null, isOpen: boolean, onClose: () => void }) => {
  const navigate = useNavigate();
  const { toggleShare } = usePosts();
  const { isAuthenticated: isLoggedIn, user } = useAuth();
  const queryClient = useQueryClient();
  const dialogVideoRef = useRef<HTMLVideoElement>(null);
  const [isDialogPlaying, setIsDialogPlaying] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Interactions state
  const [isLiked, setIsLiked] = useState(post?.is_liked_by_me || false);
  const [likeCount, setLikeCount] = useState(post?.likes_count || 0);
  const [isShared, setIsShared] = useState(post?.is_shared_by_me || false);
  const [shareCount, setShareCount] = useState(post?.share_count || 0);
  const [commentText, setCommentText] = useState("");

  // Sync state with post when it changes
  useEffect(() => {
    if (post) {
      setIsLiked(post.is_liked_by_me || false);
      setLikeCount(post.likes_count || 0);
      setIsShared(post.is_shared_by_me || false);
      setShareCount(post.share_count || 0);
    }
  }, [post]);

  const toggleDialogPlay = () => {
    if (dialogVideoRef.current) {
      if (isDialogPlaying) {
        dialogVideoRef.current.pause();
      } else {
        dialogVideoRef.current.play();
      }
      setIsDialogPlaying(!isDialogPlaying);
    }
  };

  const handleAuthAction = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowAuthModal(true);
    }
  };

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', post?.id],
    queryFn: async () => {
      const response = await api.get(`/posts/${post?.id}/comments/`);
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
    enabled: !!post && isOpen,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/posts/${post?.id}/like/`);
      return data;
    },
    onSuccess: (data) => {
      setLikeCount(data.likes_count);
      setIsLiked(data.status === 'liked');
    },
    onError: () => {
      setIsLiked(prev => !prev);
      setLikeCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
      toast.error("Failed to update like");
    }
  });

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleAuthAction(() => {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      likeMutation.mutate();
    });
  };

  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await toggleShare(post!.id);
      return response;
    },
    onSuccess: (response) => {
      if (response.status === 'shared') {
        setIsShared(true);
        setShareCount(c => c + 1);
        toast.success("Shared to Community Spotlight!");
      } else {
        setIsShared(false);
        setShareCount(c => Math.max(0, c - 1));
        toast.info("Removed from your shares");
      }
    },
    onError: () => {
      toast.error("Failed to share post");
    }
  });

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleAuthAction(() => {
      shareMutation.mutate();
    });
  };

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.post(`/posts/${post?.id}/comments/`, { content: text });
    },
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ['comments', post?.id] });
      const previousComments = queryClient.getQueryData(['comments', post?.id]);
      const newComment = {
        id: `temp-${Date.now()}`,
        content: text,
        user: {
          id: user?.id,
          username: user?.username || 'You',
          profile_image: user?.profile_image
        },
        created_at: new Date().toISOString(),
        replies_count: 0
      };
      queryClient.setQueryData(['comments', post?.id], (old: any) => [newComment, ...(Array.isArray(old) ? old : (old?.results || []))]);
      setCommentText("");
      return { previousComments };
    },
    onError: (err, newTodo, context: any) => {
      queryClient.setQueryData(['comments', post?.id], context.previousComments);
      toast.error("Failed to post comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post?.id] });
    }
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  if (!post) return null;

  const formattedDate = post.published_at
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(post.published_at))
    : '';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          hideCloseButton
          noContentWrapper
          className="max-w-[1100px] w-[95vw] h-[92vh] md:h-[80vh] p-0 border dark:border-white/10 !rounded-[2rem] bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col z-[100] outline-none scrollbar-hide"
        >
          <DialogTitle className="sr-only">{post.title}</DialogTitle>
          <DialogDescription className="sr-only">Detailed view of {post.title} by {post.author_name}</DialogDescription>
          <div className="flex flex-col md:flex-row h-auto md:h-full overflow-visible md:overflow-hidden">
            {/* Left: Media Section - Responsive height */}
            <div className={`relative w-full md:w-[40%] h-[40vh] md:h-full bg-black flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 shrink-0`}>
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white backdrop-blur-md md:hidden z-50 hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>

              {(post.image_url || post.video_file) && (
                <div className="absolute inset-0 z-0 opacity-40 blur-xl transform scale-110 pointer-events-none">
                  {post.video_file ? (
                    <video src={getImageUrl(post.video_file)} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={getImageUrl(post.image_url || '')} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
              )}

              <div className="relative z-10 w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                {post.video_file ? (
                  <div className="relative w-full h-full group/video-player cursor-pointer" onClick={toggleDialogPlay}>
                    <video
                      ref={dialogVideoRef}
                      src={post.video_file}
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                      onPlay={() => setIsDialogPlaying(true)}
                      onPause={() => setIsDialogPlaying(false)}
                    />
                    {!isDialogPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300 pointer-events-none">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-lg transform scale-100 animate-in fade-in zoom-in duration-200">
                          <Play className="w-12 h-12 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : post.video_url ? (
                  getVideoEmbedUrl(post.video_url) ? (
                    <iframe
                      src={getVideoEmbedUrl(post.video_url)!}
                      title={post.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-white font-bold underline">Video Link</div>
                  )
                ) : (post.image_url || post.image) ? (
                  <img src={getImageUrl(post.image_url || post.image)} alt={post.title} className="max-w-full max-h-full object-contain shadow-lg" />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center p-10 text-center ${getCategoryColor(post.category)} bg-opacity-80`}>
                    <FileText className="w-24 h-24 text-white/80 mb-4" />
                    <h2 className="text-3xl font-bold text-white shadow-sm">{post.title}</h2>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Content Sidebar */}
            <div className="flex-none md:flex-1 flex flex-col bg-white dark:bg-black overflow-visible md:overflow-hidden">
              {/* 1. Header - Sticky on Desktop */}
              <div className="p-3 pr-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 h-16 bg-white dark:bg-black z-20">
                <div
                  className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-all"
                  onClick={() => {
                    if (!isLoggedIn) {
                      toast.info("Please log in to view profiles.", {
                        action: { label: "Log In", onClick: () => navigate('/login') }
                      });
                      return;
                    }
                    post.author_id && navigate(`/profile/${post.author_id}`);
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all overflow-hidden",
                    post.author_image ? "" : avatarColors[post.author_name.length % avatarColors.length],
                    getRoleColor(post.author_role).border
                  )}>
                    {post.author_image ? (
                      <img src={getImageUrl(post.author_image)} alt={post.author_name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(post.author_name)
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 leading-none group-hover:text-primary transition-colors cursor-pointer truncate max-w-[150px]">
                      {post.author_name}
                    </h3>
                    {post.school_name && (
                      <span className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate max-w-[150px] group-hover:text-primary/70 transition-colors">
                        {post.school_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition-colors hidden md:block text-slate-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 2. Scrollable Content Feed - Unified on mobile */}
              <div className="flex-none md:flex-1 overflow-visible md:overflow-y-auto p-4 scrollbar-elegant space-y-4">
                <div className="px-2 pt-2 pb-4">
                  <h1 className="font-display font-black text-xl md:text-2xl text-slate-900 dark:text-white mb-4 leading-tight">
                    {post.title}
                  </h1>

                  <div className="text-slate-700 dark:text-zinc-300 text-sm leading-7 whitespace-pre-wrap break-words first-letter:text-5xl first-letter:font-black first-letter:text-slate-900 dark:first-letter:text-white first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]">
                    {post.content}
                  </div>

                  <div className="mt-6 text-[10px] text-slate-400 font-medium uppercase tracking-widest border-t border-slate-100 dark:border-zinc-800 pt-3">
                    Posted on {formattedDate}
                  </div>
                </div>

                {/* Comments List */}
                <div className="border-t border-slate-50 dark:border-zinc-900 my-2 pt-2" />
                {isCommentsLoading ? (
                  <div className="space-y-4 py-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <Skeleton className="h-4 w-24 rounded" />
                          <Skeleton className="h-3 w-full rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground italic text-sm">No comments yet.</div>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <Avatar className={cn(
                        "w-8 h-8 shrink-0 border-2",
                        getRoleColor(comment.user?.role).border
                      )}>
                        <AvatarImage src={getImageUrl(comment.user?.profile_image)} />
                        <AvatarFallback className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500">
                          {getInitials(comment.user?.username || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-2xl rounded-tl-none">
                          <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 mb-0.5 block">{comment.user?.username}</span>
                          <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 ml-2">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(comment.created_at))}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 3. Footer Actions (Sticky) */}
              <div className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-black p-3 shrink-0 z-10 flex flex-col gap-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex gap-4">
                    <button onClick={toggleLike} className="hover:opacity-60 transition-opacity">
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-900 dark:text-white'}`} strokeWidth={1.5} />
                    </button>
                    <button className="hover:opacity-60 transition-opacity" onClick={() => handleAuthAction(() => { })}>
                      <MessageCircle className="w-6 h-6 text-slate-900 dark:text-white" strokeWidth={1.5} />
                    </button>
                    <button
                      className={`hover:opacity-60 transition-opacity ${isShared ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}
                      onClick={(e) => handleShare(e)}
                    >
                      <Share2 className={`w-6 h-6 ${isShared ? 'fill-green-500 text-green-500' : ''}`} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-sm text-slate-900 dark:text-white leading-none mb-1 cursor-pointer hover:opacity-70">{likeCount} likes</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wide font-medium leading-none">{formattedDate}</span>
                  </div>
                </div>

                <form onSubmit={handlePostComment} className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                  {isLoggedIn ? (
                    <>
                      <Avatar className="w-8 h-8 rounded-full shrink-0 border border-border">
                        <AvatarImage src={getImageUrl(user.profile_image)} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{user.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 min-w-0 bg-slate-50 dark:bg-zinc-900 border-0 text-xs sm:text-sm focus:ring-1 focus:ring-primary/20 rounded-full px-3 sm:px-4 py-2 placeholder:text-muted-foreground/60 text-foreground h-10 font-medium"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={commentMutation.isPending}
                      />
                      <Button
                        type="submit"
                        disabled={!commentText.trim() || commentMutation.isPending}
                        className="rounded-full font-bold px-4 sm:px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-10 shrink-0"
                      >
                        {commentMutation.isPending ? <Skeleton className="w-8 h-4 bg-white/30 rounded" /> : 'Post'}
                      </Button>
                    </>
                  ) : (
                    <div className="w-full h-8 flex items-center justify-between px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-md">
                      <span className="text-slate-500 dark:text-zinc-500 text-xs font-medium italic">Log in to join the conversation</span>
                      <button type="button" onClick={() => setShowAuthModal(true)} className="text-primary hover:text-primary/80 font-bold text-xs transition-colors">Log In</button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Modal for Interactions */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md border-0 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl p-6 z-[200]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center text-2xl font-bold font-display text-slate-900 dark:text-white">
              Join the Conversation
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 dark:text-zinc-400 mt-2">
              Log in to like, comment, and share posts with the ZeeQue community. It takes just a moment!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Button onClick={() => navigate('/login')} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Log In
            </Button>
            <Button onClick={() => navigate('/signup')} variant="outline" className="w-full border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold h-11 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              Sign Up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedSharedPost, setSelectedSharedPost] = useState<Post | null>(null);
  const [imageError, setImageError] = useState(false);
  const { publishedPosts, spotlightPosts, isSpotlightLoading, spotlightSort, setSpotlightSort, hasNextSpotlightPage, fetchNextSpotlightPage, isSpotlightFetchingNextPage } = usePosts();
  const { isAuthenticated, is_onboarded } = useAuth();
  const navigate = useNavigate();
  const dialogVideoRef = useRef<HTMLVideoElement>(null);
  const [isDialogPlaying, setIsDialogPlaying] = useState(true);

  const toggleDialogPlay = () => {
    if (dialogVideoRef.current) {
      if (isDialogPlaying) {
        dialogVideoRef.current.pause();
      } else {
        dialogVideoRef.current.play();
      }
      setIsDialogPlaying(!isDialogPlaying);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const category = searchParams.get('category') as Category | 'all';
    if (category) {
      setSelectedCategory(category);
      // Smooth scroll to feed section if category is selected
      const feedSection = document.getElementById('latest');
      if (feedSection) {
        feedSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Check local storage as backup for immediate state
    const userDataStr = localStorage.getItem('zeeque_user_data');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const isOnboarded = is_onboarded || userData?.is_onboarded;
    const isAuth = isAuthenticated || !!localStorage.getItem('zeeque_auth_tokens');

    if (isAuth && !isOnboarded) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, is_onboarded, navigate]);

  // Show only featured posts on home page (limit to 6)
  const featuredPosts = useMemo(() => {
    return publishedPosts.filter(post => post.is_featured).slice(0, 8);
  }, [publishedPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') {
      return featuredPosts;
    }
    return featuredPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory, featuredPosts]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Professional Ambient Background - Red & Blue Shades */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-rose-500/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1" style={{ marginTop: 0, paddingTop: 0 }}>
          <HeroSection />


          {/* Status / Highlights Section */}
          <div id="community-spotlight" className="relative z-30 mt-0 pt-16 pb-16 md:pb-24 bg-white dark:bg-background">
            <div className="container max-w-7xl px-4 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Trending Now
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight mb-3">
                  Community Spotlight
                </h2>
                <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-6">
                  Explore the latest creativity from our amazing students. From stories to art, see what's sparking imagination today! ✨
                </p>

                {/* Tabs */}
                <div className="inline-flex items-center p-1 bg-muted/50 rounded-xl border border-border/50 backdrop-blur-sm">
                  <button
                    onClick={() => setSpotlightSort('trending')}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300",
                      spotlightSort === 'trending'
                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <Flame className={cn("w-4 h-4 mr-1.5", spotlightSort === 'trending' && "fill-current")} />
                    Trending
                  </button>
                  <button
                    onClick={() => setSpotlightSort('latest')}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300",
                      spotlightSort === 'latest'
                        ? "bg-white dark:bg-slate-800 text-blue-500 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <Sparkles className={cn("w-4 h-4 mr-1.5", spotlightSort === 'latest' && "fill-current")} />
                    Fresh
                  </button>
                  <button
                    onClick={() => setSpotlightSort('following')}
                    className={cn(
                      "flex items-center px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300",
                      spotlightSort === 'following'
                        ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <Users className={cn("w-4 h-4 mr-1.5", spotlightSort === 'following' && "fill-current")} />
                    Following
                  </button>
                </div>
              </div>

              {/* Scroll Container */}
              <div className="flex gap-4 md:gap-5 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pt-2 mask-linear-fade">
                {isSpotlightLoading ? (
                  // Skeleton Loading State
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-36 h-56 md:w-48 md:h-72 rounded-xl bg-muted/50 animate-pulse border border-border/10" />
                  ))
                ) : spotlightPosts.length > 0 ? (
                  spotlightPosts.map((post) => (
                    <SharedPostCard
                      key={post.id}
                      post={post}
                      isLatestSort={spotlightSort === 'latest'}
                      isFollowingSort={spotlightSort === 'following'}
                      onClick={() => {
                        setSelectedSharedPost(post);
                        setImageError(false);
                      }}
                    />
                  ))
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-12 text-center">
                    {spotlightSort === 'following' ? (
                      !isAuthenticated ? (
                        <>
                          <div
                            className="relative mb-5 group cursor-pointer inline-block"
                            onClick={() => navigate('/login')}
                          >
                            {/* Pulsing Glow */}
                            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:blur-2xl animate-pulse transition-all duration-500" />
                            {/* Mascot Circle */}
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-lg group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                              <img
                                src="/images/mascot1.png"
                                alt="Join the class"
                                className="w-[120%] h-[120%] object-contain drop-shadow-md translate-y-2 group-hover:-rotate-6 transition-transform duration-500"
                              />
                            </div>
                            {/* Key badge */}
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-4 border-background shadow-lg group-hover:scale-110 group-hover:bg-primary/90 transition-all duration-300 z-10 text-lg">
                              🔑
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Join the Class! 🎓</h3>
                          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                            Log in to connect with your classmates and see what everyone is sharing right now.
                          </p>
                          <Link
                            to="/login"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-full text-sm font-semibold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                          >
                            Log In to Continue →
                          </Link>
                        </>
                      ) : (
                        <>
                          <div
                            className="relative mb-5 group cursor-pointer inline-block"
                            onClick={() => navigate('/community')}
                          >
                            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl group-hover:blur-2xl animate-pulse transition-all duration-500" />
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-full flex items-center justify-center border-2 border-emerald-500/20 shadow-lg group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                              <img
                                src="/images/mascot1.png"
                                alt="Start Following"
                                className="w-[120%] h-[120%] object-contain drop-shadow-md translate-y-2 group-hover:rotate-6 transition-transform duration-500"
                              />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-4 border-background shadow-lg group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300 z-10">
                              <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Start Your Network! 🚀</h3>
                          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            Follow your friends and classmates to fill this feed with their latest posts and updates.
                          </p>
                        </>
                      )
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="relative mb-5 group cursor-default inline-block">
                          {/* Pulsing Glow */}
                          <div className={cn(
                            "absolute inset-0 rounded-full blur-xl animate-pulse transition-all duration-500",
                            spotlightSort === 'latest' ? "bg-sky-500/20" : "bg-orange-500/20"
                          )} />

                          {/* Mascot Circle */}
                          <div className={cn(
                            "relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform duration-500 overflow-hidden",
                            spotlightSort === 'latest' ? "bg-gradient-to-br from-blue-500/10 to-sky-500/5 border-blue-500/20" : "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20"
                          )}>
                            <img
                              src="/images/mascot1.png"
                              alt="No posts"
                              className="w-[120%] h-[120%] object-contain drop-shadow-md translate-y-2 transition-transform duration-500"
                            />
                          </div>

                          {/* Icon Badge */}
                          <div className={cn(
                            "absolute -bottom-2 -right-2 text-white w-9 h-9 rounded-full flex items-center justify-center border-4 border-background shadow-lg z-10",
                            spotlightSort === 'latest' ? "bg-blue-500" : "bg-orange-500"
                          )}>
                            {spotlightSort === 'latest' ? <Sparkles className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {spotlightSort === 'latest' ? "Nothing Fresh Yet! ✨" : "Staying Cool! 🧊"}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
                          No posts found to display right now. Check back soon!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Load More Card */}
                {hasNextSpotlightPage && (
                  <div
                    className="relative flex-shrink-0 w-36 h-56 md:w-48 md:h-72 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group shadow-md hover:shadow-xl border border-border/10 bg-muted/50 flex flex-col items-center justify-center gap-3"
                    onClick={() => fetchNextSpotlightPage()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50" />

                    <div className="relative z-10 p-4 rounded-full bg-background/80 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-500 border border-primary/10">
                      {isSpotlightFetchingNextPage ? (
                        <Skeleton className="w-6 h-6 rounded-full bg-primary/20" />
                      ) : (
                        <ArrowRight className="w-6 h-6 text-primary" />
                      )}
                    </div>

                    <span className="relative z-10 text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      View More
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <section id="latest" className="relative pt-12 md:pt-16 lg:pt-20 pb-20 md:pb-24 lg:pb-28 bg-background">
            {/* Minimal background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

            <div className="container max-w-7xl relative z-10">
              {/* Playful Section Header */}
              <div className="text-center mb-16 md:mb-20">
                <div className="inline-block animate-bounce-gentle mb-4">
                  <span className="text-4xl">🌟</span>
                </div>

                <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground relative inline-block">
                  Latest <span className="text-primary italic">Creations</span>
                  {/* Underline Scribble */}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent z-[-1]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                  Peek into the magical world of our young artists and writers!
                </p>
              </div>

              {/* Category Filter with refined styling */}
              <div className="mb-12 md:mb-16">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  posts={featuredPosts}
                />
              </div>

              {/* Posts Grid */}
              <PostGrid
                posts={filteredPosts}
                emptyMessage={
                  selectedCategory === 'all'
                    ? "No featured posts yet!"
                    : `No featured ${selectedCategory} yet!`
                }
              />

              {/* Show Full Creatives Button */}
              {publishedPosts.length > 0 && (
                <div className="mt-12 md:mt-16 text-center">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 py-6 text-base font-semibold border-2 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
                  >
                    <Link to="/all-creatives" className="flex items-center gap-2">
                      <Grid3x3 className="w-5 h-5" />
                      <span>Show Full Creatives</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    View all {publishedPosts.length} creative works in our gallery
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* FAQ Section */}
          <FAQSection />
        </main>

        <Footer />

        {/* Shared Post Details Dialog */}
        <SharedPostDetail
          post={selectedSharedPost}
          isOpen={!!selectedSharedPost}
          onClose={() => setSelectedSharedPost(null)}
        />
      </div >
    </div >
  );
};

export default Index;
