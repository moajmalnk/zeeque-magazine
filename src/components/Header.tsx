import { Link, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { PenLine, BookOpen, FileText, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-soft group-hover:shadow-card transition-shadow">
            <span className="text-xl">✨</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl text-foreground leading-tight">
              ZeeQue
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">
              Webzine
            </span>
          </div>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Button
            asChild
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
          >
            <Link to="/">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Read</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant={location.pathname === '/submit' ? 'hero' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <Link to="/submit">
              <PenLine className="w-4 h-4" />
              <span className="hidden sm:inline">Share Your Work</span>
              <span className="sm:hidden">Share</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant={location.pathname === '/editorial' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2"
          >
            <Link to="/editorial">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Editorial</span>
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
