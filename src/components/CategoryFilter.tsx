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
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        
        return (
          <Button
            key={category}
            onClick={() => onCategoryChange(category)}
            variant="outline"
            size="sm"
            className={cn(
              'rounded-full font-semibold transition-all duration-200 border-2',
              isSelected
                ? cn(categoryVariants[category], 'text-white border-transparent shadow-card')
                : 'bg-background hover:bg-muted border-border hover:border-primary/30'
            )}
          >
            {category === 'all' ? (
              <>
                <span className="mr-1">🌟</span>
                All Posts
              </>
            ) : (
              <>
                <span className="mr-1">{categoryIcons[category]}</span>
                {categoryLabels[category]}
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}
