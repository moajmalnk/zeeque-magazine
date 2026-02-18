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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Lock, Mail, UserPlus, Eye, EyeOff, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import api from '@/lib/api';

const signupSchema = z.object({
    username: z.string().min(2, 'Name must be at least 2 characters').regex(/^[\w.@+\- ]+$/, 'Alphanumeric and spaces only'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'TEACHER', 'PARENT'], {
        errorMap: () => ({ message: 'Please select a valid role' }),
    }),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            role: 'STUDENT',
        },
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);

        try {
            // 1. Create User
            // Note: Backend endpoint assumed to be /users/ (standard DRF ViewSet)
            // If it fails, check backend urls.py in apps/users/api/urls.py
            await api.post('/users/', {
                username: data.username,
                email: data.email,
                password: data.password,
                role: data.role,
            });

            toast.success('Account created!', {
                description: 'Logging you in...',
                duration: 2000,
            });

            // 2. Auto Login
            const success = await login(data.email, data.password);

            if (success) {
                // Redirect to onboarding specifically for new signups
                navigate('/onboarding', { replace: true });
            } else {
                // Should realistically not happen if creation was successful and login logic is correct
                toast.error('Login failed after signup', {
                    description: 'Please try logging in manually.',
                });
                navigate('/login');
            }

        } catch (error: any) {
            console.error('Signup error:', error);
            let message = 'Could not create account.';
            if (error.response?.data) {
                // Extract first error message from DRF response
                const firstError = Object.values(error.response.data)[0];
                if (Array.isArray(firstError)) {
                    message = String(firstError[0]);
                } else if (typeof firstError === 'string') {
                    message = firstError;
                }
            }

            toast.error('Signup Failed', {
                description: message,
            });

            if (message.toLowerCase().includes('email')) {
                form.setError('email', { type: 'manual', message: message });
            } else if (message.toLowerCase().includes('username')) {
                form.setError('username', { type: 'manual', message: message });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden relative">
            <Header />

            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />

            {/* Responsive Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50 dark:opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 opacity-50 dark:opacity-20 pointer-events-none" />

            {/* Main Content Container */}
            <div className="flex-1 overflow-y-auto w-full py-10">
                <div className="min-h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl mx-auto">
                    <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
                        <Card className="border-2 border-border/60 shadow-xl bg-card/95 backdrop-blur-md overflow-hidden">
                            <CardHeader className="text-center space-y-2 pb-4 pt-6">
                                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary/20 to-secondary/5 flex items-center justify-center mb-2 shadow-inner ring-1 ring-secondary/20">
                                    <UserPlus className="w-7 h-7 text-secondary" />
                                </div>
                                <div>
                                    <CardTitle className="font-display text-2xl font-bold tracking-tight">
                                        Create Account
                                    </CardTitle>
                                    <CardDescription className="text-sm px-4">
                                        Join distinct community
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="px-6 sm:px-8 pb-6">
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    {/* Name Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-sm font-medium ml-1">
                                            Full Name
                                        </Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder="Your Name"
                                                {...form.register('username')}
                                                className="h-11 pl-9 text-base rounded-xl border-border/60 bg-muted/30 focus:bg-background focus:border-primary/50 transition-all duration-200"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {form.formState.errors.username && (
                                            <p className="text-xs text-destructive mt-1 ml-1 animate-in slide-in-from-left-1 fade-in">
                                                {form.formState.errors.username.message}
                                            </p>
                                        )}
                                    </div>

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
                                                placeholder="you@example.com"
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

                                    {/* Role Selection */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium ml-1">I am a...</Label>
                                        <Select
                                            onValueChange={(val) => form.setValue('role', val as any)}
                                            defaultValue={form.getValues('role')}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl border-border/60 bg-muted/30 focus:ring-primary/50">
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/60 shadow-lg">
                                                <SelectItem value="STUDENT">Student</SelectItem>
                                                <SelectItem value="TEACHER">Teacher</SelectItem>
                                                <SelectItem value="PARENT">Parent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.formState.errors.role && (
                                            <p className="text-xs text-destructive mt-1 ml-1 animate-in slide-in-from-left-1 fade-in">
                                                {form.formState.errors.role.message}
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
                                        className="w-full h-11 text-base font-semibold rounded-xl bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                                Creating account...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <UserPlus className="w-4 h-4" />
                                                Sign Up
                                            </span>
                                        )}
                                    </Button>

                                    <div className="text-center pt-2">
                                        <span className="text-sm text-muted-foreground">Already have an account? </span>
                                        <Link to="/login" className="text-sm font-semibold text-primary hover:underline">
                                            Log In
                                        </Link>
                                    </div>

                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-6 text-center text-xs text-muted-foreground/60">
                            &copy; {new Date().getFullYear()} ZeeQue.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
