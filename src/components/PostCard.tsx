import { useState } from 'react';
import { Post, categoryLabels, categoryIcons } from '@/types/post';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X, Calendar, User, GraduationCap, School } from 'lucide-react';

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

// Avatar Initials Helper
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const avatarColors = ['bg-pink-100 text-pink-600', 'bg-violet-100 text-violet-600', 'bg-cyan-100 text-cyan-600', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-600'];

export function PostCard({ post, index = 0 }: PostCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedDate = post.published_at
    ? new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(post.published_at))
    : '';

  const avatarColor = avatarColors[post.author_name.length % avatarColors.length];

  return (
    <>
      <Card
        className={cn(
          'group overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.15)] transition-all duration-500',
          'hover:-translate-y-2 animate-slide-up bg-white dark:bg-slate-900/50 backdrop-blur-sm cursor-pointer',
          'rounded-[2rem] h-full flex flex-col',
          index > 0 && `animation-delay-${Math.min(index * 100, 500)}`
        )}
        style={{ animationDelay: `${index * 80}ms` }}
        onClick={() => setIsOpen(true)}
      >
        {post.video_file ? (
          <div className="relative h-56 overflow-hidden bg-black/5 border-b-2 border-slate-100 dark:border-slate-800">
            <video
              src={post.video_file}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md">
              Video
            </div>
          </div>
        ) : post.video_url ? (() => {
          const embedUrl = getVideoEmbedUrl(post.video_url);
          return embedUrl ? (
            <div className="relative h-56 overflow-hidden bg-black/5 border-b-2 border-slate-100 dark:border-slate-800">
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                <span className="text-4xl filter drop-shadow-lg">▶️</span>
              </div>
              <iframe
                src={embedUrl}
                title={post.title}
                className="w-full h-full pointer-events-none" // Disable interaction in card view
                tabIndex={-1}
              />
            </div>
          ) : (
            <div className="relative h-56 overflow-hidden bg-gradient-video flex items-center justify-center border-b-2 border-slate-100 dark:border-slate-800">
              <span className="text-white font-bold text-2xl flex items-center gap-2">
                Watch Video 🎥
              </span>
            </div>
          );
        })() : post.image_url ? (
          <div className="relative h-56 overflow-hidden border-b-2 border-slate-100 dark:border-slate-800">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </div>
        ) : (
          <div className={`relative h-56 overflow-hidden ${categoryStyles[post.category]} opacity-80 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-center`}>
            <span className="text-6xl filter drop-shadow-sm animate-pulse-slow">
              {categoryIcons[post.category]}
            </span>
          </div>
        )}

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
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
            </span>
          </div>

          <h3 className="font-display font-bold text-2xl leading-tight text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-2 mb-1">
            {post.title}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <div className={`w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center text-[10px] font-bold border border-white shadow-sm`}>
              {getInitials(post.author_name)}
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {post.author_name}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-3 flex-grow">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3 font-medium text-sm">
            {post.content}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <School className="w-3 h-3" /> {post.school_name || 'School'}
            </span>
            <span className="group-hover:text-primary transition-colors font-semibold">Read more →</span>
          </div>
        </CardContent>
      </Card>

      {/* Reader Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          hideCloseButton
          className="max-w-4xl w-[95vw] h-[90vh] p-0 border-0 rounded-[2rem] sm:rounded-[2.5rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col"
        >
          <DialogTitle className="sr-only">{post.title}</DialogTitle>
          <DialogDescription className="sr-only">Read {post.title} by {post.author_name}</DialogDescription>

          {/* Custom Header with Image/Video */}
          <div className="flex-1 overflow-y-auto scrollbar-hide relative">
            {/* Close Button Fixed - Always visible */}
            <button
              onClick={() => setIsOpen(false)}
              className="fixed top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors z-[60] ring-1 ring-white/20 shadow-lg"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full min-h-[40vh] md:min-h-[50vh] bg-slate-100 dark:bg-slate-950 overflow-hidden">
              {post.video_file ? (
                <video src={post.video_file} controls className="w-full h-full object-cover" />
              ) : post.video_url ? (() => {
                const embedUrl = getVideoEmbedUrl(post.video_url);
                return embedUrl ? (
                  <iframe src={embedUrl} title={post.title} className="w-full h-full min-h-[300px]" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gradient-video text-white">
                    <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="text-xl font-bold hover:underline">Watch Video on External Site ↗</a>
                  </div>
                )
              })() : post.image_url ? (
                <>
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-100" />
                </>
              ) : (
                <div className={`w-full h-full min-h-[300px] ${categoryStyles[post.category]} opacity-30 flex items-center justify-center`}>
                  <span className="text-9xl opacity-20">{categoryIcons[post.category]}</span>
                </div>
              )}

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 pt-20 md:pt-32 flex flex-col justify-end">
                <div className="animate-slide-up bg-black/20 backdrop-blur-sm self-start px-3 py-1 rounded-full mb-3 md:mb-4 border border-white/10">
                  <Badge variant="secondary" className={`bg-transparent text-white border-0 p-0 text-xs md:text-sm font-bold shadow-none`}>
                    {categoryIcons[post.category]} <span className="ml-1.5">{categoryLabels[post.category]}</span>
                  </Badge>
                </div>

                <h2 className="font-display font-bold text-2xl sm:text-4xl md:text-6xl text-foreground leading-tight tracking-tight mb-3 md:mb-5 drop-shadow-sm line-clamp-3">
                  {post.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-base font-medium text-muted-foreground/90 bg-background/30 backdrop-blur-md p-2 rounded-xl border border-white/5 inline-flex self-start">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${avatarColor} flex items-center justify-center text-[10px] md:text-xs font-bold ring-2 ring-background`}>
                      {getInitials(post.author_name)}
                    </div>
                    <span className="text-foreground font-semibold">{post.author_name}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    {formattedDate}
                  </div>
                  {(post.teacher_name || post.school_name) && (
                    <>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/50" />
                      <div className="hidden sm:flex items-center gap-1.5">
                        <School className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="truncate max-w-[150px]">{post.school_name || post.teacher_name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="px-6 md:px-10 lg:px-16 py-8 md:py-12 max-w-4xl mx-auto">
              <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none leading-relaxed text-foreground/90 font-serif whitespace-pre-line first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:mt-[-8px] first-letter:text-primary">
                {post.content}
              </div>

              <div className="mt-16 pt-8 border-t flex flex-col items-center justify-center text-center gap-4">
                <span className="inline-block p-4 rounded-full bg-primary/5 text-3xl">
                  {categoryIcons[post.category] || '✨'}
                </span>
                <p className="text-muted-foreground italic font-medium">
                  "Creativity takes courage." — Henri Matisse
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
