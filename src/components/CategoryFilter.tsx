import { Category, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
}

const categories: (Category | 'all')[] = ['all', 'stories', 'poems', 'drawings', 'news'];

const categoryVariants: Record<Category | 'all', string> = {
  all: 'bg-gradient-hero',
  stories: 'bg-gradient-stories',
  poems: 'bg-gradient-poems',
  drawings: 'bg-gradient-drawings',
  news: 'bg-gradient-news',
};

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center px-4">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        
        return (
          <Button
            key={category}
            onClick={() => onCategoryChange(category)}
            variant="outline"
            size="default"
            className={cn(
              'rounded-full font-semibold transition-all duration-300 border-2 px-5 py-2.5',
              'hover:scale-105 active:scale-95',
              isSelected
                ? cn(categoryVariants[category], 'text-white border-transparent shadow-card hover:shadow-hover')
                : 'bg-background hover:bg-muted/50 border-border hover:border-primary/40 hover:shadow-soft'
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
