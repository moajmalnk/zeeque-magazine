import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { PenLine, BookOpen, FileText, Moon, Sun, HelpCircle, LogIn, Users, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';



// Text-Only "Morph" Tab Component
const NavTab = ({
  to,
  label,
  isActive,
  activeColor,
  activeBg = 'bg-white', // Default to white
  activeShadow,
  hoverColor,
  onClick,
  mobile
}: any) => {

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative flex items-center justify-center rounded-full font-bold tracking-wide transition-all duration-300 ease-out select-none
        ${mobile
          ? 'w-full py-4 px-6 text-lg justify-start'
          : 'h-10 px-6 text-sm'
        }
        ${isActive
          ? `${activeColor} scale-105 z-10`
          : `text-muted-foreground hover:bg-slate-50 ${hoverColor} hover:scale-105 hover:bg-opacity-50`
        }
      `}
    >
      {isActive && !mobile && (
        <motion.span
          layoutId={mobile ? "nav-pill-mobile" : "nav-pill"}
          className={`absolute inset-0 rounded-full ${activeBg} ${activeShadow} -z-10`}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      {/* Mobile active background (no sliding animation) */}
      {isActive && mobile && (
        <span className={`absolute inset-0 rounded-full ${activeBg} ${activeShadow} -z-10`} />
      )}

      <span className="relative z-10 font-bold">{label}</span>

      {/* Subtle glow effect behind active tab (Only on desktop) */}
      {isActive && !mobile && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 rounded-full bg-current blur-md -z-10`}
        />
      )}
    </Link>
  );
};

const NavItems = ({ mobile = false, onItemClick, onLogout }: { mobile?: boolean; onItemClick?: () => void; onLogout: () => void }) => {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();
  const { pathname } = location;

  return (
    <div className={`flex ${mobile ? 'flex-col space-y-2 p-2' : 'items-center gap-2'}`}>
      <NavTab
        to="/"
        label="Read"
        isActive={pathname === '/'}
        activeBg="bg-gradient-to-r from-sky-400 to-blue-500"
        activeColor="text-white"
        activeShadow="shadow-[0_8px_16px_-6px_rgba(14,165,233,0.5)]"
        hoverColor="hover:text-sky-500"
        onClick={onItemClick}
        mobile={mobile}
      />

      <NavTab
        to="/submit"
        label="Create"
        isActive={pathname === '/submit'}
        activeBg="bg-gradient-to-r from-primary to-accent" // Gradient ONLY when active
        activeColor="text-white"
        activeShadow="shadow-[0_8px_20px_-6px_rgba(236,72,153,0.5)]"
        hoverColor="hover:text-pink-500"
        onClick={onItemClick}
        mobile={mobile}
      />

      <NavTab
        to="/guidelines"
        label="Rules"
        isActive={pathname === '/guidelines'}
        activeBg="bg-gradient-to-r from-amber-400 to-orange-500"
        activeColor="text-white"
        activeShadow="shadow-[0_8px_16px_-6px_rgba(245,158,11,0.5)]"
        hoverColor="hover:text-amber-500"
        onClick={onItemClick}
        mobile={mobile}
      />

      {isAuthenticated ? (
        <>
          {!mobile && <div className="w-px h-6 bg-border/40 mx-2" />}

          <NavTab
            to="/editorial"
            label="Editor"
            isActive={pathname.startsWith('/editorial')}
            activeBg="bg-gradient-to-r from-purple-400 to-violet-500"
            activeColor="text-white"
            activeShadow="shadow-[0_8px_16px_-6px_rgba(168,85,247,0.5)]"
            hoverColor="hover:text-purple-500"
            onClick={onItemClick}
            mobile={mobile}
          />

          {role === 'ADMIN' && (
            <NavTab
              to="/teachers"
              label="Teachers"
              isActive={pathname.startsWith('/teachers')}
              activeBg="bg-gradient-to-r from-indigo-400 to-blue-600"
              activeColor="text-white"
              activeShadow="shadow-[0_8px_16px_-6px_rgba(99,102,241,0.5)]"
              hoverColor="hover:text-indigo-500"
              onClick={onItemClick}
              mobile={mobile}
            />
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className={`
                  relative flex items-center justify-center rounded-full font-bold tracking-wide transition-all duration-300 ease-out select-none
                  text-slate-500 hover:text-red-500 hover:bg-red-50
                  ${mobile
                    ? 'w-full py-4 px-6 text-lg justify-start'
                    : 'h-10 px-6 text-sm'
                  }
                `}
              >
                <span>Logout</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to log out of your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  if (onItemClick) onItemClick();
                  onLogout();
                }} className="bg-red-500 hover:bg-red-600 focus:ring-red-500">
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <NavTab
          to="/login"
          label="Login"
          isActive={pathname === '/login'}
          activeBg="bg-gradient-to-r from-violet-400 to-fuchsia-500"
          activeColor="text-white"
          activeShadow="shadow-[0_8px_16px_-6px_rgba(139,92,246,0.5)]"
          hoverColor="hover:text-violet-500"
          onClick={onItemClick}
          mobile={mobile}
        />
      )}
    </div>
  );
};

export function Header() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
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

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-3 group transition-opacity hover:opacity-80 duration-300">

          <img
            src={theme === 'dark' ? '/favicon-dark.png' : '/favicon-light.png'}
            alt="ZeeQue Logo"
            className="h-12 md:h-16 w-auto object-contain transition-all duration-300 filter drop-shadow-sm"
            onError={() => setLogoError(true)}
          />


        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavItems onLogout={handleLogout} />

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
                <NavItems mobile onItemClick={() => setMobileOpen(false)} onLogout={handleLogout} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
