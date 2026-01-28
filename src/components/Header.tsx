import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { PenLine, BookOpen, FileText, Moon, Sun, HelpCircle, LogIn, Users, LogOut, Menu, Sparkles, ShieldQuestion, Layers, GraduationCap } from 'lucide-react';
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
  icon: Icon,
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
          ? 'w-full py-4 px-6 text-lg justify-start gap-4'
          : 'h-10 px-5 text-sm gap-2'
        }
        ${isActive
          ? `${activeColor} scale-105 z-10`
          : `text-muted-foreground hover:bg-primary/5 dark:hover:bg-primary/20 ${hoverColor} hover:scale-105`
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

      {/* Mobile active background */}
      {isActive && mobile && (
        <span className={`absolute inset-0 rounded-full ${activeBg} ${activeShadow} -z-10`} />
      )}

      {/* Icon */}
      {Icon && (
        <Icon className={`
          ${mobile ? 'w-6 h-6' : 'w-4 h-4'}
          ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}
        `} />
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
    <div className={`flex ${mobile ? 'flex-col space-y-2 p-2' : 'items-center gap-1.5'}`}>
      <NavTab
        to="/"
        label="Read"
        icon={BookOpen}
        isActive={pathname === '/'}
        activeBg="bg-gradient-to-r from-sky-400 to-blue-500"
        activeColor="text-white"
        activeShadow="shadow-[0_8px_16px_-6px_rgba(14,165,233,0.5)]"
        hoverColor="hover:text-sky-500"
        onClick={onItemClick}
        mobile={mobile}
      />

      <NavTab
        to="/guidelines"
        label="Rules"
        icon={ShieldQuestion}
        isActive={pathname === '/guidelines'}
        activeBg="bg-gradient-to-r from-amber-400 to-orange-500"
        activeColor="text-white"
        activeShadow="shadow-[0_8px_16px_-6px_rgba(245,158,11,0.5)]"
        hoverColor="hover:text-amber-500"
        onClick={onItemClick}
        mobile={mobile}
      />

      {/* Editor & Teacher Tabs (If logged in) */}
      {isAuthenticated && (
        <>
          <div className="w-px h-6 bg-border/40 mx-2 hidden md:block" />

          <NavTab
            to="/editorial"
            label="Editor"
            icon={Layers}
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
              icon={GraduationCap}
              isActive={pathname.startsWith('/teachers')}
              activeBg="bg-gradient-to-r from-indigo-400 to-blue-600"
              activeColor="text-white"
              activeShadow="shadow-[0_8px_16px_-6px_rgba(99,102,241,0.5)]"
              hoverColor="hover:text-indigo-500"
              onClick={onItemClick}
              mobile={mobile}
            />
          )}
        </>
      )}

      {/* Primary Action 'Create' */}
      <NavTab
        to="/submit"
        label="Create"
        icon={Sparkles}
        isActive={pathname === '/submit'}
        activeBg="bg-gradient-to-r from-primary to-accent"
        activeColor="text-white"
        activeShadow="shadow-[0_8px_20px_-6px_rgba(236,72,153,0.5)]"
        hoverColor="hover:text-pink-500"
        onClick={onItemClick}
        mobile={mobile}
      />

      {/* Auth State (Login/Logout) */}
      {isAuthenticated ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className={`
                relative flex items-center justify-center font-bold tracking-wide transition-all duration-300 ease-out select-none group
                ${mobile
                  ? 'w-full py-4 px-6 text-lg justify-start text-red-500 hover:bg-red-50 gap-4'
                  : 'ml-2 h-10 px-5 text-sm rounded-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800 shadow-sm hover:shadow-md'
                }
              `}
            >
              {mobile ? (
                <span className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500">
                    <LogOut className="w-5 h-5" />
                  </div>
                  Logout
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Logout</span> <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
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
      ) : (
        <Link
          to="/login"
          onClick={onItemClick}
          className={`
            relative flex items-center justify-center font-bold tracking-wide transition-all duration-300 ease-out select-none
            ${mobile
              ? 'w-full py-4 px-6 text-lg justify-start text-primary gap-4'
              : 'ml-2 h-10 px-6 text-sm rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary/90 hover:scale-105 active:scale-95'
            }
          `}
        >
          {mobile ? (
            <span className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <LogIn className="w-5 h-5" />
              </div>
              Login
            </span>
          ) : (
            <>
              <span className="relative z-10 flex items-center gap-2">
                <span>Login</span> <LogIn className="w-4 h-4 opacity-80" />
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
            </>
          )}
        </Link>
      )}
    </div >
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
      <div className="container flex h-20 md:h-24 items-center justify-between px-4 md:px-8">
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-3 group transition-opacity hover:opacity-80 duration-300">

          <img
            src={theme === 'dark' ? '/favicon-dark.png' : '/favicon-light.png'}
            alt="ZeeQue Logo"
            className="h-20 md:h-24 w-auto object-contain transition-all duration-300 filter drop-shadow-sm hover:scale-105"
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
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )
            ) : (
              <Sun className="h-4 w-4 text-yellow-400" />
            )}
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-3">
          {/* Modern Glass Capsule */}
          <div className="flex items-center gap-1 bg-background/40 backdrop-blur-md border border-border/50 rounded-full p-1 pl-2 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent/50 transition-colors"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {mounted ? (
                  theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-400 fill-yellow-400/20" />
                  ) : (
                    <Moon className="h-5 w-5 text-indigo-500 fill-indigo-500/20" />
                  )
                ) : null}
              </motion.div>
            </Button>

            <div className="w-px h-4 bg-border/50 mx-1" />

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full hover:bg-accent/50 group">
                  <div className="flex flex-col gap-1.5 items-end justify-center w-6">
                    <span className="w-6 h-0.5 bg-foreground rounded-full transition-all group-hover:w-4 group-aria-expanded:rotate-45 group-aria-expanded:translate-y-2" />
                    <span className="w-4 h-0.5 bg-foreground/70 rounded-full transition-all group-hover:w-6 group-aria-expanded:opacity-0" />
                    <span className="w-5 h-0.5 bg-foreground rounded-full transition-all group-hover:w-3 group-aria-expanded:-rotate-45 group-aria-expanded:-translate-y-2" />
                  </div>
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
      </div>
    </header>
  );
}
