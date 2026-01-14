import { useState } from 'react';
import { Post, categoryLabels, categoryIcons, PostStatus } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Check, X, RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PostsTableProps {
  posts: Post[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete: (id: string) => void;
  showStatus?: boolean;
}

const categoryStyles: Record<string, string> = {
  stories: 'bg-stories/20 text-stories border-stories/30',
  poems: 'bg-poems/20 text-poems border-poems/30',
  drawings: 'bg-drawings/20 text-drawings border-drawings/30',
  news: 'bg-news/20 text-news border-news/30',
};

const statusStyles: Record<PostStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  published: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const statusLabels: Record<PostStatus, string> = {
  pending: '⏳ Pending',
  published: '✅ Published',
  rejected: '❌ Rejected',
};

export function PostsTable({
  posts,
  onApprove,
  onReject,
  onRestore,
  onDelete,
  showStatus = false,
}: PostsTableProps) {
  const [actionState, setActionState] = useState<{
    type: 'approve' | 'reject' | 'restore' | null;
    postId: string | null;
    postTitle: string | null;
    authorName: string | null;
  }>({
    type: null,
    postId: null,
    postTitle: null,
    authorName: null,
  });
  const [previewDialogState, setPreviewDialogState] = useState<{
    open: boolean;
    postId: string | null;
  }>({
    open: false,
    postId: null,
  });

  const handleActionClick = (
    type: 'approve' | 'reject' | 'restore',
    postId: string,
    postTitle: string,
    authorName: string
  ) => {
    setActionState({ type, postId, postTitle, authorName });
  };

  const handleConfirmAction = () => {
    if (!actionState.postId || !actionState.type) return;

    switch (actionState.type) {
      case 'approve':
        onApprove?.(actionState.postId);
        break;
      case 'reject':
        onReject?.(actionState.postId);
        break;
      case 'restore':
        onRestore?.(actionState.postId);
        break;
    }

    setActionState({ type: null, postId: null, postTitle: null, authorName: null });
    setPreviewDialogState({ open: false, postId: null });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No posts to display</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Author</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            {showStatus && <TableHead className="font-semibold">Status</TableHead>}
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map(post => (
            <Dialog
              key={post.id}
              open={previewDialogState.open && previewDialogState.postId === post.id}
              onOpenChange={(open) =>
                setPreviewDialogState({ open, postId: open ? post.id : null })
              }
            >
              <TableRow
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => setPreviewDialogState({ open: true, postId: post.id })}
              >
                <TableCell className="font-medium max-w-[200px] truncate">
                  {post.title}
                </TableCell>
                <TableCell>{post.authorName}</TableCell>
                <TableCell>
                  <Badge className={`${categoryStyles[post.category]} border text-xs`}>
                    {categoryIcons[post.category]} {categoryLabels[post.category]}
                  </Badge>
                </TableCell>
                {showStatus && (
                  <TableCell>
                    <Badge className={`${statusStyles[post.status]} border text-xs`}>
                      {statusLabels[post.status]}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground text-sm">
                  {format(post.publishedAt || post.createdAt, 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {onApprove && post.status !== 'published' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleActionClick('approve', post.id, post.title, post.authorName)}
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {onReject && post.status !== 'rejected' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleActionClick('reject', post.id, post.title, post.authorName)}
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {onRestore && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => handleActionClick('restore', post.id, post.title, post.authorName)}
                        title="Move to Pending"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="sm:max-w-md">
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
                            onClick={() => onDelete(post.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
            </TableRow>
            
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">{post.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${categoryStyles[post.category]} border`}>
                    {categoryIcons[post.category]} {categoryLabels[post.category]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    by {post.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {format(post.publishedAt || post.createdAt, 'MMM d, yyyy')}
                  </span>
                  {showStatus && (
                    <Badge className={`${statusStyles[post.status]} border text-xs w-full sm:w-auto`}>
                      {statusLabels[post.status]}
                    </Badge>
                  )}
                </div>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full rounded-xl"
                  />
                )}
                <p className="text-foreground whitespace-pre-line leading-relaxed">{post.content}</p>
                
                {/* Action Buttons in Preview */}
                {(onApprove || onReject || onRestore) && (
                  <div className="flex gap-3 pt-4 border-t">
                    {onApprove && post.status !== 'published' && (
                      <Button
                        size="default"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleActionClick('approve', post.id, post.title, post.authorName)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {onReject && post.status !== 'rejected' && (
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        onClick={() => handleActionClick('reject', post.id, post.title, post.authorName)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    )}
                    {onRestore && (
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1"
                        onClick={() => handleActionClick('restore', post.id, post.title, post.authorName)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={actionState.type === 'approve'}
        onOpenChange={(open) => !open && setActionState({ type: null, postId: null, postTitle: null, authorName: null })}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Approve and publish this post?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to approve <strong>"{actionState.postTitle}"</strong> by {actionState.authorName}?
              </p>
              <p className="text-xs text-muted-foreground">
                This post will be published and visible to all readers in the magazine.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve & Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={actionState.type === 'reject'}
        onOpenChange={(open) => !open && setActionState({ type: null, postId: null, postTitle: null, authorName: null })}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this post?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to reject <strong>"{actionState.postTitle}"</strong> by {actionState.authorName}?
              </p>
              <p className="text-xs text-muted-foreground">
                The post will be moved to the rejected list. You can restore it later if needed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={actionState.type === 'restore'}
        onOpenChange={(open) => !open && setActionState({ type: null, postId: null, postTitle: null, authorName: null })}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Move to pending review?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to move <strong>"{actionState.postTitle}"</strong> by {actionState.authorName} back to pending review?
              </p>
              <p className="text-xs text-muted-foreground">
                The post will be moved to the pending list for review.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className="bg-primary hover:bg-primary/90"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Move to Pending
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
