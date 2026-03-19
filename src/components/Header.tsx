import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { PenLine, BookOpen, FileText, Moon, Sun, HelpCircle, LogIn, Users, LogOut, Menu, Sparkles, ShieldQuestion, Layers, GraduationCap, User, ChevronDown, UserCircle, Settings, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isVerifiedRole, getRoleColor } from "@/lib/roleUtils";
import { BadgeCheck } from 'lucide-react';
import { cn, getMediaUrl } from '@/lib/utils';
import { useAuthPrompt } from '@/context/AuthPromptContext';

// Floating Create Button Component (Portal)
const FloatingCreateButton = ({ isAuthenticated, onAuthRequired }: { isAuthenticated: boolean, onAuthRequired: () => void }) => {
  return createPortal(
    <Link
      to={isAuthenticated ? "/submit" : "#"}
      className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-6 z-50 group flex flex-col items-center justify-center p-4"
      title="Create New Post"
      onClick={(e) => {
        if (!isAuthenticated) {
          e.preventDefault();
          onAuthRequired();
        }
      }}
    >
      {/* Tooltip Label (Desktop) */}
      <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/95 dark:bg-slate-900/95 text-foreground text-sm font-bold rounded-2xl shadow-xl border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 whitespace-nowrap hidden md:block backdrop-blur-md pointer-events-none z-20">
        Start Creating!
      </span>

      <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">

        {/* Continuous Water Ripple/Pulse Animation */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
          {/* Layer 1 */}
          <motion.div
            className="absolute w-full h-full rounded-full bg-primary/20 dark:bg-primary/30"
            animate={{
              scale: [0, 2.2],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.2, 1] // Fade in quickly then fade out slowly
            }}
          />
          {/* Layer 2 */}
          <motion.div
            className="absolute w-full h-full rounded-full bg-primary/15 dark:bg-primary/25"
            animate={{
              scale: [0, 2.2],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeOut",
              delay: 1,
              times: [0, 0.2, 1]
            }}
          />
          {/* Layer 3 */}
          <motion.div
            className="absolute w-full h-full rounded-full bg-primary/10 dark:bg-primary/20"
            animate={{
              scale: [0, 2.2],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeOut",
              delay: 2,
              times: [0, 0.2, 1]
            }}
          />
          {/* Layer 4 */}
          <motion.div
            className="absolute w-full h-full rounded-full bg-primary/5 dark:bg-primary/10"
            animate={{
              scale: [0, 2.2],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeOut",
              delay: 3,
              times: [0, 0.2, 1]
            }}
          />
        </div>

        {/* Interactive Mascot Container */}
        <div className="relative w-full h-full transition-transform duration-300 ease-out transform group-hover:scale-110 group-hover:-rotate-6 group-active:scale-95 z-10">
          {/* Mascot Image - Free-standing with shadow */}
          <img
            src="/images/mascot1.png"
            alt="Create"
            className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)] filter transition-all duration-300"
          />

          {/* Plus Icon Badge */}
          <div className="absolute -bottom-1 -right-1 md:bottom-0 md:right-0 w-8 h-8 md:w-10 md:h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-[3px] border-white dark:border-slate-950 transform group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
            <Plus className="w-3 h-3 md:w-4 md:h-4 stroke-[3]" />
          </div>
        </div>
      </div>
    </Link>,
    document.body
  );
};


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
  mobile,
  className
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
        ${className || ''}
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

const NavItems = ({
  mobile = false,
  onItemClick,
  onLogout,
  isAuthenticated,
  role,
  username,
  email,
  profileImage,
  theme,
  setTheme,
  mounted
}: {
  mobile?: boolean;
  onItemClick?: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  role: string | null;
  username: string | null;
  email: string | null;
  profileImage: string | null;
  theme?: string;
  setTheme?: (theme: string) => void;
  mounted?: boolean;
}) => {
  const location = useLocation();
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

      {isAuthenticated && (
        <NavTab
          to="/community"
          label="Explore"
          icon={Search}
          isActive={pathname === '/community'}
          activeBg="bg-gradient-to-r from-emerald-400 to-teal-500"
          activeColor="text-white"
          activeShadow="shadow-[0_8px_16px_-6px_rgba(16,185,129,0.5)]"
          hoverColor="hover:text-emerald-500"
          onClick={onItemClick}
          mobile={mobile}
        />
      )}

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

          {['ADMIN', 'EDITORIAL'].includes(role || '') && (
            <NavTab
              to="/editorial"
              label="Editorial"
              icon={Layers}
              isActive={pathname.startsWith('/editorial')}
              activeBg="bg-gradient-to-r from-purple-400 to-violet-500"
              activeColor="text-white"
              activeShadow="shadow-[0_8px_16px_-6px_rgba(168,85,247,0.5)]"
              hoverColor="hover:text-purple-500"
              onClick={onItemClick}
              mobile={mobile}
            />
          )}

          {role === 'ADMIN' && (
            <NavTab
              to="/users"
              label="Users"
              icon={Users}
              isActive={pathname.startsWith('/users')}
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

      {/* Primary Action 'Create' removed from navbar and moved to Floating Button */}

      {/* User Profile & Auth - Desktop Dropdown / Mobile List */}
      {isAuthenticated ? (
        mobile ? (
          // Mobile View: Enhanced User Section
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4">Account</h4>

            {/* User Profile Card */}
            <Link
              to="/profile"
              onClick={onItemClick}
              className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors mb-3 group"
            >
              <div className="relative shrink-0">
                <Avatar className={cn(
                  "h-12 w-12 border-2 shadow-sm group-hover:scale-105 transition-transform",
                  getRoleColor(role).border
                )}>
                  <AvatarImage src={getMediaUrl(profileImage)} alt={username || 'User'} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isVerifiedRole(role) && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-zinc-900 rounded-full p-[1px] shadow-sm">
                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground truncate">{username || 'User'}</span>
                <span className="text-xs text-muted-foreground truncate">{email}</span>
                <span className="text-[10px] text-primary font-medium mt-1">View Profile</span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={() => {
                if (onItemClick) onItemClick();
                onLogout();
              }}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold text-sm"
            >
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <LogOut className="w-4 h-4" />
              </div>
              Sign out
            </button>
          </div>
        ) : (
          // Desktop View: Dropdown
          <div className="ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 pl-1 pr-3 py-1 bg-background/50 hover:bg-muted/50 border border-border/40 rounded-full cursor-pointer transition-all duration-200 hover:shadow-sm group select-none">
                  <div className="relative">
                    <Avatar className={cn(
                      "h-8 w-8 border-2 transition-transform group-hover:scale-105",
                      getRoleColor(role).border
                    )}>
                      <AvatarImage src={getMediaUrl(profileImage)} alt={username || 'User'} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold">
                        {username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isVerifiedRole(role) && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-zinc-900 rounded-full p-[1px] shadow-sm">
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold max-w-[100px] truncate group-hover:text-foreground/80 transition-colors">
                    {username || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{username}</p>
                    <p className="text-xs leading-none text-muted-foreground break-all">
                      {email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* Settings could go here */}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer flex items-center gap-2"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      ) : (
        // Login Button (Unauthenticated)
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
  const { logout, isAuthenticated, role, username, email, profile_image } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openAuthPrompt } = useAuthPrompt();

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
    <>
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="container flex h-20 md:h-24 items-center justify-between px-4 md:px-8">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 group transition-opacity hover:opacity-80 duration-300">

            <img
              src={mounted ? (theme === 'dark' ? '/favicon-dark.png' : '/favicon-light.png') : '/favicon-light.png'}
              alt="ZeeQue Logo"
              className="h-16 md:h-20 w-auto object-contain transition-all duration-300 filter drop-shadow-sm hover:scale-105"
            />


          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavItems
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
              role={role}
              username={username}
              email={email}
              profileImage={profile_image}
            />

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
            <div className="flex items-center gap-1 bg-background/40 backdrop-blur-md border border-border/50 rounded-full p-1 pl-1.5 shadow-sm">

              {isAuthenticated ? (
                <Link to="/profile" className="rounded-full overflow-hidden hover:opacity-80 transition-opacity">
                  <Avatar className={cn(
                    "h-8 w-8 border transition-transform",
                    getRoleColor(role).border
                  )}>
                    <AvatarImage src={getMediaUrl(profile_image)} alt={username || 'User'} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                      {username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link to="/login" className="rounded-full p-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <UserCircle className="w-6 h-6" />
                </Link>
              )}

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
                <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col gap-6">
                  {/* Theme Toggle in Mobile Sidebar (Same line as Menu & Close) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-14 top-6 h-9 w-9 rounded-full hover:bg-accent/50 transition-colors z-50"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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

                  <SheetHeader className="text-left mt-1.5 h-6 flex justify-center">
                    <SheetTitle className="flex items-center gap-2">
                      <span className="font-display text-xl font-bold">Menu</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-2">
                    <NavItems
                      mobile
                      onItemClick={() => setMobileOpen(false)}
                      onLogout={handleLogout}
                      isAuthenticated={isAuthenticated}
                      role={role}
                      username={username}
                      email={email}
                      profileImage={profile_image}
                      theme={theme}
                      setTheme={setTheme}
                      mounted={mounted}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Global Floating Create Button */}
      <FloatingCreateButton
        isAuthenticated={isAuthenticated}
        onAuthRequired={openAuthPrompt}
      />

    </>
  );
}
