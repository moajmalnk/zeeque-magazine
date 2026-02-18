import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Check, ClipboardList } from 'lucide-react';
import api from '@/lib/api';

// Schema for Students
// Comprehensive Schema
const onboardingSchema = z.object({
    role: z.enum(['STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'SCHOOL', 'EDITORIAL']).optional(), // passed for validation context
    is_zeeque_student: z.enum(['yes', 'no']).optional(),
    teacher_name: z.string().optional(),
    school_name: z.string().optional(),
    phone_number: z.string().optional(),
}).superRefine((data, ctx) => {
    // Student Logic
    if (data.role === 'STUDENT') {
        if (!data.is_zeeque_student) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select if you are a ZeeQue student",
                path: ["is_zeeque_student"]
            });
        }
        if (data.is_zeeque_student === 'yes') {
            if (!data.school_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "School name is required", path: ["school_name"] });
            if (!data.teacher_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teacher name is required", path: ["teacher_name"] });
        }
    }
    // Teacher Logic
    if (data.role === 'TEACHER') {
        if (!data.school_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "School name is required", path: ["school_name"] });
        if (!data.phone_number || data.phone_number.length < 10) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid phone number is required", path: ["phone_number"] });
    }
    // Parent Logic
    if (data.role === 'PARENT') {
        if (!data.school_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Child's school name is required", path: ["school_name"] });
        if (!data.phone_number || data.phone_number.length < 10) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid phone number is required", path: ["phone_number"] });
    }
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
    const navigate = useNavigate();
    const { role, email, logout } = useAuth(); // Assuming useAuth provides login/logout
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            role: role || undefined,
            is_zeeque_student: undefined, // undefined to force selection
            teacher_name: '',
            school_name: '',
            phone_number: '',
        },
    });

    // Update role in form if it changes (e.g. from auth hook loading)
    if (role && form.getValues('role') !== role) {
        form.setValue('role', role);
    }

    const isZeequeStudent = form.watch('is_zeeque_student');

    const onSubmit = async (data: OnboardingFormData) => {
        setIsLoading(true);
        try {
            // 1. Update User Profile on Backend
            await api.patch('/users/me/', {
                is_onboarded: true,
                school_name: data.school_name,
                phone_number: data.phone_number,
                // Teacher name currently not in User model, might need to store in metadata or similar if needed.
                // For now, only school_name and phone_number are persisted in User model.
            });

            // 2. Refresh Local Auth Hook State (Ideally via a refetch or re-login simulation)
            // For now, we manually update if possible, or force a reload/re-login flow.
            // Since useAuth state is from localStorage, we might need to update it manually here.
            const userKey = 'zeeque_user_data';
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            userData.is_onboarded = true;
            localStorage.setItem(userKey, JSON.stringify(userData));

            // Force a small reload or state update? 
            // Better: The ProtectedRoute should now pass.

            toast.success("Welcome aboard!", {
                description: "Your profile is set up.",
            });

            navigate('/', { replace: true });
            window.location.reload(); // Simple way to ensure auth state refreshes in context

        } catch (error) {
            console.error('Onboarding failed:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-0 shadow-2xl bg-card">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <ClipboardList className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold font-display">Let's get to know you</CardTitle>
                    <CardDescription>
                        Complete your profile to access all features.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Step 1: Identify Student Type (Only for Students for now, simplified) */}
                        {role === 'STUDENT' && (
                            <div className="space-y-4">
                                <Label className="text-base">Are you a student at a ZeeQue partner school?</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => form.setValue('is_zeeque_student', 'yes')}
                                        className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${isZeequeStudent === 'yes' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                    >
                                        <div className="font-semibold">Yes</div>
                                        <div className="text-xs text-muted-foreground">My school uses ZeeQue</div>
                                    </div>
                                    <div
                                        onClick={() => form.setValue('is_zeeque_student', 'no')}
                                        className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${isZeequeStudent === 'no' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                    >
                                        <div className="font-semibold">No</div>
                                        <div className="text-xs text-muted-foreground">I'm an independent student</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conditional Fields for ZeeQue Student */}
                        {isZeequeStudent === 'yes' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label>School Name</Label>
                                    <Select
                                        onValueChange={(val) => form.setValue('school_name', val)}
                                        defaultValue={form.getValues('school_name')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select your school" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="greenwood_high">Greenwood High School</SelectItem>
                                            <SelectItem value="sunshine_academy">Sunshine Academy</SelectItem>
                                            <SelectItem value="oak_valley_inter">Oak Valley International</SelectItem>
                                            <SelectItem value="riverdale_public">Riverdale Public School</SelectItem>
                                            <SelectItem value="st_marys_convent">St. Mary's Convent</SelectItem>
                                            <SelectItem value="delhi_public_school">Delhi Public School</SelectItem>
                                            <SelectItem value="kendriya_vidyalaya">Kendriya Vidyalaya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.school_name && <p className="text-xs text-destructive">{form.formState.errors.school_name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Teacher Name</Label>
                                    <Input {...form.register('teacher_name')} placeholder="Enter your teacher's name" />
                                </div>
                            </div>
                        )}
                        {/* Teacher & Parent Specific Fields */}
                        {(role === 'TEACHER' || role === 'PARENT') && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label>{role === 'TEACHER' ? 'School Name' : "Child's School Name"}</Label>
                                    <Select
                                        onValueChange={(val) => form.setValue('school_name', val)}
                                        defaultValue={form.getValues('school_name')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select school" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="greenwood_high">Greenwood High School</SelectItem>
                                            <SelectItem value="sunshine_academy">Sunshine Academy</SelectItem>
                                            <SelectItem value="oak_valley_inter">Oak Valley International</SelectItem>
                                            <SelectItem value="riverdale_public">Riverdale Public School</SelectItem>
                                            <SelectItem value="st_marys_convent">St. Mary's Convent</SelectItem>
                                            <SelectItem value="delhi_public_school">Delhi Public School</SelectItem>
                                            <SelectItem value="kendriya_vidyalaya">Kendriya Vidyalaya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.school_name && <p className="text-xs text-destructive">{form.formState.errors.school_name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        {...form.register('phone_number')}
                                        placeholder="(555) 000-0000"
                                        type="tel"
                                    />
                                    {form.formState.errors.phone_number && <p className="text-xs text-destructive">{form.formState.errors.phone_number.message}</p>}
                                </div>
                            </div>
                        )}



                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Complete Profile'}
                        </Button>

                        <div className="text-center">
                            <button type="button" onClick={logout} className="text-xs text-muted-foreground hover:underline">
                                Log out and try with a different account
                            </button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
