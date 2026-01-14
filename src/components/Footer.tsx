import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-border/50 bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
              <span className="text-sm">✨</span>
            </div>
            <span className="font-display font-bold text-foreground">
              ZeeQue Webzine
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for our little creators
          </p>
          
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ZeeQue Preschool
          </p>
        </div>
      </div>
    </footer>
  );
}
