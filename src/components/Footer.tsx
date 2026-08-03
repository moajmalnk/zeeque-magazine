import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin, ArrowUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const socialLinks = [
  {
    label: 'Follow ZeeQue on Facebook',
    href: 'https://www.facebook.com/zeequepreschool',
    icon: Facebook,
    className: 'bg-[#1877F2] hover:bg-[#166FE5] text-white shadow-sm shadow-[#1877F2]/30',
  },
  {
    label: 'Follow ZeeQue on Instagram',
    href: 'https://www.instagram.com/zeeque_preschool/',
    icon: Instagram,
    className:
      'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white shadow-sm shadow-pink-500/25',
  },
  {
    label: 'Subscribe to ZeeQue on YouTube',
    href: 'https://www.youtube.com/@ZeeQuePreschool',
    icon: Youtube,
    className: 'bg-[#FF0000] hover:bg-[#CC0000] text-white shadow-sm shadow-red-500/30',
  },
  {
    label: 'Connect with ZeeQue on LinkedIn',
    href: 'https://www.linkedin.com/company/zeeque-preschool-network',
    icon: Linkedin,
    className: 'bg-[#0A66C2] hover:bg-[#004182] text-white shadow-sm shadow-[#0A66C2]/30',
  },
] as const;

export function Footer() {
  const { theme } = useTheme();
  const { role, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    explore: [
      { label: 'Latest Creations', href: '/?category=all' },
      { label: 'Submit Your Work', href: '/submit' },
      { label: 'FAQ', href: '/guidelines' },
    ],
    categories: [
      { label: 'Stories', href: '/?category=stories' },
      { label: 'Poems', href: '/?category=poems' },
      { label: 'Drawings', href: '/?category=drawings' },
      { label: 'Classroom News', href: '/?category=news' },
      { label: 'Videos', href: '/?category=video' },
    ],
    resources: [
      { label: 'Editorial Dashboard', href: '/editorial', restricted: true },
      { label: 'Submission Rules', href: '/guidelines' },
      { label: 'About ZeeQue', href: '/guidelines' },
    ],
  };

  // Filter restricted links
  const filteredResources = footerLinks.resources.filter(link => {
    if (!link.restricted) return true;
    return isAuthenticated && ['ADMIN', 'EDITORIAL'].includes(role || '');
  });

  return (
    <footer className="mt-auto border-t border-border/60 bg-white dark:bg-slate-950/50 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
      {/* Main Footer Content */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center">
              {!logoError && mounted ? (
                <img
                  src={theme === 'dark' ? '/favicon-dark.png' : '/favicon-light.png'}
                  alt="ZeeQue Logo"
                  className="h-14 md:h-16 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="h-14 md:h-16 w-14 md:w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl">✨</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A safe, playful digital magazine where preschool children share their creative works. Celebrating imagination and creativity from our amazing ZeeQue students.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span>Made with love for our little creators</span>
            </div>
          </div>

          {/* Explore Column */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Column */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground">Categories</h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Contact Column */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground">Resources</h3>
            <ul className="space-y-3 mb-6">
              {filteredResources.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>info@zeeque.com</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>ZeeQue Preschool</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/60 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} ZeeQue Preschool. All rights reserved.</p>
              <div className="hidden md:block text-primary/40">•</div>
              <Link to="/privacy-policy" className="hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-primary">
                Privacy Policy
              </Link>
              <div className="hidden md:block text-primary/40">•</div>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300 after:bg-primary">
                Terms of Service
              </Link>
            </div>

            {/* Social Media & Scroll to Top */}
            <div className="flex items-center gap-4">
              {/* Social Media Icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map(({ label, href, icon: Icon, className }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95',
                      className,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Scroll to Top Button */}
              <Button
                onClick={scrollToTop}
                variant="outline"
                size="icon"
                className="rounded-full w-9 h-9 border-border/60 hover:border-primary/50 hover:bg-primary/10 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-primary/20 transition-all duration-200"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
