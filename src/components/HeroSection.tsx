import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, PenLine } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-accent/30 blur-2xl animate-float" />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-secondary/30 blur-3xl animate-float animation-delay-200" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-stories/20 blur-xl animate-float animation-delay-300" />
      
      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Decorative badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full mb-6 animate-bounce-gentle">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">A Place for Young Creators</span>
          </div>
          
          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Where Little 
            <span className="text-gradient-hero"> Imaginations </span>
            Shine ✨
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover wonderful stories, beautiful poems, colorful drawings, and exciting news from our amazing ZeeQue students!
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild variant="hero" size="xl" className="w-full sm:w-auto">
              <Link to="/submit">
                <PenLine className="w-5 h-5 mr-2" />
                Share Your Work
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href="#latest">
                Explore the Magazine
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
