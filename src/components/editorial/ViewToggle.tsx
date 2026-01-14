import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-3 gap-2',
          view === 'grid'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onViewChange('grid')}
        title="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Grid</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-3 gap-2',
          view === 'list'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => onViewChange('list')}
        title="List view"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">List</span>
      </Button>
    </div>
  );
}
