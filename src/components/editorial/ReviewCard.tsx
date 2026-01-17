import { useState } from 'react';
import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
}

const categoryStyles: Record<string, string> = {
  stories: 'bg-stories/20 text-stories border-stories/30',
  poems: 'bg-poems/20 text-poems border-poems/30',
  drawings: 'bg-drawings/20 text-drawings border-drawings/30',
  news: 'bg-news/20 text-news border-news/30',
  video: 'bg-video/20 text-video border-video/30',
  other: 'bg-other/20 text-other border-other/30',
};

export function ReviewCard({ post, onApprove, onReject, onRestore, onDelete, onEdit }: ReviewCardProps) {
  const submittedDate = format(post.createdAt, 'MMM d, yyyy');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  return (
    <>
    <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
      <Card 
        className="flex flex-col h-full overflow-hidden border-2 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
        onClick={() => setShowPreviewDialog(true)}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg leading-tight">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                by <span className="font-medium text-foreground">{post.authorName}</span>
              </p>
              {(post.teacherName || post.schoolName) && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {post.teacherName && (
                    <p>Teacher: <span className="font-medium text-foreground">{post.teacherName}</span></p>
                  )}
                  {post.schoolName && (
                    <p>School: <span className="font-medium text-foreground">{post.schoolName}</span></p>
                  )}
                </div>
              )}
            </div>
            <Badge className={`${categoryStyles[post.category]} border shrink-0`}>
              {categoryIcons[post.category]} {categoryLabels[post.category]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Submitted {submittedDate}
          </p>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col pb-3">
          {post.videoUrl ? (() => {
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
            const embedUrl = getVideoEmbedUrl(post.videoUrl);
            return embedUrl ? (
              <div className="mb-3 rounded-xl overflow-hidden aspect-video bg-black/5 flex-shrink-0">
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
                href={post.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-3 p-3 bg-gradient-video text-white rounded-xl text-center text-sm font-semibold hover:opacity-90 flex-shrink-0"
              >
                Watch Video 🎥
              </a>
            );
          })() : post.imageUrl ? (
            <div className="mb-3 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-32 object-cover"
              />
            </div>
          ) : null}
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line flex-grow">
            {post.content}
          </p>
        </CardContent>

        <CardFooter className="pt-3 border-t gap-2 flex-shrink-0 mt-auto" onClick={(e) => e.stopPropagation()}>
          {post.status === 'pending' && (
            <>
              <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this submission?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Are you sure you want to reject <strong>"{post.title}"</strong> by {post.authorName}?
                </p>
                <p className="text-xs text-muted-foreground">
                  The submission will be moved to the rejected list. You can restore it later if needed.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => setShowRejectDialog(true)}
        >
          <X className="w-4 h-4 mr-1" />
          Reject
        </Button>

        <ApproveDialog
          open={showApproveDialog}
          onOpenChange={setShowApproveDialog}
          post={post}
          onApprove={handleApprove}
        />

        <Button
          size="sm"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => setShowApproveDialog(true)}
        >
          <Check className="w-4 h-4 mr-1" />
          Approve
        </Button>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditDialog(true);
            }}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        {onDelete && (
          <>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Are you sure you want to permanently delete <strong>"{post.title}"</strong> by {post.authorName}?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This action cannot be undone. The post will be permanently removed from the system.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </>
        )}
            </>
          )}
          {post.status === 'rejected' && (
            <>
              {onApprove && (
                <>
                  <ApproveDialog
                    open={showApproveDialog}
                    onOpenChange={setShowApproveDialog}
                    post={post}
                    onApprove={handleApprove}
                  />
                  <Button
                    size="sm"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </>
              )}
              {onRestore && (
                <>
                  <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Move to pending review?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Are you sure you want to move <strong>"{post.title}"</strong> by {post.authorName} back to pending review?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            The post will be moved to the pending list for review.
                          </p>
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
                    size="sm"
                    className="flex-1 hover:bg-muted"
                    onClick={() => setShowRestoreDialog(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restore
                  </Button>
                </>
              )}
              {onDelete && (
                <>
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Are you sure you want to permanently delete <strong>"{post.title}"</strong> by {post.authorName}?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            This action cannot be undone. The post will be permanently removed from the system.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
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
                  size="sm"
                  className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              {onReject && (
                <>
                  <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject this post?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Are you sure you want to reject <strong>"{post.title}"</strong> by {post.authorName}?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            The post will be moved to the rejected list. You can restore it later if needed.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReject}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              {onRestore && (
                <>
                  <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Move to pending review?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Are you sure you want to move <strong>"{post.title}"</strong> by {post.authorName} back to pending review?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            The post will be moved to the pending list for review.
                          </p>
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
                    size="sm"
                    className="flex-1 hover:bg-muted"
                    onClick={() => setShowRestoreDialog(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restore
                  </Button>
                </>
              )}
              {onDelete && (
                <>
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Are you sure you want to permanently delete <strong>"{post.title}"</strong> by {post.authorName}?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            This action cannot be undone. The post will be permanently removed from the system.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </>
          )}
        </CardFooter>
    </Card>
    
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-display">{post.title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={`${categoryStyles[post.category]} border`}>
            {categoryIcons[post.category]} {categoryLabels[post.category]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            by {post.authorName}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            Submitted {submittedDate}
          </span>
        </div>
        {post.videoUrl ? (() => {
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
          const embedUrl = getVideoEmbedUrl(post.videoUrl);
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
              href={post.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-gradient-video text-white rounded-xl text-center font-semibold hover:opacity-90"
            >
              Watch Video 🎥
            </a>
          );
        })() : post.imageUrl ? (
          <img
            src={post.imageUrl}
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
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Are you sure you want to permanently delete <strong>"{post.title}"</strong> by {post.authorName}?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            This action cannot be undone. The post will be permanently removed from the system.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
                          <p>
                            Are you sure you want to move <strong>"{post.title}"</strong> by {post.authorName} back to pending review?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            The post will be moved to the pending list for review.
                          </p>
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
                          <p>
                            Are you sure you want to move <strong>"{post.title}"</strong> by {post.authorName} back to pending review?
                          </p>
                          <p className="text-xs text-muted-foreground">
                            The post will be moved to the pending list for review.
                          </p>
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

    {/* Edit Post Dialog */}
    {onEdit && (
      <EditPostDialog
        post={post}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={onEdit}
      />
    )}
  </>
  );
}
