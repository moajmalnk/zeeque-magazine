import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  RotateCcw,
  Trash2,
  Edit,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Grid3x3,
  Sparkles,
  User,
  School,
  FileText,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authorProfileCardKeyDown, goToAuthorProfile } from '@/lib/authorProfileNav';
import { format } from 'date-fns';

const categoryStyles: Record<string, string> = {
  stories: 'bg-gradient-stories text-white border-0 shadow-sm shadow-stories/30',
  poems: 'bg-gradient-poems text-white border-0 shadow-sm shadow-poems/30',
  drawings: 'bg-gradient-drawings text-white border-0 shadow-sm shadow-drawings/30',
  news: 'bg-gradient-news text-white border-0 shadow-sm shadow-news/30',
  video: 'bg-gradient-video text-white border-0 shadow-sm shadow-video/30',
  other: 'bg-gradient-other text-white border-0 shadow-sm shadow-other/30',
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'stories':
      return 'from-indigo-600 to-violet-700';
    case 'poems':
      return 'from-rose-500 to-pink-600';
    case 'drawings':
      return 'from-amber-400 to-orange-500';
    case 'news':
      return 'from-emerald-500 to-teal-600';
    case 'video':
      return 'from-blue-500 to-indigo-600';
    default:
      return 'from-slate-600 to-slate-700';
  }
};

const getVideoEmbedUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
      if (videoId)
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&disablekb=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&loop=1&enablejsapi=1&playlist=${videoId}`;
    }
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop();
      if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1`;
    }
    return url;
  } catch {
    return null;
  }
};

interface VideoPlayerProps {
  src?: string;
  url?: string;
  alwaysShowControls?: boolean;
}

const VideoPlayer = ({ src, url, alwaysShowControls = false }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isYoutubeMuted, setIsYoutubeMuted] = useState(true);

  const embedUrl = url ? getVideoEmbedUrl(url) : null;

  const toggleYoutubeMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!youtubeIframeRef.current?.contentWindow) return;
    const command = isYoutubeMuted ? 'unMute' : 'mute';
    youtubeIframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: [] }), '*');
    setIsYoutubeMuted(!isYoutubeMuted);
  };

  if (embedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/5 group shadow-lg">
        <iframe
          ref={youtubeIframeRef}
          src={embedUrl}
          title="Video Preview"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] object-cover opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
        />
        <button
          onClick={toggleYoutubeMute}
          title={isYoutubeMuted ? 'Unmute' : 'Mute'}
          className={cn(
            'absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold shadow-lg border border-white/10 transition-all hover:scale-105 active:scale-95 select-none',
            alwaysShowControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          {isYoutubeMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Mute</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const videoSrc = src || url;
  if (!videoSrc) return null;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group shadow-lg">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={() => setIsMuted(videoRef.current?.muted ?? false)}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 hover:text-white rounded-full w-10 h-10 transition-colors"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 hover:text-white rounded-full w-10 h-10 transition-colors"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export interface EditorialPostPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  onOpenApproveWorkflow?: () => void;
  onOpenRejectWorkflow?: () => void;
  onOpenRestoreWorkflow?: () => void;
  onOpenUnpublishWorkflow?: () => void;
  onOpenDeleteWorkflow?: () => void;
  onEditFromPreview?: () => void;
}

export function EditorialPostPreviewDialog({
  open,
  onOpenChange,
  post,
  onOpenApproveWorkflow,
  onOpenRejectWorkflow,
  onOpenRestoreWorkflow,
  onOpenUnpublishWorkflow,
  onOpenDeleteWorkflow,
  onEditFromPreview,
}: EditorialPostPreviewDialogProps) {
  const navigate = useNavigate();
  const { isAuthenticated: isLoggedIn } = useAuth();
  const submittedDate = format(new Date(post.created_at), 'MMM d, yyyy');

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  const avatarColors = [
    'bg-pink-100 text-pink-600',
    'bg-violet-100 text-violet-600',
    'bg-cyan-100 text-cyan-600',
    'bg-amber-100 text-amber-600',
    'bg-emerald-100 text-emerald-600',
  ];
  const avatarColor = avatarColors[post.author_name.length % avatarColors.length];

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      goToAuthorProfile(navigate, {
        isLoggedIn,
        authorId: post.author_id,
        authorName: post.author_name,
      })
    ) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        noContentWrapper
        hideCloseButton
        className="max-w-[1100px] w-[95vw] h-[92vh] md:h-[80vh] p-0 border dark:border-white/10 rounded-2xl md:!rounded-2xl bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col z-[100] outline-none scrollbar-hide"
      >
        <DialogTitle className="sr-only">Submission details: {post.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Editorial review for {post.title} by {post.author_name}
        </DialogDescription>
        <div className="flex flex-col md:flex-row h-auto md:h-full overflow-visible md:overflow-hidden">
          <div
            className={cn(
              'relative w-full md:w-[45%] h-[400px] md:h-full shrink-0 overflow-hidden group/media',
              `bg-gradient-to-br ${getCategoryColor(post.category)}`,
            )}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Grid3x3 className="w-full h-full scale-150 rotate-12" />
            </div>

            <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
              <Badge
                className={`${categoryStyles[post.category]} px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-white/20 shadow-xl backdrop-blur-md`}
              >
                {categoryIcons[post.category]} {categoryLabels[post.category]}
              </Badge>
              <div
                className={cn(
                  'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10 w-fit',
                  post.status === 'published'
                    ? 'bg-emerald-500/80 text-white'
                    : post.status === 'rejected'
                      ? 'bg-rose-500/80 text-white'
                      : 'bg-amber-400/80 text-slate-900',
                )}
              >
                {post.status} Status
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="absolute top-6 right-6 z-20 md:hidden bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/5 group-hover/media:scale-[1.02] transition-transform duration-700">
                {post.video_url || post.video_file ? (
                  <VideoPlayer src={post.video_file} url={post.video_url} alwaysShowControls />
                ) : post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/40">
                    <Sparkles className="w-16 h-16 opacity-20" />
                    <span className="text-sm font-bold tracking-widest uppercase italic">The ZeeQue Masterpiece</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-none md:flex-1 flex flex-col bg-slate-50/30 dark:bg-zinc-950/30 overflow-visible md:overflow-hidden">
            <div className="p-8 pb-4 flex items-start justify-between shrink-0">
              <div className="space-y-1 max-w-[85%]">
                <h2 className="text-xl md:text-3xl font-display font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                  {post.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Submission Detail</span>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] text-slate-400 font-medium">#{post.id.substring(0, 8)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="hidden md:flex rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-none md:flex-1 overflow-visible md:overflow-y-auto p-6 md:p-8 pt-0 space-y-8 scrollbar-elegant">
              <div
                role="button"
                tabIndex={0}
                aria-label={`View ${post.author_name}'s profile`}
                className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/50 shadow-sm flex items-center gap-4 cursor-pointer group/author hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={handleProfileClick}
                onKeyDown={(e) =>
                  authorProfileCardKeyDown(
                    e,
                    navigate,
                    {
                      isLoggedIn,
                      authorId: post.author_id,
                      authorName: post.author_name,
                    },
                    () => onOpenChange(false),
                  )
                }
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg tracking-tighter shadow-inner group-hover/author:scale-105 transition-transform',
                    avatarColor,
                  )}
                >
                  {getInitials(post.author_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Author Identity</p>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover/author:text-primary transition-colors">
                    {post.author_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5">
                    <School className="w-3 h-3 opacity-50" />
                    {post.teacher_name || post.school_name || 'Independent Creator'}
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:flex border-slate-200 dark:border-zinc-800 rounded-lg py-1 px-3">
                  <User className="w-3 h-3 mr-1.5 opacity-50" /> {post.author_role || 'Student'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <FileText className="w-4 h-4 text-primary opacity-50" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">The Narrative</span>
                </div>
                <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-2xl border border-slate-100 dark:border-zinc-800/50 relative">
                  <div className="absolute top-4 right-6 text-slate-100 dark:text-zinc-800 text-6xl font-serif pointer-events-none select-none">
                    “
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                    {post.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800 px-2">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Submitted {submittedDate}
                  </span>
                  {post.published_at && (
                    <span className="flex items-center gap-1.5 text-emerald-500">
                      <Check className="w-3 h-3" /> Live Since {format(new Date(post.published_at), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-100 dark:border-zinc-800/50 shrink-0">
              <div className="flex flex-col gap-3">
                {post.status === 'pending' && onOpenApproveWorkflow ? (
                  <Button
                    className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-emerald-700/30 text-sm sm:text-base"
                    onClick={onOpenApproveWorkflow}
                  >
                    <Check className="w-5 h-5 mr-2 stroke-[3px]" /> Approve & Publish Submission
                  </Button>
                ) : post.status === 'rejected' && onOpenRestoreWorkflow && onOpenDeleteWorkflow ? (
                  <div className="flex flex-row gap-2 w-full">
                    <Button
                      className="flex-1 min-w-0 h-12 px-4 rounded-2xl bg-gradient-to-r from-slate-600 to-blue-700 hover:from-slate-700 hover:to-blue-800 text-white font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-slate-800/40 text-sm sm:text-base"
                      onClick={onOpenRestoreWorkflow}
                    >
                      <RotateCcw className="w-5 h-5 mr-2 shrink-0 stroke-[2.5px]" /> Restore to Pending
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 min-w-0 h-12 px-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 font-bold transition-all border border-slate-200/50 dark:border-white/5 text-sm sm:text-base"
                      onClick={onOpenDeleteWorkflow}
                    >
                      <Trash2 className="w-5 h-5 mr-2 shrink-0" /> Delete
                    </Button>
                  </div>
                ) : post.status === 'rejected' && onOpenRestoreWorkflow ? (
                  <Button
                    className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-slate-600 to-blue-700 hover:from-slate-700 hover:to-blue-800 text-white font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.98] transition-all border-b-4 border-slate-800/40 text-sm sm:text-base"
                    onClick={onOpenRestoreWorkflow}
                  >
                    <RotateCcw className="w-5 h-5 mr-2 stroke-[2.5px]" /> Restore to Pending
                  </Button>
                ) : post.status === 'published' ? (
                  <div className="flex flex-row gap-2 w-full min-w-0">
                    <Button
                      variant="outline"
                      className="flex-1 min-w-0 h-12 px-2 sm:px-3 rounded-2xl border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 font-bold transition-all text-xs sm:text-sm"
                      onClick={() => onOpenUnpublishWorkflow?.()}
                      disabled={!onOpenUnpublishWorkflow}
                    >
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 shrink-0" />
                      <span className="truncate">
                        Unpublish<span className="hidden sm:inline"> Post</span>
                      </span>
                    </Button>
                    {onEditFromPreview && (
                      <Button
                        variant="ghost"
                        className="flex-1 min-w-0 h-12 px-2 sm:px-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-bold transition-all border border-indigo-100/50 dark:border-indigo-500/20 text-xs sm:text-sm"
                        onClick={onEditFromPreview}
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 shrink-0" />
                        <span className="truncate">Edit</span>
                      </Button>
                    )}
                    {onOpenDeleteWorkflow && (
                      <Button
                        variant="ghost"
                        className="flex-1 min-w-0 h-12 px-2 sm:px-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 font-bold transition-all border border-slate-200/50 dark:border-white/5 text-xs sm:text-sm"
                        onClick={onOpenDeleteWorkflow}
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 shrink-0" />
                        <span className="truncate">Delete</span>
                      </Button>
                    )}
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row gap-2">
                  {onEditFromPreview && post.status !== 'published' && (
                    <Button
                      variant="ghost"
                      className="h-11 flex-1 min-w-0 px-2 sm:px-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-bold transition-all border border-indigo-100/50 dark:border-indigo-500/20 text-xs sm:text-sm"
                      onClick={onEditFromPreview}
                    >
                      <Edit className="w-4 h-4 mr-1.5 sm:mr-2" /> Edit
                    </Button>
                  )}

                  {post.status === 'pending' && onOpenRejectWorkflow && (
                    <Button
                      variant="ghost"
                      className="h-11 flex-1 min-w-0 px-2 sm:px-4 rounded-xl bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 font-bold transition-all border border-rose-100/50 dark:border-rose-500/20 text-xs sm:text-sm"
                      onClick={onOpenRejectWorkflow}
                    >
                      <X className="w-4 h-4 mr-1.5 sm:mr-2 stroke-[3px]" /> Reject
                    </Button>
                  )}

                  {onOpenDeleteWorkflow &&
                    !(post.status === 'rejected' && onOpenRestoreWorkflow) &&
                    post.status !== 'published' && (
                      <Button
                        variant="ghost"
                        className="h-11 flex-1 min-w-0 px-2 sm:px-4 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 font-bold transition-all border border-slate-200/50 dark:border-white/5 text-xs sm:text-sm"
                        onClick={onOpenDeleteWorkflow}
                      >
                        <Trash2 className="w-4 h-4 mr-1.5 sm:mr-2" /> Delete
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
