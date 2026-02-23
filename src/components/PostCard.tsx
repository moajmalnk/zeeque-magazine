import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  X, Calendar, User, GraduationCap, School,
  Heart, MessageCircle, Share2, Send, Volume2, VolumeX, Smile, Play, Pause, BadgeCheck, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRoleColor, isVerifiedRole } from '@/lib/roleUtils'; // Imported
import { getCategoryStyle } from '@/lib/categoryUtils';
import { usePosts } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to convert video URLs to embed format
function getVideoEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playlist=${videoId}`;
      }
    }

    // Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop();
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1`;
      }
    }

    // Return original URL if not YouTube/Vimeo (for other video platforms)
    return url;
  } catch {
    return null;
  }
}

interface PostCardProps {
  post: Post;
  index?: number;
}

const categoryStyles = {
  stories: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
  poems: 'bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500',
  drawings: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500',
  news: 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500',
  video: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600',
  other: 'bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-500',
};

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

// Avatar Initials Helper
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export function PostCard({ post, index = 0 }: PostCardProps) {
  const navigate = useNavigate();
  const { toggleShare } = usePosts();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated: isLoggedIn, user } = useAuth();
  const queryClient = useQueryClient();

  // Interactions state
  const [isLiked, setIsLiked] = useState(post.is_liked_by_me || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);

  // Sync state with props
  useEffect(() => {
    setIsLiked(post.is_liked_by_me || false);
    setLikeCount(post.likes_count || 0);
    setShareCount(post.share_count || 0);
    setIsShared(post.is_shared_by_me || false);
  }, [post.is_liked_by_me, post.likes_count, post.share_count, post.is_shared_by_me]);

  // Comments Logic
  const [commentText, setCommentText] = useState("");
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', post.id],
    enabled: isOpen && !!post.id,
    queryFn: async () => {
      const response = await api.get(`/posts/${post.id}/comments/`);
      return response.data.results || response.data;
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.post(`/posts/${post.id}/comments/`, { content: text });
    },
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: ['comments', post.id] });
      const previousComments = queryClient.getQueryData(['comments', post.id]);
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
      queryClient.setQueryData(['comments', post.id], (old: any) => {
        const list = old && old.results ? old.results : (old || []);
        return [newComment, ...list];
      });
      setCommentText("");
      return { previousComments };
    },
    onError: (err, newTodo, context: any) => {
      queryClient.setQueryData(['comments', post.id], context.previousComments);
      toast.error("Failed to post comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
    }
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  // Share state
  const [shareCount, setShareCount] = useState(post.share_count || 0);
  const [isShared, setIsShared] = useState(post.is_shared_by_me || false);
  const [isSharing, setIsSharing] = useState(false);

  const [isMuted, setIsMuted] = useState(true);
  const [isDialogPlaying, setIsDialogPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogVideoRef = useRef<HTMLVideoElement>(null);

  const handleAuthAction = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast.info("Please log in to view profiles.", {
        action: { label: "Log In", onClick: () => navigate('/login') }
      });
      return;
    }
    if (post.author_id) {
      navigate(`/profile/${post.author_id}`);
    }
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/posts/${post.id}/like/`);
      return data;
    },
    onSuccess: (data) => {
      // Ensure sync with server response
      setLikeCount(data.likes_count);
      setIsLiked(data.status === 'liked');
    },
    onError: () => {
      // Revert optimistic update
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1); // If we thought we liked it (isLiked=true), revert by removing like (-1). Wait, isLiked is the OLD state or NEW state?
      // Actually simpler: just revert to previous.
      setIsLiked(prev => !prev);
      toast.error("Failed to update like");
    }
  });

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleAuthAction(() => {
      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

      likeMutation.mutate();
    });
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    handleAuthAction(async () => {
      if (isSharing) return;
      setIsSharing(true);
      try {
        const response = await toggleShare(post.id);

        // Optimistic update
        if (response.status === 'shared') {
          setIsShared(true);
          setShareCount(c => c + 1);
          toast.success("Shared to Community Spotlight!");
        } else {
          setIsShared(false);
          setShareCount(c => Math.max(0, c - 1));
          toast.info("Removed from your shares");
        }
      } catch (error) {
        toast.error("Failed to share post");
      } finally {
        setIsSharing(false);
      }
    });
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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

  // Autoplay Logic with Intersection Observer
  useEffect(() => {
    if (!post.video_file) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {
              // Valid catch: Autoplay might be blocked by browser policies
              console.log('Autoplay prevented');
            });
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.6 } // Play when 60% visible
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [post.video_file]);

  const formattedDate = post.published_at
    ? new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(post.published_at))
    : '';

  const roleTheme = getRoleColor(post.author_role);
  const categoryLabel = categoryLabels[post.category];
  const categoryIcon = categoryIcons[post.category];
  const gradientClass = categoryStyles[post.category] || categoryStyles.other;

  return (
    <>
      <div
        className={cn(
          "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_2px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none transition-all duration-300 flex flex-col h-full group",
          index > 0 && `animate-in fade-in slide-in-from-bottom-8 duration-700 delay-${Math.min(index * 100, 500)}`
        )}
      >
        {/* --- Card Header: User Info --- */}
        <div className="p-4 px-5 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group/author transition-opacity hover:opacity-80"
            onClick={handleProfileClick}
          >
            {/* Role-colored avatar fallback + verified tick */}
            <div className="relative shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all overflow-hidden group-hover/author:ring-2 group-hover/author:ring-primary/20",
                post.author_image ? "" : getRoleColor(post.author_role).avatar,
                getRoleColor(post.author_role).border
              )}>
                {post.author_image ? (
                  <img src={getImageUrl(post.author_image)} alt={post.author_name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  getInitials(post.author_name)
                )}
              </div>
              {isVerifiedRole(post.author_role) && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-slate-900 rounded-full p-[1px] shadow">
                  <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none truncate group-hover/author:text-primary transition-colors">
                  {post.author_name}
                </span>
                {post.author_role && (
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold", roleTheme.badge)}>
                    {post.author_role.charAt(0) + post.author_role.slice(1).toLowerCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[180px]">
                {post.school_name || 'ZeeQue School'}
              </span>
            </div>
          </div>

        </div>

        {/* --- Card Media: Main Content --- */}
        <div
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800"
          onClick={() => setIsOpen(true)}
        >
          {/* Floating Category Badge */}
          <div className="absolute top-3 left-3 z-20">
            <div className={cn(
              "glass-panel px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md border transition-all",
              getCategoryStyle(post.category).bg,
              getCategoryStyle(post.category).text,
              getCategoryStyle(post.category).border
            )}>
              <span className="text-sm shadow-sm">{categoryIcon}</span>
              <span className="drop-shadow-sm font-bold text-[10px] uppercase tracking-wider">{categoryLabel}</span>
            </div>
          </div>

          {post.video_file ? (
            <div className="w-full h-full relative group/video">
              <video
                ref={videoRef}
                src={getImageUrl(post.video_file)}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                playsInline
              />

              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-0 group-hover/video:opacity-100 z-30"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          ) : post.video_url ? (
            <div className="w-full h-full relative flex items-center justify-center bg-slate-900 overflow-hidden">
              {/* Try to autoplay embed if possible or show thumb */}
              <iframe
                src={getVideoEmbedUrl(post.video_url) || ''}
                className="w-full h-full pointer-events-none scale-150" // Scale up to hide controls slightly
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
              {/* Overlay to catch clicks */}
              <div className="absolute inset-0 bg-transparent z-10" />
            </div>
          ) : post.image_url ? (
            <img
              src={getImageUrl(post.image_url)}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${gradientClass} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                <span className="text-7xl mb-2 block filter drop-shadow-xl">{categoryIcon}</span>
              </div>
            </div>
          )}
        </div>

        {/* --- Action Bar --- */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={toggleLike}
              className={`h-10 px-3 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all ${isLiked ? 'fill-red-500 text-red-500 hover:text-red-500 dark:hover:text-red-500 scale-105' : 'text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400'}`}
              title={!isLoggedIn ? "Log in to like" : "Like"}
            >
              <div className="flex items-center gap-1.5">
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount > 0 && <span className="text-sm font-bold">{likeCount}</span>}
              </div>
            </Button>

            <Button
              variant="ghost"
              className="h-10 px-3 rounded-full text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 transition-all"
              onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
              title={!isLoggedIn ? "Log in to comment" : "Comment"}
            >
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-6 h-6" />
                {post.comments_count > 0 && <span className="text-sm font-bold">{post.comments_count}</span>}
              </div>
            </Button>

            <Button
              variant="ghost"
              className={`h-10 px-3 rounded-full transition-all hover:bg-green-50 dark:hover:bg-green-900/20 ${isShared ? 'text-green-500 hover:text-green-600' : 'text-slate-600 dark:text-slate-400 hover:text-green-500'}`}
              onClick={handleShare}
              title={!isLoggedIn ? "Log in to share" : isShared ? "Shared!" : "Share to Spotlight"}
              disabled={isSharing}
            >
              <div className="flex items-center gap-1.5">
                <Share2 className={`w-6 h-6 ${isShared ? 'fill-current' : ''}`} strokeWidth={1.5} />
                {shareCount > 0 && <span className="text-sm font-bold">{shareCount}</span>}
              </div>
            </Button>
          </div>


        </div>

        {/* --- Content Snippet --- */}
        <div className="px-5 pb-5 flex flex-col gap-2 flex-grow">


          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{post.author_name}</span>
              <h4 className="inline text-base font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{post.title}</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {post.content}
            </p>
          </div>

          <div className="pt-2 mt-auto">
            <button
              onClick={() => setIsOpen(true)}
              className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-primary transition-colors flex items-center gap-1"
            >
              Read Full Post
            </button>
          </div>
        </div>
      </div>

      {/* --- Full Post Dialog --- */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideCloseButton
          noContentWrapper
          className="max-w-[1100px] w-[95vw] h-[92vh] md:h-[80vh] p-0 border dark:border-white/10 !rounded-[2rem] bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col z-[100] outline-none scrollbar-hide"
        >
          <DialogTitle className="sr-only">{post.title}</DialogTitle>
          <DialogDescription className="sr-only">Read {post.title} by {post.author_name}</DialogDescription>

          <div className="flex flex-col md:flex-row h-auto md:h-full overflow-visible md:overflow-hidden">
            {/* Left: Media Section - Responsive height */}
            <div className={`relative w-full md:w-[40%] h-[40vh] md:h-full bg-black flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 shrink-0`}>

              {/* Mobile Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white backdrop-blur-md md:hidden z-50 hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Background Blur Effect for "dead space" filling */}
              {(post.image_url || post.video_file) && (
                <div className="absolute inset-0 z-0 opacity-40 blur-xl transform scale-110 pointer-events-none">
                  {post.video_file ? (
                    <video src={post.video_file} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={post.image_url || ''} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
              )}

              {/* Main Media Content */}
              <div className="relative z-10 w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                {post.video_file ? (
                  <div className="relative w-full h-full group/video-player cursor-pointer" onClick={toggleDialogPlay}>
                    <video
                      ref={dialogVideoRef}
                      src={getImageUrl(post.video_file)}
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                      onPlay={() => setIsDialogPlaying(true)}
                      onPause={() => setIsDialogPlaying(false)}
                    />
                    {/* Minimalist Play/Pause Overlay */}
                    {!isDialogPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-300 pointer-events-none">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-lg transform scale-100 animate-in fade-in zoom-in duration-200">
                          <Play className="w-12 h-12 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : post.video_url ? (() => {
                  const embedUrl = getVideoEmbedUrl(post.video_url);
                  return embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={post.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-white font-bold underline">Video Link</div>
                  )
                })() : post.image_url ? (
                  <img src={getImageUrl(post.image_url)} alt={post.title} className="max-w-full max-h-full object-contain shadow-lg" />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center p-10 text-center ${categoryStyles[post.category]} bg-opacity-80`}>
                    <span className="text-8xl mb-4">{categoryIcon}</span>
                    <h2 className="text-3xl font-bold text-white shadow-sm">{post.title}</h2>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Social Sidebar (Instagram Style) */}
            <div className="flex-none md:flex-1 flex flex-col bg-white dark:bg-black overflow-visible md:overflow-hidden">
              {/* 1. Header - Sticky on Desktop */}
              <div className="p-3 pr-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 h-16 bg-white dark:bg-black z-20">
                <div className="flex items-center gap-3">
                  {/* Avatar + tick */}
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all overflow-hidden",
                      post.author_image ? "" : getRoleColor(post.author_role).avatar,
                      getRoleColor(post.author_role).border
                    )}>
                      {post.author_image ? (
                        <img src={getImageUrl(post.author_image)} alt={post.author_name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(post.author_name)
                      )}
                    </div>
                    {isVerifiedRole(post.author_role) && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-zinc-900 rounded-full p-[1px] shadow">
                        <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 leading-none hover:opacity-70 cursor-pointer truncate max-w-[150px]">
                      {post.author_name}
                    </h3>
                    {post.school_name && (
                      <span className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate max-w-[150px]">{post.school_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition-colors hidden md:block text-slate-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 2. Scrollable Comments Feed - Unified on mobile */}
              <div className="flex-none md:flex-1 overflow-visible md:overflow-y-auto p-4 scrollbar-elegant space-y-4">
                {/* Main Caption (Author's Post) */}
                {/* Main Caption (Author's Post) */}
                {/* Main Caption (Reader View Style) */}
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
                        <Skeleton className="w-7 h-7 rounded-full shrink-0" />
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
                      <div className={cn(
                        "w-7 h-7 rounded-full shrink-0 mt-1 overflow-hidden border-2",
                        getRoleColor(comment.user?.role).border
                      )}>
                        {comment.user?.profile_image ? (
                          <img src={getImageUrl(comment.user.profile_image)} alt={comment.user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-slate-500">{comment.user?.username?.[0]}</div>
                        )}
                      </div>
                      <div className="text-sm flex-1">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm mr-2 cursor-pointer hover:opacity-70" onClick={() => {
                          if (!isLoggedIn) {
                            toast.error("Please log in to view profiles.");
                            return;
                          }
                          navigate(`/profile/${comment.user.id}`)
                        }}>
                          {comment.user?.username || 'User'}
                        </span>
                        <span className="text-slate-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                          {comment.content}
                        </span>
                        <div className="flex gap-3 mt-1 text-xs text-slate-400 font-medium">
                          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                          {/* <button className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300">Reply</button> */}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 3. Footer Actions (Sticky) */}
              <div className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-black p-3 shrink-0 z-10 flex flex-col gap-1">
                {/* Action Icons */}
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex gap-4">
                    <div className="flex gap-4">
                      <button
                        onClick={toggleLike}
                        className="hover:opacity-60 transition-opacity"
                      >
                        <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-900 dark:text-white'}`} strokeWidth={1.5} />
                      </button>
                      <button
                        className="hover:opacity-60 transition-opacity"
                        onClick={() => handleAuthAction(() => { })}
                      >
                        <MessageCircle className="w-6 h-6 text-slate-900 dark:text-white" strokeWidth={1.5} />
                      </button>
                      <button
                        className={`hover:opacity-60 transition-opacity ${isShared ? 'text-green-500' : 'text-slate-900 dark:text-white'}`}
                        onClick={(e) => handleShare(e)}
                        title={isShared ? "Unshare" : "Share"}
                      >
                        <Share2 className={`w-6 h-6 ${isShared ? 'fill-green-500 text-green-500' : ''}`} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Likes & Date */}
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-sm text-slate-900 dark:text-white leading-none mb-1 cursor-pointer hover:opacity-70">{likeCount} likes</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wide font-medium leading-none">{formattedDate}</span>
                  </div>
                </div>

                {/* Add Comment Input or Login Prompt */}
                {/* Comment Input */}
                <form onSubmit={handlePostComment} className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                  {isLoggedIn ? (
                    <>
                      <Avatar className="w-8 h-8 rounded-full shrink-0 border border-border">
                        <AvatarImage src={getImageUrl(user?.profile_image)} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{user?.username?.[0]}</AvatarFallback>
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
      </Dialog >

      {/* Authentication Required Modal */}
      < Dialog open={showAuthModal} onOpenChange={setShowAuthModal} >
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

          <DialogFooter className="sm:justify-center mt-2">
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors font-medium"
            >
              Maybe later
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </>
  );
}
