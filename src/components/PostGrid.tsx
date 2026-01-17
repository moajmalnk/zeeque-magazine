import { Post } from '@/types/post';
import { PostCard } from './PostCard';
import { Sparkles } from 'lucide-react';

interface PostGridProps {
  posts: Post[];
  emptyMessage?: string;
}

export function PostGrid({ posts, emptyMessage = "No posts yet!" }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-24 text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 animate-bounce-gentle shadow-card">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
          {emptyMessage}
        </h3>
        <p className="text-muted-foreground max-w-md text-base leading-relaxed">
          Be the first to share something wonderful with us! Your creativity is waiting to be discovered.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
