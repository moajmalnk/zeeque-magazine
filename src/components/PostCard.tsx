import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  index?: number;
}

const categoryStyles = {
  stories: 'bg-gradient-stories',
  poems: 'bg-gradient-poems',
  drawings: 'bg-gradient-drawings',
  news: 'bg-gradient-news',
};

export function PostCard({ post, index = 0 }: PostCardProps) {
  const formattedDate = post.publishedAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(post.publishedAt)
    : '';

  return (
    <Card
      className={cn(
        'group overflow-hidden border-0 shadow-card hover:shadow-hover transition-all duration-300',
        'hover:-translate-y-1 animate-slide-up',
        index > 0 && `animation-delay-${Math.min(index * 100, 500)}`
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {post.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-xs font-semibold px-3 py-1 rounded-full border-0',
              categoryStyles[post.category],
              'text-white shadow-soft'
            )}
          >
            <span className="mr-1">{categoryIcons[post.category]}</span>
            {categoryLabels[post.category]}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {formattedDate}
          </span>
        </div>
        
        <h3 className="font-display font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        
        <p className="text-sm text-muted-foreground font-medium">
          by <span className="text-primary">{post.authorName}</span>
        </p>
      </CardHeader>
      
      <CardContent>
        <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </CardContent>
    </Card>
  );
}
