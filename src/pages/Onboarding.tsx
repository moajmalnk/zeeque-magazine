import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Check, ClipboardList, ChevronsUpDown, Search, Camera, Upload, X, Star, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import api from '@/lib/api';
import { SchoolSelector } from '@/components/SchoolSelector';

// --- Helper Components ---
const ProgressStars = ({ step, total }: { step: number, total: number }) => (
    <div className="flex gap-1.5 justify-center mb-6">
        {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`transition-all duration-500 ${i < step ? 'scale-110' : 'scale-100 opacity-30 grayscale'}`}>
                <Star className={`w-4 h-4 md:w-5 md:h-5 fill-primary text-primary drop-shadow-sm ${i < step ? 'animate-pulse' : ''}`} />
            </div>
        ))}
    </div>
);

// Schema for Students
// Comprehensive Schema
const onboardingSchema = z.object({
    role: z.enum(['STUDENT', 'TEACHER', 'PARENT', 'ADMIN', 'SCHOOL', 'EDITORIAL']).optional(), // passed for validation context
    is_partner_member: z.enum(['yes', 'no']).optional(), // For Teachers/Parents
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
        if (data.is_zeeque_student === 'no') {
            if (!data.school_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "School name is required", path: ["school_name"] });
            if (!data.phone_number || data.phone_number.length < 10) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid phone number is required", path: ["phone_number"] });
        }
    }
    // Teacher Logic
    if (data.role === 'TEACHER') {
        if (!data.is_partner_member) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select your school type", path: ["is_partner_member"] });
        }
        if (!data.school_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "School name is required", path: ["school_name"] });
        if (!data.phone_number || data.phone_number.length < 10) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid phone number is required", path: ["phone_number"] });
    }
    // Parent Logic
    if (data.role === 'PARENT') {
        if (!data.is_partner_member) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select your school type", path: ["is_partner_member"] });
        }
        if (!data.school_name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Child's school name is required", path: ["school_name"] });
        if (!data.phone_number || data.phone_number.length < 10) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid phone number is required", path: ["phone_number"] });
    }
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;


export default function Onboarding() {
    const navigate = useNavigate();
    const { role, email, username, logout } = useAuth(); // Assuming useAuth provides login/logout
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const TOTAL_STEPS = 3;

    // Cropping State
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);

    const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setIsCropping(true);
                // Reset crop/zoom for new image
                setCrop({ x: 0, y: 0 });
                setZoom(1);
            };
            reader.readAsDataURL(file);
        }
    };

    const applyCrop = async () => {
        if (!tempImage || !croppedAreaPixels) return;

        try {
            const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
            if (croppedBlob) {
                const croppedFile = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
                setProfileImage(croppedFile);
                const previewUrl = URL.createObjectURL(croppedBlob);
                setImagePreview(previewUrl);
                setIsCropping(false);
                setTempImage(null);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to crop image");
        }
    };

    const removeImage = () => {
        setProfileImage(null);
        setImagePreview(null);
    };

    // Manual Form Submission Trigger
    const requestSubmit = () => {
        form.handleSubmit(onSubmit)();
    };

    const form = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            role: role || undefined,
            is_zeeque_student: undefined, // undefined to force selection
            is_partner_member: undefined, // for Teachers/Parents
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
    const isPartnerMember = form.watch('is_partner_member');

    const handleNext = async () => {
        // Validation per step
        if (currentStep === 1) {
            if (role === 'STUDENT' && !isZeequeStudent) {
                form.setError('is_zeeque_student', { message: "Please select an option" });
                return;
            }
            if ((role === 'TEACHER' || role === 'PARENT') && !isPartnerMember) {
                form.setError('is_partner_member', { message: "Please select an option" });
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            const isValid = await form.trigger(['school_name', 'phone_number', 'teacher_name']);
            if (isValid) setCurrentStep(3);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(1, prev - 1));
    };

    const onSubmit = async (data: OnboardingFormData) => {
        // PREVENT PREMATURE SUBMISSION: If not on the last step, just go to next
        if (currentStep < TOTAL_STEPS) {
            handleNext();
            return;
        }

        setIsLoading(true);
        try {
            // 1. Update User Profile on Backend
            const formData = new FormData();
            formData.append('is_onboarded', 'true');
            if (data.school_name) formData.append('school_name', data.school_name);
            if (data.phone_number) formData.append('phone_number', data.phone_number);
            if (data.teacher_name) formData.append('teacher_name', data.teacher_name);
            if (profileImage) {
                formData.append('profile_image', profileImage);
            }

            const response = await api.patch('/users/me/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 2. Refresh Local Auth Hook State
            const userKey = 'zeeque_user_data';
            const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
            userData.is_onboarded = true;
            if (response.data.profile_image) {
                userData.profile_image = response.data.profile_image;
            }
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
            {/* Professional Cropping Dialog */}
            <Dialog open={isCropping} onOpenChange={(open) => {
                if (!open) {
                    setIsCropping(false);
                    setTempImage(null);
                }
            }}>
                <DialogContent className="max-w-[90vw] md:max-w-md w-full p-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <DialogHeader className="p-4 border-b bg-white dark:bg-slate-900">
                        <DialogTitle className="text-center font-bold">Edit Profile Photo</DialogTitle>
                    </DialogHeader>

                    <div className="relative h-[300px] md:h-[400px] w-full bg-slate-200 dark:bg-slate-800">
                        {tempImage && (
                            <Cropper
                                image={tempImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        )}
                    </div>

                    <div className="p-6 space-y-4 bg-white dark:bg-slate-900 border-t">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zoom</span>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={([val]) => setZoom(val)}
                                className="flex-1"
                            />
                        </div>
                        <DialogFooter className="flex gap-3 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsCropping(false);
                                    setTempImage(null);
                                }}
                                className="flex-1 font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={applyCrop}
                                className="flex-1 font-bold bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20"
                            >
                                Apply Changes
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Card className="w-full max-w-md border-0 shadow-2xl bg-card">
                <CardHeader className="text-center pb-2">
                    <ProgressStars step={currentStep} total={TOTAL_STEPS} />
                    <CardTitle className="text-2xl font-bold font-display">
                        {currentStep === 1 ? "Welcome to ZeeQue" :
                            currentStep === 2 ? "A few more details" :
                                "Final Touch"}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 ? "Let's identify your connection to us." :
                            currentStep === 2 ? "This helps us tailor your experience." :
                                "Add a profile picture to personalize your space."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">

                        {/* STEP 1: IDENTITY */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                {role === 'STUDENT' ? (
                                    <div className="space-y-4">
                                        <Label className="text-base text-center block text-slate-700 dark:text-slate-200">Are you a student at a ZeeQue partner school?</Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div
                                                onClick={() => { form.setValue('is_zeeque_student', 'yes'); form.clearErrors('is_zeeque_student'); }}
                                                className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center justify-between transition-all shadow-sm ${isZeequeStudent === 'yes' ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-800 hover:border-primary/50 bg-slate-50/50 dark:bg-slate-900/50'}`}
                                            >
                                                <div className="text-left">
                                                    <div className="font-bold text-slate-800 dark:text-white">Yes</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">My school uses ZeeQue</div>
                                                </div>
                                                {isZeequeStudent === 'yes' && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                            <div
                                                onClick={() => { form.setValue('is_zeeque_student', 'no'); form.clearErrors('is_zeeque_student'); }}
                                                className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center justify-between transition-all shadow-sm ${isZeequeStudent === 'no' ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-800 hover:border-primary/50 bg-slate-50/50 dark:bg-slate-900/50'}`}
                                            >
                                                <div className="text-left">
                                                    <div className="font-bold text-slate-800 dark:text-white">No</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">I'm an independent student</div>
                                                </div>
                                                {isZeequeStudent === 'no' && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                        </div>
                                        {form.formState.errors.is_zeeque_student && <p className="text-center text-xs text-destructive font-bold">{form.formState.errors.is_zeeque_student.message}</p>}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Label className="text-base text-center block text-slate-700 dark:text-slate-200">
                                            {role === 'TEACHER'
                                                ? "Are you teaching at a ZeeQue partner school?"
                                                : "Is your child at a ZeeQue partner school?"}
                                        </Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div
                                                onClick={() => { form.setValue('is_partner_member', 'yes'); form.clearErrors('is_partner_member'); }}
                                                className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center justify-between transition-all shadow-sm ${isPartnerMember === 'yes' ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-800 hover:border-primary/50 bg-slate-50/50 dark:bg-slate-900/50'}`}
                                            >
                                                <div className="text-left">
                                                    <div className="font-bold text-slate-800 dark:text-white">Yes</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Using ZeeQue services</div>
                                                </div>
                                                {isPartnerMember === 'yes' && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                            <div
                                                onClick={() => { form.setValue('is_partner_member', 'no'); form.clearErrors('is_partner_member'); }}
                                                className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center justify-between transition-all shadow-sm ${form.watch('is_partner_member') === 'no' ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-800 hover:border-primary/50 bg-slate-50/50 dark:bg-slate-900/50'}`}
                                            >
                                                <div className="text-left">
                                                    <div className="font-bold text-slate-800 dark:text-white">No</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Independent / Other</div>
                                                </div>
                                                {isPartnerMember === 'no' && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                        </div>
                                        {form.formState.errors.is_partner_member && <p className="text-center text-xs text-destructive font-bold">{form.formState.errors.is_partner_member.message}</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: DETAILS */}
                        {currentStep === 2 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right duration-500">
                                {role === 'STUDENT' && isZeequeStudent === 'yes' && (
                                    <>
                                        <div className="space-y-2 text-left">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">School Name</Label>
                                            <SchoolSelector
                                                value={form.watch('school_name')}
                                                onChange={(val, schoolObj) => {
                                                    form.setValue('school_name', schoolObj ? schoolObj.original_name : val);
                                                }}
                                            />
                                            {form.formState.errors.school_name && <p className="text-xs text-destructive font-medium">{form.formState.errors.school_name.message}</p>}
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Teacher Name</Label>
                                            <Input {...form.register('teacher_name')} placeholder="Enter your teacher's name" className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800" />
                                            {form.formState.errors.teacher_name && <p className="text-xs text-destructive font-medium">{form.formState.errors.teacher_name.message}</p>}
                                        </div>
                                    </>
                                )}

                                {(role === 'TEACHER' || role === 'PARENT') && (
                                    <>
                                        <div className="space-y-2 text-left">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">{role === 'TEACHER' ? 'School Name' : "Child's School Name"}</Label>
                                            {isPartnerMember === 'yes' ? (
                                                <SchoolSelector
                                                    value={form.watch('school_name')}
                                                    onChange={(val, schoolObj) => {
                                                        form.setValue('school_name', schoolObj ? schoolObj.original_name : val);
                                                    }}
                                                />
                                            ) : (
                                                <Input {...form.register('school_name')} placeholder="Enter school name" className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800" />
                                            )}
                                            {form.formState.errors.school_name && <p className="text-xs text-destructive font-medium">{form.formState.errors.school_name.message}</p>}
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</Label>
                                            <Input
                                                {...form.register('phone_number')}
                                                onChange={(e) => form.setValue('phone_number', e.target.value.replace(/\D/g, ''))}
                                                value={form.watch('phone_number')}
                                                placeholder="05XXXXXXXX"
                                                type="tel"
                                                className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                            />
                                            {form.formState.errors.phone_number && <p className="text-xs text-destructive font-medium">{form.formState.errors.phone_number.message}</p>}
                                        </div>
                                    </>
                                )}

                                {role === 'STUDENT' && isZeequeStudent === 'no' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right duration-500">
                                        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/20 flex items-start gap-3 mb-2">
                                            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                                                Welcome! Since you're an independent student, please provide your school details below.
                                            </p>
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">School Name</Label>
                                            <Input
                                                {...form.register('school_name')}
                                                placeholder="Enter your school name"
                                                className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                                            />
                                            {form.formState.errors.school_name && <p className="text-xs text-destructive font-medium">{form.formState.errors.school_name.message}</p>}
                                        </div>
                                        <div className="space-y-2 text-left">
                                            <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</Label>
                                            <Input
                                                {...form.register('phone_number')}
                                                onChange={(e) => form.setValue('phone_number', e.target.value.replace(/\D/g, ''))}
                                                value={form.watch('phone_number')}
                                                placeholder="05XXXXXXXX"
                                                type="tel"
                                                className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
                                            />
                                            {form.formState.errors.phone_number && <p className="text-xs text-destructive font-medium">{form.formState.errors.phone_number.message}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3: PROFILE PIC */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                <div className="flex flex-col items-center justify-center space-y-6">
                                    <div className="relative group">
                                        <div className={cn(
                                            "w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-all",
                                            !imagePreview && "hover:border-primary/30"
                                        )}>
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover animate-in fade-in duration-500" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-slate-300">
                                                    <Camera className="w-12 h-12 mb-2" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Tap to add</span>
                                                </div>
                                            )}
                                        </div>

                                        <label className="absolute bottom-2 right-2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-dark hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900 z-20">
                                            <Upload className="w-6 h-6" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>

                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 w-8 h-8 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90 hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-slate-900 shadow-md z-20"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">Looking great, {username}!</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-[250px] mx-auto">
                                            {imagePreview ? "Ready to join the community? ✨" : "Add a photo to help friends recognize you."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 pt-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    className="h-12 w-16 md:w-20 rounded-xl border-slate-200"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            )}

                            {currentStep < TOTAL_STEPS ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="h-12 flex-1 rounded-xl font-bold bg-primary hover:bg-primary-dark shadow-lg shadow-primary/10 group"
                                >
                                    Next Step
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={requestSubmit}
                                    className="h-12 flex-1 rounded-xl font-bold bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Complete Profile'}
                                </Button>
                            )}
                        </div>

                        <div className="text-center">
                            <button type="button" onClick={logout} className="text-xs text-muted-foreground hover:underline">
                                Log out and try with a different account
                            </button>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
