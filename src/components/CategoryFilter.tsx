import { Category, categoryLabels, categoryIcons, Post } from '@/types/post';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMemo, useEffect } from 'react';

interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  posts: Post[];
}

const categoryVariants: Record<Category | 'all', string> = {
  all: 'bg-gradient-hero',
  stories: 'bg-gradient-stories',
  poems: 'bg-gradient-poems',
  drawings: 'bg-gradient-drawings',
  news: 'bg-gradient-news',
  video: 'bg-gradient-video',
  other: 'bg-gradient-other',
};

export function CategoryFilter({ selectedCategory, onCategoryChange, posts }: CategoryFilterProps) {
  // Calculate which categories have posts
  const availableCategories = useMemo(() => {
    // If no posts, return empty to hide everything
    if (posts.length === 0) return [];

    const categoryCounts = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<Category, number>);

    // Only include categories that have at least one post
    const available: (Category | 'all')[] = [];

    // Only add 'All Posts' if we have more than one category or if explicitely desired, 
    // but typically it's nice to always have it if we have any posts at all.
    // However, the user request "if there is no post then no need all post tab" implies 
    // we shouldn't show the filter bar at all if empty.
    available.push('all');

    const allCategories: Category[] = ['stories', 'poems', 'drawings', 'news', 'video', 'other'];
    allCategories.forEach(category => {
      if (categoryCounts[category] > 0) {
        available.push(category);
      }
    });

    // If we only have 'all' (meaning no specific categories found - shouldn't happen if posts > 0)
    // or just one category + all, maybe we still want to show it. 
    // But strictly following "no post -> no tab", the check at the top handles it.

    return available;
  }, [posts]);

  // If selected category has no posts, reset to 'all'
  useEffect(() => {
    if (selectedCategory !== 'all' && !availableCategories.includes(selectedCategory)) {
      onCategoryChange('all');
    }
  }, [selectedCategory, availableCategories, onCategoryChange]);

  return (
    <div className="flex flex-wrap gap-3 justify-center px-4">
      {availableCategories.map((category) => {
        const isSelected = selectedCategory === category;

        return (
          <Button
            key={category}
            onClick={() => onCategoryChange(category)}
            variant="outline"
            size="default"
            className={cn(
              'rounded-full font-medium transition-all duration-300 border-2 px-6 py-2.5',
              'hover:scale-[1.02] active:scale-[0.98]',
              isSelected
                ? cn(categoryVariants[category], 'text-white border-transparent shadow-card hover:shadow-hover')
                : 'bg-card hover:bg-muted/50 border-border/60 hover:border-primary/40'
            )}
          >
            {category === 'all' ? (
              <>
                <span className="mr-2 text-base">🌟</span>
                <span>All Posts</span>
              </>
            ) : (
              <>
                <span className="mr-2">{categoryIcons[category]}</span>
                <span>{categoryLabels[category]}</span>
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}
