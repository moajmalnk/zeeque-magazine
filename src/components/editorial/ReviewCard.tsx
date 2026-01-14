import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

  return (
    <Card className="overflow-hidden border-2 border-border/50 hover:border-primary/30 transition-colors">
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

      <CardFooter className="pt-3 border-t gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </DialogTrigger>
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
              </div>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full rounded-xl"
                />
              )}
              <p className="text-foreground whitespace-pre-line">{post.content}</p>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onReject(post.id)}
        >
          <X className="w-4 h-4 mr-1" />
          Reject
        </Button>

        <Button
          size="sm"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => onApprove(post.id)}
        >
          <Check className="w-4 h-4 mr-1" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}
