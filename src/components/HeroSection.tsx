import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, PenLine, ArrowDown, BookOpen, Users, Award } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function HeroSection() {
  const videoId = 'doLm6UftlfU';
  const [hideOverlay, setHideOverlay] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Professional YouTube embed URL - privacy-enhanced mode, completely hidden UI
  // Using youtube-nocookie.com to reduce branding and UI elements
  // cc_load_policy=0 disables captions, cc_lang_pref=null prevents any language preference
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&cc_load_policy=0&cc_lang_pref=&fs=0&disablekb=1&start=0&end=0`;

  useEffect(() => {
    // Hide overlay after 8 seconds to ensure YouTube UI, thumbnail, subtitles, and loading elements are gone
    // This covers: spinner, title, buttons, logo, thumbnail, and subtitles
    const timer = setTimeout(() => {
      setHideOverlay(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative pb-12 md:pb-16 lg:pb-20 overflow-hidden bg-background" style={{ marginTop: 0, paddingTop: 0, marginBottom: 0 }}>
      {/* Professional Background Video - starts immediately after header */}
      <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Loading overlay to hide YouTube UI during initial load (hides spinner, title, buttons, logo, thumbnail) */}
        {!hideOverlay && (
          <div 
            ref={overlayRef}
            className="absolute inset-0 z-[2] youtube-loading-overlay" 
            style={{ 
              transition: 'opacity 1.5s ease-out',
              opacity: hideOverlay ? 0 : 1,
              willChange: 'opacity',
              backgroundColor: 'hsl(var(--background))',
              backgroundImage: 'none'
            }} 
          />
        )}
        
        <div className="bg-video-container">
          <iframe
            src={embedUrl}
            title="Background Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            frameBorder="0"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ 
              pointerEvents: 'none',
              border: 'none',
              display: 'block'
            }}
            className="w-full h-full youtube-iframe"
          />
        </div>
        
        {/* Professional overlay for readability - theme-aware layered gradients */}
        <div className="bg-video-overlay">
          {/* Light mode overlay - lighter to show video better */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/60 dark:from-background/90 dark:via-background/80 dark:to-background/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/50 dark:from-background/85 dark:via-transparent dark:to-background/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 dark:from-background/60 dark:via-transparent dark:to-background/60" />
          {/* Subtle uniform overlay for light mode to maintain readability while showing video */}
          <div className="absolute inset-0 bg-background/15 dark:bg-transparent" />
        </div>
      </div>
      
      {/* Professional subtle background elements - subtle accent */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/2 blur-[140px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full bg-accent/2 blur-[140px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      {/* Minimal grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808004_1px,transparent_1px),linear-gradient(to_bottom,#80808004_1px,transparent_1px)] bg-[size:32px_32px] opacity-15 pointer-events-none" />
      
      <div className="container relative z-10 pt-20 md:pt-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Professional badge */}
          <div className="inline-flex items-center gap-2.5 bg-primary/5 backdrop-blur-sm text-foreground px-5 py-2 rounded-full mb-8 border border-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium tracking-widest uppercase">A Place for Young Creators</span>
          </div>
          
          {/* Professional main heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold mb-8 leading-[1.08] tracking-[-0.02em] mt-8">
            Where Little{' '}
            <span className="text-gradient-hero bg-clip-text text-transparent">
              Imaginations
            </span>{' '}
            <br className="hidden md:block" />
            Shine Brightly
          </h1>
          
          {/* Professional description */}
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-14 leading-relaxed max-w-2xl mx-auto font-normal">
            Discover wonderful stories, beautiful poems, colorful drawings, and exciting news from our amazing ZeeQue students.
          </p>
          
          {/* Professional CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button 
              asChild 
              variant="hero" 
              size="xl" 
              className="group w-full sm:w-auto rounded-full px-10 py-7 text-base md:text-lg font-semibold shadow-card hover:shadow-hover transition-all duration-300"
            >
              <Link to="/submit" className="flex items-center">
                <PenLine className="w-5 h-5 mr-2" />
                Share Your Work
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="xl" 
              className="group w-full sm:w-auto rounded-full px-10 py-7 text-base md:text-lg font-semibold border-2 hover:bg-muted/50 transition-all duration-300 hover:border-primary/50"
            >
              <a href="#latest" className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Explore the Magazine
              </a>
            </Button>
          </div>

          {/* Professional scroll indicator */}
          <div className="flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.15em]">Scroll to explore</span>
            <ArrowDown className="w-4 h-4 text-muted-foreground animate-bounce-gentle" />
          </div>
        </div>

        {/* Professional feature highlights */}
        <div className="mt-60 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="group text-center p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-card">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 mb-6 group-hover:bg-primary/10 transition-colors">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">Creative Stories</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Explore imaginative tales crafted by young minds
            </p>
          </div>

          <div className="group text-center p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-card">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/5 mb-6 group-hover:bg-accent/10 transition-colors">
              <Users className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">Young Artists</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Showcasing the talent of our amazing students
            </p>
          </div>

          <div className="group text-center p-8 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-card">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/5 mb-6 group-hover:bg-secondary/10 transition-colors">
              <Award className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold mb-3">Celebrating Excellence</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Recognizing creativity and achievement
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
