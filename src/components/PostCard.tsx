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
  const formattedDate = post.published_at
    ? new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(post.published_at))
    : '';

  return (
    <Card
      className={cn(
        'group overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.1)] transition-all duration-300',
        'hover:-translate-y-2 animate-slide-up bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm',
        'rounded-[2rem] h-full flex flex-col', // Added h-full flex flex-col
        index > 0 && `animation-delay-${Math.min(index * 100, 500)}`
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {post.video_file ? (
        <div className="relative h-56 overflow-hidden bg-black/5 border-b-2 border-slate-100">
          <video
            src={post.video_file}
            controls
            className="w-full h-full object-contain"
          />
        </div>
      ) : post.video_url ? (() => {
        const embedUrl = getVideoEmbedUrl(post.video_url);
        return embedUrl ? (
          <div className="relative h-56 overflow-hidden bg-black/5 border-b-2 border-slate-100">
            <iframe
              src={embedUrl}
              title={post.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative h-56 overflow-hidden bg-gradient-video flex items-center justify-center border-b-2 border-slate-100">
            <a
              href={post.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <span>Watch Video</span> 🎥
            </a>
          </div>
        );
      })() : post.image_url ? (
        <div className="relative h-56 overflow-hidden border-b-2 border-slate-100">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
      ) : null}

      <CardHeader className="p-6 pb-2 flex-grow-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant="secondary"
            className={cn(
              'text-xs font-bold px-3 py-1.5 rounded-full border-0',
              categoryStyles[post.category],
              'text-white shadow-sm group-hover:scale-105 transition-transform'
            )}
          >
            <span className="mr-1.5 text-sm">{categoryIcons[post.category]}</span>
            {categoryLabels[post.category]}
          </Badge>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {formattedDate}
          </span>
        </div>

        <h3 className="font-display font-bold text-2xl leading-tight text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-2 mb-1">
          {post.title}
        </h3>

        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          by <span className="text-primary">{post.author_name}</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Teacher: {post.teacher_name || 'N/A'} <br />
          School: {post.school_name || 'N/A'}
        </p>
      </CardHeader>

      <CardContent className="p-6 pt-2 flex-grow">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3 font-medium">
          {post.content}
        </p>
      </CardContent>
    </Card>
  );
}
