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
    const categoryCounts = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<Category, number>);

    // Always include 'all', and only include categories that have at least one post
    const available: (Category | 'all')[] = ['all'];
    
    const allCategories: Category[] = ['stories', 'poems', 'drawings', 'news', 'video', 'other'];
    allCategories.forEach(category => {
      if (categoryCounts[category] > 0) {
        available.push(category);
      }
    });

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
