import { useState } from 'react';
import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, RotateCcw, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
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
  stories: 'bg-stories/20 text-stories border-stories/30',
  poems: 'bg-poems/20 text-poems border-poems/30',
  drawings: 'bg-drawings/20 text-drawings border-drawings/30',
  news: 'bg-news/20 text-news border-news/30',
  video: 'bg-video/20 text-video border-video/30',
  other: 'bg-other/20 text-other border-other/30',
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
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
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
            className="relative flex flex-col h-full border-0 shadow-lg shadow-slate-200/50 dark:shadow-black/20 bg-white dark:bg-slate-900/90 backdrop-blur-sm rounded-[2rem] overflow-hidden transition-all duration-300 group-hover:-translate-y-1 ring-1 ring-slate-100 dark:ring-slate-800 cursor-pointer"
            onClick={() => setShowPreviewDialog(true)}
          >
            <CardHeader className="p-3 md:p-5 flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Modern Avatar */}
                  <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${avatarColor} flex items-center justify-center font-black text-xs md:text-sm tracking-tighter shadow-sm rotate-3 flex-shrink-0 mt-0.5 md:mt-1`}>
                    {getInitials(post.author_name)}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h3 className="font-display font-bold text-sm md:text-lg leading-tight truncate group-hover:text-primary transition-colors pr-2">
                      {post.title}
                    </h3>
                    <div className="flex flex-col">
                      <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                        {post.author_name}
                      </p>
                      {(post.teacher_name || post.school_name) && (
                        <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider truncate">
                          {post.teacher_name || post.school_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Badge className={`${categoryStyles[post.category]} border-0 px-2 py-0.5 md:px-2.5 md:py-1 mt-0.5 md:mt-1 rounded-lg md:rounded-xl capitalize font-bold shadow-sm shrink-0 text-[10px] md:text-sm`}>
                  {categoryIcons[post.category]} <span className="ml-1 hidden xs:inline">{categoryLabels[post.category]}</span>
                  <span className="ml-1 xs:hidden">{categoryLabels[post.category].slice(0, 3)}..</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col p-3 pt-0 md:p-5 md:pt-0 gap-3 md:gap-4">
              {/* Media Preview */}
              {(post.video_file || post.video_url || post.image_url) && (
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner group-hover:shadow-md transition-all">
                  {post.video_file ? (
                    <video src={post.video_file} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  ) : post.video_url ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                      <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                        <span className="text-2xl">🎥</span>
                      </div>
                    </div>
                  ) : (
                    <img src={post.image_url!} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase text-white shadow-sm backdrop-blur-md ${post.status === 'published' ? 'bg-green-500/80' :
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
                    className="flex-1 w-full sm:w-auto rounded-xl h-10 border-red-100 text-red-600 bg-red-50/50 hover:bg-red-100 hover:text-red-700 hover:border-red-200 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300 transition-all shadow-sm"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <X className="w-4 h-4 mr-1.5" /> Reject
                  </Button>

                  <ApproveDialog open={showApproveDialog} onOpenChange={setShowApproveDialog} post={post} onApprove={handleApprove} />

                  <Button
                    className="flex-1 w-full sm:w-auto rounded-xl h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
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

        <DialogContent className="max-w-2xl rounded-[2rem] p-6 shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sm:rounded-[2.5rem]">
          <DialogHeader className="text-left pr-8">
            <DialogTitle className="font-display text-lg sm:text-xl md:text-2xl leading-tight">{post.title}</DialogTitle>
            <div className="sr-only">
              <DialogDescription>
                Preview of the post details and content
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${categoryStyles[post.category]} border px-1.5 py-0.5 text-[10px] sm:text-xs rounded-md shadow-sm`}>
                  {categoryIcons[post.category]} {categoryLabels[post.category]}
                </Badge>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  by <span className="font-medium text-foreground">{post.author_name}</span>
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground sm:ml-auto font-medium">
                Submitted {submittedDate}
              </span>
            </div>
            {post.video_url ? (() => {
              // Helper to convert video URLs to embed format
              const getVideoEmbedUrl = (url: string): string | null => {
                try {
                  const urlObj = new URL(url);
                  if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                    const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
                    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
                  }
                  if (urlObj.hostname.includes('vimeo.com')) {
                    const videoId = urlObj.pathname.split('/').pop();
                    if (videoId) return `https://player.vimeo.com/video/${videoId}`;
                  }
                  return url;
                } catch {
                  return null;
                }
              };
              const embedUrl = getVideoEmbedUrl(post.video_url);
              return embedUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/5">
                  <iframe
                    src={embedUrl}
                    title={post.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={post.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gradient-video text-white rounded-xl text-center font-semibold hover:opacity-90"
                >
                  Watch Video 🎥
                </a>
              );
            })() : post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full rounded-xl"
              />
            ) : null}
            <p className="text-foreground whitespace-pre-line leading-relaxed">{post.content}</p>

            {/* Action Buttons in Preview */}
            <div className="flex gap-3 pt-4 border-t flex-wrap">
              {post.status === 'pending' && (
                <>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="default"
                      className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                      onClick={() => {
                        setShowPreviewDialog(false);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      variant="outline"
                      size="default"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  {onApprove && (
                    <Button
                      size="default"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => setShowApproveDialog(true)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve & Publish
                    </Button>
                  )}
                  {onDelete && (
                    <>

                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </>
              )}
              {post.status === 'published' && (
                <>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="default"
                      className="flex-1 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                      onClick={() => {
                        setShowPreviewDialog(false);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      variant="outline"
                      size="default"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                  {onRestore && (
                    <>
                      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Move to pending review?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <span className="block">
                                Are you sure you want to move <strong>"{post.title}"</strong> by {post.author_name} back to pending review?
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                The post will be moved to the pending list for review.
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleRestore}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Move to Pending
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1"
                        onClick={() => setShowRestoreDialog(true)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                    </>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="default"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </>
              )}
              {post.status === 'rejected' && (
                <>
                  {onApprove && (
                    <Button
                      size="default"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => setShowApproveDialog(true)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve & Publish
                    </Button>
                  )}
                  {onRestore && (
                    <>
                      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Move to pending review?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <span className="block">
                                Are you sure you want to move <strong>"{post.title}"</strong> by {post.author_name} back to pending review?
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                The post will be moved to the pending list for review.
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleRestore}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Move to Pending
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1"
                        onClick={() => setShowRestoreDialog(true)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                    </>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="default"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </>
              )}
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
