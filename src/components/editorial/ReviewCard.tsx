import { useState, useRef } from 'react';
import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, RotateCcw, Trash2, Edit, Play, Pause, Volume2, VolumeX, Grid3x3, Sparkles, User, School, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditPostDialog } from './EditPostDialog';
import { ApproveDialog } from './ApproveDialog';

interface ReviewCardProps {
  post: Post;
  onApprove?: (id: string, featured: boolean) => { undo: () => void; postTitle: string; authorName: string } | void;
  onReject?: (id: string) => { undo: () => void; postTitle: string; authorName: string } | void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (postId: string, updates: Partial<Post>) => void;
  onToggleFeature?: (id: string, currentFeatured: boolean) => void;
}

const categoryStyles: Record<string, string> = {
  stories: 'bg-gradient-stories text-white border-0 shadow-sm shadow-stories/30',
  poems: 'bg-gradient-poems text-white border-0 shadow-sm shadow-poems/30',
  drawings: 'bg-gradient-drawings text-white border-0 shadow-sm shadow-drawings/30',
  news: 'bg-gradient-news text-white border-0 shadow-sm shadow-news/30',
  video: 'bg-gradient-video text-white border-0 shadow-sm shadow-video/30',
  other: 'bg-gradient-other text-white border-0 shadow-sm shadow-other/30',
};

// Helper to convert video URLs to embed format with strict parameters for clean UI (autoplay, mute, loop, no controls)
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'stories': return 'from-indigo-600 to-violet-700';
    case 'poems': return 'from-rose-500 to-pink-600';
    case 'drawings': return 'from-amber-400 to-orange-500';
    case 'news': return 'from-emerald-500 to-teal-600';
    case 'video': return 'from-blue-500 to-indigo-600';
    default: return 'from-slate-600 to-slate-700';
  }
};

const getVideoEmbedUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
      // Updated params: controls=0 (hide bottom), disablekb=1 (no keyboard), ivory_load_policy=3 (no annotations), modestbranding=1 (minimal logo), rel=0 (related from same channel)
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&disablekb=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}`;
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
}

const VideoPlayer = ({ src, url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Determine if it's an embeddable URL
  const embedUrl = url ? getVideoEmbedUrl(url) : null;

  // Render iframe for embeds
  if (embedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/5 pointer-events-none group shadow-lg">
        <iframe
          src={embedUrl}
          title="Video Preview"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  // Render standard video player for files
  const videoSrc = src || url;
  if (!videoSrc) return null;

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
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

      {/* Professional Control Bar */}
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

      {/* Center Play Button Overlay (only when paused) */}
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

export function ReviewCard({ post, onApprove, onReject, onRestore, onDelete, onEdit, onToggleFeature }: ReviewCardProps) {
  const submittedDate = format(new Date(post.created_at), 'MMM d, yyyy');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);

  const handleApprove = (featured: boolean) => {
    if (!onApprove) return;
    const result = onApprove(post.id, featured);
    setShowApproveDialog(false);
    setShowPreviewDialog(false);

    if (result && 'undo' in result) {
      toast.success(
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-drawings flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">
              {featured ? 'Post approved and featured! ⭐' : 'Post approved and published! 🎉'}
            </p>
            <p className="text-sm text-muted-foreground">
              "{result.postTitle}" by {result.authorName} is now live
              {featured && ' and featured on the home page'}
            </p>
          </div>
        </div>,
        {
          duration: 5000,
          action: {
            label: 'Undo',
            onClick: () => {
              result.undo();
              toast.success('Action undone', {
                description: 'The post has been restored to its previous state',
                duration: 3000,
              });
            },
          },
        }
      );
    }
  };

  const handleReject = () => {
    if (!onReject) return;
    const result = onReject(post.id);
    setShowRejectDialog(false);
    setShowPreviewDialog(false);

    if (result && 'undo' in result) {
      toast.error(
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
            <X className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Post rejected</p>
            <p className="text-sm text-muted-foreground">
              "{result.postTitle}" by {result.authorName} has been moved to rejected
            </p>
          </div>
        </div>,
        {
          duration: 5000,
          action: {
            label: 'Undo',
            onClick: () => {
              result.undo();
              toast.success('Action undone', {
                description: 'The post has been restored to its previous state',
                duration: 3000,
              });
            },
          },
        }
      );
    }
  };

  const handleRestore = () => {
    if (!onRestore) return;
    onRestore(post.id);
    setShowRestoreDialog(false);
    setShowPreviewDialog(false);
    toast.success('Post moved back to pending', {
      description: `"${post.title}" has been restored to pending review`,
      duration: 3000,
    });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(post.id);
    setShowDeleteDialog(false);
    toast.success('Post deleted', {
      description: `"${post.title}" has been permanently removed`,
      duration: 3000,
    });
  };

  // Helper for avatar initials
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const avatarColors = ['bg-pink-100 text-pink-600', 'bg-violet-100 text-violet-600', 'bg-cyan-100 text-cyan-600', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-600'];
  const avatarColor = avatarColors[post.author_name.length % avatarColors.length];

  return (
    <>
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <div className="relative group h-full w-full max-w-full">
          {/* Decorative background blur for modern feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-[2rem] transform translate-y-2 scale-[0.95] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

          <Card
            className="relative flex flex-col h-full border-0 shadow-lg shadow-slate-200/50 dark:shadow-black/20 bg-white dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1 ring-1 ring-slate-100 dark:ring-slate-800 cursor-pointer"
            onClick={() => setShowPreviewDialog(true)}
          >
            <CardHeader className="p-4 flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Modern Avatar */}
                  <div className={`w-10 h-10 rounded-2xl ${avatarColor} flex items-center justify-center font-black text-sm tracking-tight shadow-sm flex-shrink-0`}>
                    {getInitials(post.author_name)}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h3 className="font-display font-bold text-sm leading-tight truncate group-hover:text-primary transition-colors pr-2">
                      {post.title}
                    </h3>
                    <div className="flex flex-col">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {post.author_name}
                      </p>
                      {(post.teacher_name || post.school_name) && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider truncate">
                          {post.teacher_name || post.school_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Badge className={`${categoryStyles[post.category]} border-0 px-2 py-0.5 mt-0.5 md:mt-1 rounded-lg capitalize font-bold shadow-sm shrink-0 text-[9px] sm:text-[10px]`}>
                  {categoryIcons[post.category]} <span className="ml-1 whitespace-nowrap">{categoryLabels[post.category]}</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col p-3 pt-0 md:p-5 md:pt-0 gap-3 md:gap-4">
              {/* Media Preview */}
              {(post.video_file || post.video_url || post.image_url) && (
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner group-hover:shadow-md transition-all">
                  {post.video_file ? (
                    <video
                      src={post.video_file}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : post.video_url ? (
                    (() => {
                      const embedUrl = getVideoEmbedUrl(post.video_url);
                      return embedUrl ? (
                        <div className="relative w-full h-full pointer-events-none overflow-hidden">
                          <iframe
                            src={embedUrl}
                            title={post.title}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                          <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                            <span className="text-2xl">🎥</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <img src={post.image_url!} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase text-white shadow-sm backdrop-blur-md ${post.status === 'published' ? 'bg-drawings/80' :
                      post.status === 'rejected' ? 'bg-red-500/80' : 'bg-amber-400/80'
                      }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {post.content}
              </p>

              <div className="mt-auto pt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span>🕒 Submitted {submittedDate}</span>
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-3 pt-0 md:p-5 md:pt-0 gap-2 flex-shrink-0 mt-auto flex-col sm:flex-row flex-wrap" onClick={(e) => e.stopPropagation()}>
              {/* Actions - Modernized Buttons */}
              {post.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject this submission?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject <strong>"{post.title}"</strong>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReject} className="bg-red-500">Reject</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="outline"
                    className="flex-1 w-full sm:w-auto rounded-lg h-9 text-sm font-medium border-red-100 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-200 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300 transition-all shadow-sm"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <X className="w-4 h-4 mr-1.5" /> Reject
                  </Button>

                  <ApproveDialog open={showApproveDialog} onOpenChange={setShowApproveDialog} post={post} onApprove={handleApprove} />

                  <Button
                    className="flex-1 w-full sm:w-auto rounded-lg h-9 text-sm font-medium bg-gradient-drawings text-white shadow-md shadow-drawings/20 transition-all hover:scale-[1.02] hover:brightness-110"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    <Check className="w-4 h-4 mr-1.5" /> Approve
                  </Button>
                </div>
              )}

              {post.status === 'rejected' && (
                <div className="flex gap-2 w-full">
                  {onRestore && (
                    <Button variant="ghost" onClick={() => setShowRestoreDialog(true)} className="flex-1 w-full rounded-xl text-slate-500 hover:bg-slate-100">
                      <RotateCcw className="w-4 h-4 mr-2" /> Restore
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" onClick={() => setShowDeleteDialog(true)} className="flex-1 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  )}
                </div>
              )}

              {post.status === 'published' && (
                <div className="flex gap-2 w-full">
                  <Button variant="secondary" className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium cursor-default">
                    Published <Check className="w-3 h-3 ml-2" />
                  </Button>

                  {onToggleFeature && (
                    <Button
                      variant="outline"
                      className={`rounded-xl border shadow-sm transition-all ${post.is_featured
                        ? 'bg-amber-100 border-amber-200 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400'
                        : 'border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200 dark:border-slate-700 dark:text-slate-400 dark:hover:text-amber-400'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFeatureDialog(true);
                      }}
                      title={post.is_featured ? "Remove from featured" : "Feature this post"}
                    >
                      {post.is_featured ? '★' : '☆'}
                    </Button>
                  )}

                  {onDelete && (
                    <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(true)} className="rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        <DialogContent
          noContentWrapper
          hideCloseButton
          className="max-w-[1100px] w-[95vw] h-[92vh] md:h-[80vh] p-0 border dark:border-white/10 rounded-2xl md:!rounded-2xl bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col z-[100] outline-none scrollbar-hide"
        >
          <div className="flex flex-col md:flex-row h-auto md:h-full overflow-visible md:overflow-hidden">
            {/* Left Column: Media & Branding - Responsive height */}
            <div className={cn(
              "relative w-full md:w-[45%] h-[400px] md:h-full shrink-0 overflow-hidden group/media",
              `bg-gradient-to-br ${getCategoryColor(post.category)}`
            )}>
              {/* Background Texture Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <Grid3x3 className="w-full h-full scale-150 rotate-12" />
              </div>

              {/* Status & Category Overlays */}
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                <Badge className={`${categoryStyles[post.category]} px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-white/20 shadow-xl backdrop-blur-md`}>
                  {categoryIcons[post.category]} {categoryLabels[post.category]}
                </Badge>
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10 w-fit",
                  post.status === 'published' ? 'bg-emerald-500/80 text-white' :
                    post.status === 'rejected' ? 'bg-rose-500/80 text-white' :
                      'bg-amber-400/80 text-slate-900'
                )}>
                  {post.status} Status
                </div>
              </div>

              {/* Close Button overlay for mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreviewDialog(false)}
                className="absolute top-6 right-6 z-20 md:hidden bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Media Container */}
              <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/5 group-hover/media:scale-[1.02] transition-transform duration-700">
                  {post.video_url || post.video_file ? (
                    <VideoPlayer src={post.video_file} url={post.video_url} />
                  ) : post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/40">
                      <Sparkles className="w-16 h-16 opacity-20" />
                      <span className="text-sm font-bold tracking-widest uppercase italic">The ZeeQue Masterpiece</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Detailed View */}
            <div className="flex-none md:flex-1 flex flex-col bg-slate-50/30 dark:bg-zinc-950/30 overflow-visible md:overflow-hidden">
              {/* Header */}
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
                  onClick={() => setShowPreviewDialog(false)}
                  className="hidden md:flex rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Scrollable Body - Unified on mobile */}
              <div className="flex-none md:flex-1 overflow-visible md:overflow-y-auto p-6 md:p-8 pt-0 space-y-8 scrollbar-elegant">
                {/* Author Info Card */}
                <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800/50 shadow-sm flex items-center gap-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg tracking-tighter shadow-inner", avatarColor)}>
                    {getInitials(post.author_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Author Identity</p>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">{post.author_name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5">
                      <School className="w-3 h-3 opacity-50" />
                      {post.teacher_name || post.school_name || "Independent Creator"}
                    </p>
                  </div>
                  <Badge variant="outline" className="hidden sm:flex border-slate-200 dark:border-zinc-800 rounded-lg py-1 px-3">
                    <User className="w-3 h-3 mr-1.5 opacity-50" /> {post.author_role || "Student"}
                  </Badge>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <FileText className="w-4 h-4 text-primary opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">The Narrative</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-2xl border border-slate-100 dark:border-zinc-800/50 relative">
                    <div className="absolute top-4 right-6 text-slate-100 dark:text-zinc-800 text-6xl font-serif pointer-events-none select-none">“</div>
                    <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                      {post.content}
                    </p>
                  </div>
                </div>

                {/* Footer Meta */}
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

              {/* Sticky Footer Actions - Professional Row */}
              <div className="p-6 md:p-8 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-slate-100 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center gap-3 shrink-0">
                {/* 1. Edit Action - Available for all since admins may need to fix typos */}
                {onEdit && (
                  <Button
                    variant="ghost"
                    className="w-full sm:h-12 px-6 py-3 rounded-[1.25rem] bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-bold transition-all sm:flex-1 border border-indigo-100/50 dark:border-indigo-500/20"
                    onClick={() => {
                      setShowPreviewDialog(false);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}

                {/* 2. Reject Action (Only for pending) */}
                {post.status === 'pending' && onReject && (
                  <Button
                    variant="ghost"
                    className="w-full sm:h-12 px-6 py-3 rounded-[1.25rem] bg-rose-50/50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 font-bold transition-all sm:flex-1 border border-rose-100/50 dark:border-rose-500/20"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <X className="w-4 h-4 mr-2 stroke-[3px]" /> Reject
                  </Button>
                )}

                {/* 3. Approve / Restore Action */}
                {post.status === 'pending' || post.status === 'rejected' ? (
                  <Button
                    className="w-full sm:h-12 px-8 py-3 rounded-[1.25rem] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all sm:flex-[1.5] border-b-4 border-emerald-700/30"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    <Check className="w-4 h-4 mr-2 stroke-[3px]" /> Approve & Publish
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full sm:h-12 rounded-[1.25rem] border-slate-200 dark:border-zinc-800 text-slate-500 font-bold sm:flex-[1.5] bg-slate-50/50 dark:bg-zinc-900/50"
                    disabled
                  >
                    <Check className="w-4 h-4 mr-2" /> Already Published
                  </Button>
                )}

                {/* 4. Delete Action */}
                {onDelete && (
                  <Button
                    variant="ghost"
                    className="w-full sm:h-12 px-6 py-3 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 font-bold transition-all sm:flex-1 border border-slate-200/50 dark:border-white/5"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Delete Confirmation Dialog - Works for all states */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete this post?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <span className="block text-base font-medium text-foreground">
                You are about to permanently delete "{post.title}".
              </span>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400">
                ⚠️ This action cannot be undone. The post will be permanently removed from the database.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 px-6 shadow-md shadow-red-500/20 transition-all hover:scale-[1.02]"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Post Dialog */}
      {onEdit && (
        <EditPostDialog
          post={post}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={onEdit}
        />
      )}

      {/* Feature Toggle Confirmation Dialog */}
      {onToggleFeature && (
        <AlertDialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
                {post.is_featured ? 'Remove from featured?' : 'Feature this post?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 pt-2">
                <span className="block text-base font-medium text-foreground">
                  {post.is_featured
                    ? `You are about to remove "${post.title}" from the featured section.`
                    : `You are about to feature "${post.title}" on the home page.`}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {post.is_featured
                    ? 'It will no longer appear in the main hero slider on the home page.'
                    : 'This will display the post prominently in the hero slider on the home page.'}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="rounded-xl h-11">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onToggleFeature(post.id, post.is_featured || false);
                  setShowFeatureDialog(false);
                }}
                className={`rounded-xl h-11 px-6 shadow-md transition-all hover:scale-[1.02] text-white ${post.is_featured ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
              >
                {post.is_featured ? 'Remove Featured' : 'Feature Post'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
