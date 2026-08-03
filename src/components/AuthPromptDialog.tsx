import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthPrompt } from '@/context/AuthPromptContext';

export function AuthPromptDialog() {
  const navigate = useNavigate();
  const { isOpen, closeAuthPrompt } = useAuthPrompt();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthPrompt()}>
      <DialogContent
        noContentWrapper
        className="max-w-md w-[calc(100%-1.5rem)] sm:w-full p-0 gap-0 bg-white dark:bg-black border-0 rounded-[2rem] shadow-2xl z-[200] max-h-[min(720px,calc(100dvh-1.5rem))] overflow-y-auto overflow-x-hidden scrollbar-modal"
      >
        <div className="relative h-36 sm:h-44 w-full shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 blur-3xl rounded-full pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-400/20 blur-3xl rounded-full pointer-events-none"
          />

          <img
            src="/images/mascot1.png"
            alt="Join Community Mascot"
            className="relative z-10 h-28 sm:h-36 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="p-6 sm:p-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-5 sm:space-y-6 text-center bg-white dark:bg-black">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-2xl font-display font-black text-foreground">
              Join to Create
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground/70 leading-relaxed">
              We'd love to see your ideas! Sign in or create an account to start publishing your posts, interacting with the community, and building your creative portfolio.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => { closeAuthPrompt(); navigate('/login'); }}
              className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Let's Log In <LogIn className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => { closeAuthPrompt(); navigate('/signup'); }}
              className="w-full h-12 rounded-xl font-bold border-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all"
            >
              Create new account
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            By joining, you agree to our Terms of Service &amp; Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
