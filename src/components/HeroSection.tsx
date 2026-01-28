import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, PenLine, BookOpen, Star, Cloud, Palette, Music } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative pt-8 pb-20 md:pt-12 md:pb-32 overflow-hidden bg-background">
      {/* Magical Background Gradients - Stronger & more visible */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

      {/* Floating 3D Elements (Background Decoration) - Higher Opacity */}
      <div className="absolute top-10 left-[5%] opacity-80 animate-float animation-delay-100 hidden md:block">
        <div className="text-6xl filter drop-shadow-md">☁️</div>
      </div>
      <div className="absolute bottom-40 right-[10%] opacity-80 animate-float animation-delay-300 hidden md:block">
        <div className="text-5xl filter drop-shadow-md">⭐</div>
      </div>
      <div className="absolute top-40 right-[15%] opacity-70 animate-float animation-delay-500 hidden md:block">
        <div className="text-6xl filter drop-shadow-md">🎈</div>
      </div>
      <div className="absolute bottom-20 left-[20%] opacity-80 animate-float animation-delay-200 hidden md:block">
        <div className="text-5xl filter drop-shadow-md">🎨</div>
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left Column: Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 md:space-y-8 pt-8 lg:pt-0">
            {/* Playful Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-primary/20 px-4 py-2 rounded-full shadow-sm animate-fade-in mx-auto lg:mx-0">
              <span className="text-xl">✨</span>
              <span className="font-bold text-primary dark:text-primary tracking-wide text-sm md:text-base">Welcome to ZeeQue World!</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-[5rem] font-bold leading-[1.1] tracking-tight text-foreground drop-shadow-sm">
              Where Little <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent inline-block animate-wiggle origin-bottom-right">
                Imaginations
              </span> <br />
              Run Wild! 🚀
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Join our magical playground where stories coming to life, drawings dance, and every child is a star! ⭐
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4 z-30 relative">
              <Button
                asChild
                size="xl"
                className="rounded-full px-8 py-7 text-xl font-bold bg-primary text-white shadow-[0_10px_20px_-5px_rgba(236,72,153,0.5)] hover:shadow-[0_15px_25px_-5px_rgba(236,72,153,0.6)] hover:-translate-y-1 hover:bg-primary transition-all duration-300 w-full sm:w-auto mt-2 border-0"
              >
                <Link to="/submit" className="flex items-center gap-3">
                  <PenLine className="w-6 h-6" />
                  Start Creating
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="xl"
                className="rounded-full px-8 py-7 text-xl font-bold bg-white dark:bg-slate-900 border-2 border-sky-500 text-sky-500 shadow-[0_10px_20px_-5px_rgba(14,165,233,0.5)] hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 hover:border-sky-600 hover:shadow-[0_15px_25px_-5px_rgba(14,165,233,0.6)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto mt-2"
              >
                <Link to="/all-creatives" className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6" />
                  Read Stories
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: 3D Mascot & Hero Image */}
          <div className="flex-1 relative w-full max-w-[500px] lg:max-w-none">
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center">
              {/* Background Blob for Mascot */}
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-[60px] scale-75 animate-pulse" />

              {/* Main Mascot Image */}
              <div className="relative z-10 w-full max-w-[400px] lg:max-w-[500px] animate-float hover:z-20">
                <img
                  src="/images/mascot1.png"
                  alt="ZeeQue Mascot"
                  className="w-full h-full object-contain drop-shadow-2xl transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) cursor-pointer 
                  hover:scale-110 hover:-rotate-6 hover:brightness-110 hover:drop-shadow-[0_20px_35px_rgba(236,72,153,0.3)]
                  active:scale-90 active:rotate-12 active:brightness-90"
                />
              </div>

              {/* Orbital Floating Icons */}
              <div className="absolute top-[10%] right-[10%] bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-card animate-float animation-delay-200">
                <Music className="w-8 h-8 text-pink-500" />
              </div>
              <div className="absolute bottom-[20%] left-[5%] bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-card animate-float animation-delay-500">
                <Palette className="w-8 h-8 text-purple-500" />
              </div>
              <div className="absolute top-[40%] left-[-5%] hidden lg:block">
                <div className="text-4xl animate-spin-slow">✏️</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Fun curved divider at the bottom - Moved outside container to prevent overlap */}
      <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-none rotate-180 z-20 pointer-events-none">
        <svg className="relative block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white dark:fill-background"></path>
        </svg>
      </div>
    </section>
  );
}
