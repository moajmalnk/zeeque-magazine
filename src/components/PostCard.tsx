import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Helper function to convert video URLs to embed format
function getVideoEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop();
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
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
  stories: 'bg-gradient-stories',
  poems: 'bg-gradient-poems',
  drawings: 'bg-gradient-drawings',
  news: 'bg-gradient-news',
  video: 'bg-gradient-video',
  other: 'bg-gradient-other',
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
        'group overflow-hidden border border-border/60 shadow-sm hover:shadow-card transition-all duration-300',
        'hover:-translate-y-1 animate-slide-up',
        'bg-card',
        index > 0 && `animation-delay-${Math.min(index * 100, 500)}`
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {post.videoUrl ? (() => {
        const embedUrl = getVideoEmbedUrl(post.videoUrl);
        return embedUrl ? (
          <div className="relative h-48 overflow-hidden bg-black/5 rounded-t-xl">
            <iframe
              src={embedUrl}
              title={post.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative h-48 overflow-hidden bg-gradient-video flex items-center justify-center">
            <a
              href={post.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold hover:underline"
            >
              Watch Video 🎥
            </a>
          </div>
        );
      })() : post.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : null}
      
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
