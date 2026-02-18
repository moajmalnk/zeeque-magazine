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
  Heart, MessageCircle, Share2, MoreHorizontal, Send, Volume2, VolumeX, Smile, Play, Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper function to convert video URLs to embed format
function getVideoEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
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

// Avatar Initials Helper
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const avatarColors = ['bg-pink-100 text-pink-600', 'bg-violet-100 text-violet-600', 'bg-cyan-100 text-cyan-600', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-600'];

export function PostCard({ post, index = 0 }: PostCardProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated: isLoggedIn } = useAuth();
  // Mock interactions state
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 5);
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

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleAuthAction(() => {
      if (isLiked) setLikeCount(c => c - 1);
      else setLikeCount(c => c + 1);
      setIsLiked(!isLiked);
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

  const avatarColor = avatarColors[post.author_name.length % avatarColors.length];
  const categoryLabel = categoryLabels[post.category];
  const categoryIcon = categoryIcons[post.category];
  const gradientClass = categoryStyles[post.category] || categoryStyles.other;

  return (
    <>
      <div
        className={cn(
          "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-[0_2px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none transition-all duration-300 flex flex-col h-full group",
          index > 0 && `animate-in fade-in slide-in-from-bottom-8 duration-700 delay-${Math.min(index * 100, 500)}`
        )}
      >
        {/* --- Card Header: User Info --- */}
        <div className="p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-sm font-black shadow-sm ring-2 ring-white dark:ring-slate-800 shrink-0`}>
              {getInitials(post.author_name)}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none truncate">
                  {post.author_name}
                </span>
                {post.teacher_name && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium hover:bg-slate-200">
                    Student
                  </Badge>
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[180px]">
                {post.school_name || 'ZeeQue School'}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* --- Card Media: Main Content --- */}
        <div
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800"
          onClick={() => setIsOpen(true)}
        >
          {/* Floating Category Badge */}
          <div className="absolute top-3 left-3 z-20">
            <div className={cn("glass-panel px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md bg-white/20 dark:bg-black/40 border border-white/20 text-white text-xs font-bold")}>
              <span className="text-sm shadow-sm">{categoryIcon}</span>
              <span className="drop-shadow-sm">{categoryLabel}</span>
            </div>
          </div>

          {post.video_file ? (
            <div className="w-full h-full relative group/video">
              <video
                ref={videoRef}
                src={post.video_file}
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
              src={post.image_url}
              alt={post.title}
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              onClick={(e) => { e.stopPropagation(); handleAuthAction(() => setIsLiked(!isLiked)); }}
              className={`h-10 w-10 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-600 dark:text-slate-400'}`}
              title={!isLoggedIn ? "Log in to like" : "Like"}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500"
              onClick={(e) => { e.stopPropagation(); handleAuthAction(() => { }); }}
              title={!isLoggedIn ? "Log in to comment" : "Comment"}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500"
              onClick={(e) => { e.stopPropagation(); handleAuthAction(() => { }); }}
              title={!isLoggedIn ? "Log in to share" : "Share"}
            >
              <Share2 className="w-6 h-6" />
            </Button>
          </div>


        </div>

        {/* --- Content Snippet --- */}
        <div className="px-5 pb-5 flex flex-col gap-2 flex-grow">
          {/* Likes count (Mock) */}
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            {isLiked ? 'You and 24 others liked this' : '24 likes'}
          </div>

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
          className="max-w-[1100px] w-[95vw] h-[85vh] md:h-[80vh] p-0 border-0 rounded-xl bg-white dark:bg-black shadow-2xl overflow-hidden flex flex-col z-[100]"
        >
          <DialogTitle className="sr-only">{post.title}</DialogTitle>
          <DialogDescription className="sr-only">Read {post.title} by {post.author_name}</DialogDescription>

          <div className="flex flex-col md:flex-row h-full">
            {/* Left: Media Section */}
            <div className={`relative w-full md:w-[40%] h-[30vh] md:h-full bg-black flex items-center justify-center overflow-hidden border-r border-slate-100 dark:border-zinc-800`}>

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
                      src={post.video_file}
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
                    {/* Show pause icon briefly on hover/interaction if playing ?? No, user asked to remove elements. Just the click to pause/play. */}
                  </div>
                ) : post.video_url ? (() => {
                  const embedUrl = getVideoEmbedUrl(post.video_url);
                  return embedUrl ? (
                    <iframe
                      src={embedUrl.replace('autoplay=1&mute=1&controls=0&loop=1', 'autoplay=1')}
                      title={post.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-white font-bold underline">Video Link</div>
                  )
                })() : post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="max-w-full max-h-full object-contain shadow-lg" />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center p-10 text-center ${categoryStyles[post.category]} bg-opacity-80`}>
                    <span className="text-8xl mb-4">{categoryIcon}</span>
                    <h2 className="text-3xl font-bold text-white shadow-sm">{post.title}</h2>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Social Sidebar (Instagram Style) */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-black overflow-x-hidden">
              {/* 1. Header */}
              <div className="p-3 pr-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 h-16">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center font-bold text-xs ring-1 ring-slate-100 dark:ring-zinc-800`}>
                    {getInitials(post.author_name)}
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
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition-colors hidden md:block">
                    <MoreHorizontal className="w-5 h-5 text-slate-900 dark:text-zinc-100" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition-colors hidden md:block text-slate-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 2. Scrollable Comments Feed */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-elegant space-y-4 overflow-x-hidden">
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

                {/* Mock Comments */}
                <div className="border-t border-slate-50 dark:border-zinc-900 my-2 pt-2" />

                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-1">
                      U{i}
                    </div>
                    <div className="text-sm flex-1">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm mr-2 cursor-pointer hover:opacity-70">user_{i}</span>
                      <span className="text-slate-700 dark:text-zinc-300">
                        {i % 2 === 0 ? "This is such a great post! 🔥" : "Amazing work, keep it up! 👏"}
                      </span>
                      <div className="flex gap-3 mt-1 text-xs text-slate-400 font-medium">
                        <span>{i}h</span>
                        <button className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300">Reply</button>
                        <button className="opacity-0 group-hover:opacity-100 hover:text-slate-800 dark:hover:text-zinc-300 transition-opacity">
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* 3. Footer Actions (Sticky) */}
              <div className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-black p-3 shrink-0 z-10 flex flex-col gap-1">
                {/* Action Icons */}
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex gap-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAuthAction(() => setIsLiked(!isLiked))}
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
                        className="hover:opacity-60 transition-opacity"
                        onClick={() => handleAuthAction(() => { })}
                      >
                        <Share2 className="w-6 h-6 text-slate-900 dark:text-white" strokeWidth={1.5} />
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
                <div className="relative border-t border-slate-100 dark:border-zinc-800 pt-3 flex items-center gap-2">
                  {isLoggedIn ? (
                    <>
                      <button className="text-slate-900 dark:text-white hover:opacity-70 transition-opacity">
                        <Smile className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0 placeholder:text-slate-500 dark:placeholder:text-zinc-500 text-slate-900 dark:text-zinc-100 h-8"
                      />
                      <button className="text-blue-500 font-semibold text-sm hover:text-blue-700 disabled:opacity-50 transition-colors">Post</button>
                    </>
                  ) : (
                    <div className="w-full h-8 flex items-center justify-between px-3 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-md">
                      <span className="text-slate-500 dark:text-zinc-500 text-xs font-medium italic">Log in to join the conversation</span>
                      <button className="text-primary hover:text-primary/80 font-bold text-xs transition-colors">Log In</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Authentication Required Modal */}
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

          <DialogFooter className="sm:justify-center mt-2">
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors font-medium"
            >
              Maybe later
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
