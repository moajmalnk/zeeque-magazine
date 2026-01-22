import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { PenLine, BookOpen, FileText, Moon, Sun, HelpCircle, LogIn, Users, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, role, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMobileOpen(false);
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Button
        asChild
        variant={location.pathname === '/' ? 'default' : 'ghost'}
        size={mobile ? 'lg' : 'sm'}
        className={`${mobile ? 'w-full justify-start' : ''} gap-2 rounded-full font-medium transition-all duration-200`}
        onClick={() => setMobileOpen(false)}
      >
        <Link to="/">
          <BookOpen className="w-4 h-4" />
          <span>Read</span>
        </Link>
      </Button>

      <Button
        asChild
        variant={location.pathname === '/submit' ? 'hero' : 'outline'}
        size={mobile ? 'lg' : 'sm'}
        className={`${mobile ? 'w-full justify-start' : 'border-2'} gap-2 rounded-full font-medium transition-all duration-200`}
        onClick={() => setMobileOpen(false)}
      >
        <Link to="/submit">
          <PenLine className="w-4 h-4" />
          <span>Share Your Work</span>
        </Link>
      </Button>

      <Button
        asChild
        variant={location.pathname === '/guidelines' ? 'default' : 'ghost'}
        size={mobile ? 'lg' : 'sm'}
        className={`${mobile ? 'w-full justify-start' : ''} gap-2 rounded-full font-medium transition-all duration-200`}
        onClick={() => setMobileOpen(false)}
      >
        <Link to="/guidelines">
          <HelpCircle className="w-4 h-4" />
          <span>Guidelines</span>
        </Link>
      </Button>

      {isAuthenticated ? (
        <>
          <div className={`${mobile ? 'w-full h-px my-2 bg-border/60' : 'w-px h-6 bg-border/60 mx-1'}`} />

          <Button
            asChild
            variant={location.pathname === '/editorial' ? 'default' : 'ghost'}
            size={mobile ? 'lg' : 'sm'}
            className={`${mobile ? 'w-full justify-start' : ''} gap-2 rounded-full font-medium transition-all duration-200`}
            onClick={() => setMobileOpen(false)}
          >
            <Link to="/editorial">
              <FileText className="w-4 h-4" />
              <span>Editorial</span>
            </Link>
          </Button>

          {role === 'ADMIN' && (
            <Button
              asChild
              variant={location.pathname === '/teachers' ? 'default' : 'ghost'}
              size={mobile ? 'lg' : 'sm'}
              className={`${mobile ? 'w-full justify-start' : ''} gap-2 rounded-full font-medium transition-all duration-200`}
              onClick={() => setMobileOpen(false)}
            >
              <Link to="/teachers">
                <Users className="w-4 h-4" />
                <span>Teachers</span>
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size={mobile ? 'lg' : 'sm'}
            className={`${mobile ? 'w-full justify-start' : ''} gap-2 rounded-full font-medium transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10`}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </>
      ) : (
        <Button
          asChild
          variant={location.pathname === '/login' ? 'default' : 'ghost'}
          size={mobile ? 'lg' : 'sm'}
          className={`${mobile ? 'w-full justify-start' : ''} gap-2 rounded-full font-medium transition-all duration-200`}
          onClick={() => setMobileOpen(false)}
        >
          <Link to="/login">
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        {/* Logo Area */}
        <Link to="/" className="flex items-center group transition-opacity hover:opacity-80 duration-300">
          {!logoError && mounted ? (
            <img
              src={theme === 'dark' ? '/favicon-dark.png' : '/favicon-light.png'}
              alt="ZeeQue Logo"
              className="h-10 md:h-14 w-auto object-contain transition-all duration-300"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ZeeQue</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavItems />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full ml-2 transition-all duration-200 hover:bg-muted"
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

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-muted"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {mounted ? (
              theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : null}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col gap-6 pt-10">
              <SheetHeader className="text-left px-2">
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold">Menu</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                <NavItems mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
