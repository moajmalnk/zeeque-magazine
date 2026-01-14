import { useState } from 'react';
import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
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

interface ReviewCardProps {
  post: Post;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const categoryStyles: Record<string, string> = {
  stories: 'bg-stories/20 text-stories border-stories/30',
  poems: 'bg-poems/20 text-poems border-poems/30',
  drawings: 'bg-drawings/20 text-drawings border-drawings/30',
  news: 'bg-news/20 text-news border-news/30',
};

export function ReviewCard({ post, onApprove, onReject }: ReviewCardProps) {
  const submittedDate = format(post.createdAt, 'MMM d, yyyy');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const handleApprove = () => {
    onApprove(post.id);
    setShowApproveDialog(false);
    setShowPreviewDialog(false);
  };

  const handleReject = () => {
    onReject(post.id);
    setShowRejectDialog(false);
    setShowPreviewDialog(false);
  };

  return (
    <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
      <Card 
        className="overflow-hidden border-2 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
        onClick={() => setShowPreviewDialog(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg leading-tight">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                by <span className="font-medium text-foreground">{post.authorName}</span>
              </p>
            </div>
            <Badge className={`${categoryStyles[post.category]} border shrink-0`}>
              {categoryIcons[post.category]} {categoryLabels[post.category]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Submitted {submittedDate}
          </p>
        </CardHeader>

        <CardContent className="pb-3">
          {post.imageUrl && (
            <div className="mb-3 rounded-xl overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-32 object-cover"
              />
            </div>
          )}
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
            {post.content}
          </p>
        </CardContent>

        <CardFooter className="pt-3 border-t gap-2" onClick={(e) => e.stopPropagation()}>
          {post.status === 'pending' && (
            <>
              <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent className="sm:max-w-md">
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

        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Approve and publish this submission?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Are you sure you want to approve <strong>"{post.title}"</strong> by {post.authorName}?
                </p>
                <p className="text-xs text-muted-foreground">
                  This submission will be published and visible to all readers in the magazine.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve & Publish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
          {post.status === 'rejected' && onApprove && (
            <>
              <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve and publish this post?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        Are you sure you want to approve <strong>"{post.title}"</strong> by {post.authorName}?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This post will be published and visible to all readers in the magazine.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApprove}
                      className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve & Publish
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
          {post.status === 'published' && onReject && (
            <>
              <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent className="sm:max-w-md">
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
        </CardFooter>
    </Card>
    
    <DialogContent className="max-w-lg">
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
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full rounded-xl"
          />
        )}
        <p className="text-foreground whitespace-pre-line leading-relaxed">{post.content}</p>
        
        {/* Action Buttons in Preview */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            size="default"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            onClick={() => setShowRejectDialog(true)}
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            size="default"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setShowApproveDialog(true)}
          >
            <Check className="w-4 h-4 mr-2" />
            Approve & Publish
          </Button>
        </div>
      </div>
    </DialogContent>
    </Dialog>
  );
}
