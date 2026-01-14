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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-4 animate-bounce-gentle">
          <Sparkles className="w-10 h-10 text-accent" />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Be the first to share something wonderful with us! Your creativity is waiting to be discovered.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
