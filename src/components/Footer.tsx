import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ArrowUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function Footer() {
  const { theme } = useTheme();
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
      { label: 'Latest Creations', href: '/#latest' },
      { label: 'Submit Your Work', href: '/submit' },
      { label: 'FAQ', href: '/#faq' },
    ],
    categories: [
      { label: 'Stories', href: '/#latest' },
      { label: 'Poems', href: '/#latest' },
      { label: 'Drawings', href: '/#latest' },
      { label: 'Classroom News', href: '/#latest' },
      { label: 'Videos', href: '/#latest' },
    ],
    resources: [
      { label: 'Editorial Dashboard', href: '/editorial' },
      { label: 'Submission Guidelines', href: '/#faq' },
      { label: 'About Us', href: '/#faq' },
    ],
  };

  return (
    <footer className="mt-auto border-t border-border/60 bg-white dark:bg-slate-950/50 dark:border-slate-800">
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
              {footerLinks.resources.map((link, index) => (
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
              <div className="hidden md:block">•</div>
              <Link to="/#faq" className="hover:text-primary transition-colors duration-200">
                Privacy Policy
              </Link>
              <div className="hidden md:block">•</div>
              <Link to="/#faq" className="hover:text-primary transition-colors duration-200">
                Terms of Service
              </Link>
            </div>

            {/* Social Media & Scroll to Top */}
            <div className="flex items-center gap-4">
              {/* Social Media Icons */}
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center justify-center text-muted-foreground dark:text-slate-400 hover:text-primary transition-all duration-200 group"
                >
                  <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center justify-center text-muted-foreground dark:text-slate-400 hover:text-primary transition-all duration-200 group"
                >
                  <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center justify-center text-muted-foreground dark:text-slate-400 hover:text-primary transition-all duration-200 group"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center justify-center text-muted-foreground dark:text-slate-400 hover:text-primary transition-all duration-200 group"
                >
                  <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
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
