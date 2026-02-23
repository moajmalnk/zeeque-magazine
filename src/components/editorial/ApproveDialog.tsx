import { useState } from 'react';
import { Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  onApprove: (featured: boolean) => void;
}

export function ApproveDialog({ open, onOpenChange, post, onApprove }: ApproveDialogProps) {
  const [isFeatured, setIsFeatured] = useState(false);

  const handleApprove = () => {
    onApprove(isFeatured);
    onOpenChange(false);
    setIsFeatured(false); // Reset for next use
  };

  const handleCancel = () => {
    onOpenChange(false);
    setIsFeatured(false); // Reset on cancel
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md z-[200]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">
            Approve and Publish Submission
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve this post?
          </AlertDialogDescription>

          <div className="space-y-3 pt-2 text-left">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                "{post.title}" by {post.author_name}
              </p>
              <p className="text-xs text-muted-foreground">
                This submission will be published and visible to all readers in the magazine.
              </p>
            </div>

            {/* Featured Toggle */}
            <div className="pt-4 pb-2 border-t border-border/60">
              <label htmlFor="featured-toggle" className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 border border-border/60 cursor-pointer hover:bg-muted/70 transition-colors">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isFeatured ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Star className={cn(
                      "w-5 h-5 transition-colors",
                      isFeatured ? "text-primary fill-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-semibold text-foreground">
                      Feature this post
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Featured posts will be highlighted prominently on the home page
                    </p>
                  </div>
                </div>
                <Switch
                  id="featured-toggle"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                  className="shrink-0"
                />
              </label>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            className="bg-gradient-drawings hover:brightness-110 text-white border-0 shadow-md shadow-drawings/20 transition-all focus:ring-drawings hover:scale-[1.02]"
          >
            <Check className="w-4 h-4 mr-2" />
            {isFeatured ? 'Approve & Feature' : 'Approve & Publish'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
