import { Link, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { PenLine, BookOpen, FileText, Moon, Sun, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="container flex h-20 md:h-24 items-center justify-between">
        <Link to="/" className="flex items-center group transition-opacity hover:opacity-80 duration-300">
          {!logoError && mounted ? (
            <img 
              src={theme === 'dark' ? '/favicon-dark.png' : '/favicon-light.png'} 
              alt="ZeeQue Logo" 
              className="h-16 md:h-20 w-auto object-contain transition-all duration-300"
              onError={() => setLogoError(true)}
            />
          ) : null}
        </Link>
        
        <nav className="flex items-center gap-2 md:gap-3">
          <Button
            asChild
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2 rounded-full font-medium transition-all duration-200"
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
            className="gap-2 rounded-full font-medium transition-all duration-200 border-2"
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
            className="gap-2 rounded-full font-medium transition-all duration-200"
          >
            <Link to="/editorial">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Editorial</span>
            </Link>
          </Button>
          
          <Button
            asChild
            variant={location.pathname === '/guidelines' ? 'default' : 'ghost'}
            size="sm"
            className="gap-2 rounded-full font-medium transition-all duration-200"
          >
            <Link to="/guidelines">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Guidelines</span>
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-muted"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-4 w-4 transition-transform duration-300" />
              ) : (
                <Moon className="h-4 w-4 transition-transform duration-300" />
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
