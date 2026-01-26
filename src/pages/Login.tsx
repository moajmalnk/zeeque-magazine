import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Mail, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = await login(data.email, data.password);

    if (success) {
      toast.success('Login successful!', {
        description: 'Welcome to the Editorial Dashboard',
        duration: 3000,
      });

      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to the page they were trying to access, or editorial dashboard
      const from = (location.state as any)?.from?.pathname || '/editorial';

      // Navigate to the destination
      navigate(from, { replace: true });
    } else {
      toast.error('Invalid credentials', {
        description: 'Please check your email and password',
        duration: 4000,
      });
      form.setError('password', {
        type: 'manual',
        message: 'Invalid email or password',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden relative">
      <Header />

      {/* Background Pattern */}
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />

      {/* Responsive Decorative Elements - Standardized Professional Look */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50 dark:opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-50 dark:opacity-20 pointer-events-none" />

      {/* Main Content Container - Scrollable Area */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="min-h-full flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl mx-auto">
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
            <Card className="border-2 border-border/60 shadow-xl bg-card/95 backdrop-blur-md overflow-hidden">
              <CardHeader className="text-center space-y-2 pb-4 pt-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center mb-2 shadow-inner ring-1 ring-primary/20">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl font-bold tracking-tight">
                    Editorial Access
                  </CardTitle>
                  <CardDescription className="text-sm px-4">
                    Sign in to manage submissions and content
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-6 sm:px-8 pb-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium ml-1">
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="teacher@school.edu"
                        {...form.register('email')}
                        className="h-11 pl-9 text-base rounded-xl border-border/60 bg-muted/30 focus:bg-background focus:border-primary/50 transition-all duration-200"
                        disabled={isLoading}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1 ml-1 animate-in slide-in-from-left-1 fade-in">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium ml-1">
                        Password
                      </Label>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...form.register('password')}
                        className="h-11 pl-9 pr-9 text-base rounded-xl border-border/60 bg-muted/30 focus:bg-background focus:border-primary/50 transition-all duration-200"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-xs text-destructive mt-1 ml-1 animate-in slide-in-from-left-1 fade-in">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} ZeeQue. Authorized access only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
