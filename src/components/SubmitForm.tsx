import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, Upload, Sparkles, Video, ArrowRight, ArrowLeft, Star, PartyPopper, X, Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import imageCompression from 'browser-image-compression';
import { Command as CommandPrimitive } from "cmdk";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { SchoolSelector } from '@/components/SchoolSelector';

// --- Form Schema ---
// Made teacher/school optional to prevent validation blocks on hidden fields.
// We will handle required logic in the UI or backend if needed.
const contentMinMessages: Record<Category, string> = {
  stories: 'Write a little bit more! Your story is worth it!',
  poems: 'Write a little bit more! Your poem deserves it!',
  drawings: 'Write a little bit more! Tell us more about your drawing!',
  news: 'Write a little bit more! Add a few more details to your article!',
  video: 'Write a little bit more! Tell us more about your video!',
  other: 'Write a little bit more! We would love to hear more!',
};

const contentHintMessages: Record<Category, (remaining: number) => string> = {
  stories: (n) => `Just ${n} more letters to go... ✍️`,
  poems: (n) => `Just ${n} more letters for your poem... ✍️`,
  drawings: (n) => `Just ${n} more characters — describe your drawing! ✍️`,
  news: (n) => `Just ${n} more characters for your article... ✍️`,
  video: (n) => `Just ${n} more characters about your video... ✍️`,
  other: (n) => `Just ${n} more characters to go... ✍️`,
};

const submitSchema = z.object({
  authorName: z.string().min(1, "What's your name?").max(50),
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  title: z.string().min(1, "Give it a title!").max(100),
  category: z.enum(['stories', 'poems', 'drawings', 'news', 'video', 'other']),
  content: z.string().max(2000),
  videoUrl: z.string().url("Needs to be a valid link").optional().or(z.literal('')),
}).refine(
  (data) => data.content.length >= 20,
  (data) => ({
    message: contentMinMessages[data.category],
    path: ['content'],
  }),
);

type SubmitFormData = z.infer<typeof submitSchema>;

const IMAGE_UPLOAD_ID = 'submit-image-upload';
const VIDEO_UPLOAD_ID = 'submit-video-upload';

const isImageFile = (file: File) =>
  file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|heic|heif|bmp|svg)$/i.test(file.name);

const compressImageWithTimeout = async (file: File, timeoutMs = 12000): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type || 'image/jpeg',
  };

  try {
    return await Promise.race([
      imageCompression(file, options),
      new Promise<File>((_, reject) =>
        setTimeout(() => reject(new Error('compression-timeout')), timeoutMs)
      ),
    ]);
  } catch (firstError) {
    try {
      return await imageCompression(file, { ...options, useWebWorker: false });
    } catch {
      throw firstError;
    }
  }
};

const categories: Category[] = ['stories', 'poems', 'drawings', 'news', 'video', 'other'];

// --- Helper Components ---

// 1. The 3D Guide Character
const GuideMascot = ({ mood = 'happy', message }: { mood?: 'happy' | 'thinking' | 'excited', message: string }) => (
  <div className="flex items-end gap-3 mb-4 animate-in slide-in-from-bottom duration-500">
    <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0 animate-bounce-gentle">
      {/* Fallback to Emoji if image fails, or use project mascot */}
      <img src="/images/mascot1.png" alt="Guide" className="w-full h-full object-contain filter drop-shadow-md"
        onError={(e) => (e.currentTarget.src = 'https://em-content.zobj.net/source/microsoft-teams/337/robot_1f916.png')} />
    </div>
    <div className="relative bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-[2px_2px_0px_#e5e7eb] dark:shadow-none border border-slate-100 dark:border-slate-700 max-w-[250px] md:max-w-sm">
      <div className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-100 font-display leading-tight">
        {message}
      </div>
      {/* Speech bubble tail */}
      <div className="absolute -bottom-[1px] -left-1.5 w-3 h-3 bg-white dark:bg-slate-800 border-b border-l border-slate-100 dark:border-slate-700 skew-x-12" />
    </div>
  </div>
);

// 2. Progress Stars
const ProgressStars = ({ step, total }: { step: number, total: number }) => (
  <div className="flex gap-1.5 justify-center mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`transition-all duration-500 ${i < step ? 'scale-110' : 'scale-100 opacity-30 grayscale'}`}>
        <Star className={`w-5 h-5 md:w-6 md:h-6 fill-yellow-400 text-yellow-500 drop-shadow-sm ${i < step ? 'animate-pulse' : ''}`} />
      </div>
    ))}
  </div>
);

export function SubmitForm() {
  const { addPost } = usePosts();
  const { role, username, school_name, teacher_name, phone_number, email, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 5;

  // Role Selection State
  const [userType, setUserType] = useState<'student' | 'teacher' | 'parent' | null>(null);
  const [isZeeQue, setIsZeeQue] = useState<boolean | null>(null);

  const isTeacher = ['TEACHER', 'ADMIN', 'EDITORIAL', 'SCHOOL'].includes(role || '');

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      authorName: '',
      teacherName: '',
      schoolName: '',
      email: '',
      phoneNumber: '',
      title: '',
      category: 'stories',
      content: '',
      videoUrl: '',
    },
  });

  // Pre-fill and Auto-Skip Logic for Authenticated Users
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      // 1. Force Role/Identity status
      setIsZeeQue(true);
      if (role === 'STUDENT') setUserType('student');
      else if (['TEACHER', 'ADMIN', 'EDITORIAL', 'SCHOOL'].includes(role || '')) setUserType('teacher');
      else if (role === 'PARENT') setUserType('parent');

      // 2. Pre-fill form values
      if (username) form.setValue('authorName', username || '');
      if (school_name) form.setValue('schoolName', school_name || '');

      if (['TEACHER', 'ADMIN'].includes(role || '')) {
        form.setValue('teacherName', username || '');
      } else if (teacher_name) {
        form.setValue('teacherName', teacher_name);
      }

      if (email) form.setValue('email', email || '');
      if (phone_number) form.setValue('phoneNumber', phone_number || '');

      // 3. SECURE JUMP: Always ensure authenticated users are at least on Step 3
      if (currentStep < 3) {
        setCurrentStep(3);
      }
    }
  }, [isAuthenticated, isAuthLoading, role, username, school_name, teacher_name, phone_number, email, form, currentStep]);

  // --- PERSISTENCE LOGIC ---
  const STORAGE_KEY = 'zeeque_submit_form_state';

  // 1. Load data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only restore if valid
        if (parsed.step) {
          // If authenticated, we MUST be at least on step 3. 
          if (isAuthenticated && parsed.step < 3) {
            setCurrentStep(3);
          } else {
            setCurrentStep(parsed.step);
          }
        }
        if (parsed.userType) setUserType(parsed.userType);
        if (parsed.isZeeQue !== undefined) setIsZeeQue(parsed.isZeeQue);
        if (parsed.formData) {
          const currentValues = form.getValues();
          form.reset({ ...currentValues, ...parsed.formData });
        }
        toast.info("Welcome back! We restored your progress.", { duration: 3000, icon: '📂' });
      } catch (error) {
        console.error("Error restoring form state:", error);
      }
    }
  }, [isAuthenticated]); // Sync with auth state 


  // 2. Save data on change
  useEffect(() => {
    const saveData = () => {
      const data = {
        step: currentStep,
        userType,
        isZeeQue,
        formData: form.getValues()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    // Save immediately on step/role change
    saveData();

    // Subscribe to form changes
    const subscription = form.watch(() => saveData());
    return () => subscription.unsubscribe();
  }, [currentStep, userType, isZeeQue, form]);
  // -------------------------

  const handleNext = async () => {
    let fieldsToValidate: (keyof SubmitFormData)[] = [];

    // Step 1: Role Selection (No form validation needed, handled by UI state)
    if (currentStep === 1) {
      if (!userType || isZeeQue === null) {
        toast.error("Please tell us who you are!");
        return;
      }
      setCurrentStep(2);
      return;
    }

    // Step 2: Identity (Old Step 1)
    if (currentStep === 2) {
      // Common field
      let fieldsToValidate: (keyof SubmitFormData)[] = ['authorName'];

      const isAuthorValid = await form.trigger('authorName');
      if (!isAuthorValid) {
        toast.error("Please enter your name");
        return;
      }

      if (isZeeQue) {
        // ZeeQue User: Require School & Teacher
        const values = form.getValues();
        let hasError = false;

        if (!values.schoolName?.trim()) {
          form.setError('schoolName', { type: 'manual', message: 'School name is required' });
          hasError = true;
        }
        if (!values.teacherName?.trim()) {
          form.setError('teacherName', { type: 'manual', message: 'Teacher name is required' });
          hasError = true;
        }

        if (hasError) {
          toast.error("Please fill in your school and teacher details");
          return;
        }
      } else {
        // Guest User: Require Email & Phone
        const values = form.getValues();
        let hasError = false;

        // Manual validation for email format if z.string().email() isn't strictly enforced in schema yet
        // But we will add it to schema as optional() so trigger works if we want, or manual.
        // Let's rely on manual check for empty first, then schema format if provided.

        if (!values.email?.trim()) {
          form.setError('email', { type: 'manual', message: 'Email is required' });
          hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          form.setError('email', { type: 'manual', message: 'Invalid email address' });
          hasError = true;
        }

        if (!values.phoneNumber?.trim()) {
          form.setError('phoneNumber', { type: 'manual', message: 'Phone number is required' });
          hasError = true;
        }

        if (hasError) {
          toast.error("Please fill in your contact details");
          return;
        }
      }
    }

    if (currentStep === 3) fieldsToValidate = ['category'];
    if (currentStep === 4) fieldsToValidate = ['title', 'content'];

    // For step 3 & 4
    if (currentStep > 2) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) {
        toast.error("Oops! Can you check the red fields?");
        return;
      }
    }

    // Move to next step
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    // If authenticated, don't let them go back to role/identity steps
    if (isAuthenticated) {
      if (currentStep <= 3) return;
      setCurrentStep((prev) => Math.max(prev - 1, 3));
      return;
    }

    if (currentStep === 1) {
      if (userType) {
        setUserType(null); // Go back to role selection
        setIsZeeQue(null);
      }
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ... (Image/Video handlers omitted as they don't impact layout logic, keeping logic same)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error('Please choose an image file (JPG, PNG, WEBP, etc.).');
      e.target.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File is too large! Please choose an image under 20MB.');
      e.target.value = '';
      return;
    }

    const loadingToast = toast.loading('Preparing your image...');

    try {
      let readyFile: File = file;
      try {
        readyFile = await compressImageWithTimeout(file);
      } catch (compressError) {
        console.warn('Image compression skipped, using original file:', compressError);
        readyFile = file;
      }

      setSelectedImage(readyFile);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.onerror = () => {
        setImagePreview(null);
        toast.error('Could not preview this image, but it is ready to send.');
      };
      reader.readAsDataURL(readyFile);

      toast.dismiss(loadingToast);
      toast.success('Image ready!');
    } catch (error) {
      console.error('Image processing error:', error);
      toast.dismiss(loadingToast);
      toast.error('Could not process this image. Try another.');
      e.target.value = '';
    }
  };

  const clearSelectedImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const clearSelectedVideo = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedVideo(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { toast.error("Video is too large (max 100MB)"); return; }
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onload = () => setVideoPreview(reader.result as string);
      reader.readAsDataURL(file);
      form.setValue('videoUrl', '');
    }
  };

  const onSubmit = async (data: SubmitFormData) => {
    // PREVENT PREMATURE SUBMISSION:
    if (currentStep < TOTAL_STEPS) {
      handleNext();
      return;
    }

    if (data.category === 'video' && !data.videoUrl && !selectedVideo) {
      toast.error("Please add a video link or file!");
      return;
    }

    if (data.category === 'drawings' && !selectedImage) {
      toast.error("Please upload your artwork before sending!");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      await addPost({
        author_name: data.authorName,
        teacher_name: data.teacherName,
        school_name: data.schoolName,
        title: data.title,
        category: data.category,
        content: data.content,
        image_url: selectedImage || undefined,
        video_file: selectedVideo || undefined,
        video_url: (!selectedVideo && data.videoUrl) ? data.videoUrl : undefined,
      });

      // Clear saved progress on success
      localStorage.removeItem(STORAGE_KEY);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Submission error:", error);
      const msg = error.response?.data?.detail
        || (typeof error.response?.data === 'object' ? Object.values(error.response.data).flat().join(', ') : '')
        || "Something went wrong! Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mascotMessage = useMemo(() => {
    const name = form.watch('authorName') || username || '';
    const firstName = name.split(' ')[0];
    const cat = form.watch('category');

    switch (currentStep) {
      case 1:
        if (isAuthenticated) return `Hi ${firstName}! Ready to share something amazing today?`;
        return userType ? "Are you part of the ZeeQue family?" : "Hi! Let's get started. Who are you?";
      case 2:
        return `Nice to meet you, ${firstName}! Let's make sure we have your details correctly.`;
      case 3:
        if (isAuthenticated) return `Great to see you, ${firstName}! What kind of project are we working on today?`;
        return "Excellent! Now, what kind of masterpiece are we sharing?";
      case 4:
        if (cat === 'stories') return "We're so excited to read your story! Share your wonderful imagination with us.";
        if (cat === 'poems') return "A poem? How wonderful! Let's see those beautiful words.";
        if (cat === 'drawings') return "A drawing! I bet it looks amazing. Tell me about it!";
        if (cat === 'news') return "Extra! Extra! Tell us what's happening!";
        if (cat === 'video') return "Lights, camera, action! Tell us about your video.";
        return "Tell me all about your masterpiece!";
      case 5:
        if (cat === 'drawings') return "Almost there! Upload a photo of your drawing.";
        if (cat === 'poems') return "Want to add a picture with your poem?";
        if (cat === 'video') return "Add your video link or upload a file.";
        return isTeacher ? "Almost there! Add a picture if you have one." : "Do you have a picture to show us?";
      default:
        return "Almost done! Ready to send it to the world?";
    }
  }, [currentStep, userType, username, isAuthenticated, isTeacher, form.watch('authorName'), form.watch('category')]);

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Skeleton className="w-16 h-16 rounded-full mb-4" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-50 duration-500 px-4">
        <div className="w-32 h-32 mb-6 animate-bounce">
          <img
            src="/images/mascot1.png"
            alt="Success!"
            className="w-full h-full object-contain filter drop-shadow-xl"
          />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-2 font-display">Woohoo! 🎉</h2>
        <p className="text-base text-slate-600 dark:text-slate-300 mb-6 max-w-sm">
          Great job, {form.getValues('authorName')}! Your amazing work has been sent to the teachers.
        </p>
        <Button onClick={() => window.location.reload()} size="lg" variant="hero" className="rounded-full px-8 text-lg h-12">
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md md:max-w-2xl mx-auto px-4 md:px-0">
      <ProgressStars
        step={(isAuthenticated && !isAuthLoading) ? currentStep - 2 : currentStep}
        total={(isAuthenticated && !isAuthLoading) ? TOTAL_STEPS - 2 : TOTAL_STEPS}
      />

      <GuideMascot
        mood={currentStep === TOTAL_STEPS ? 'excited' : 'happy'}
        message={mascotMessage}
      />

      <Card className="border-0 shadow-sm bg-white backdrop-blur-xl rounded-2xl overflow-visible dark:bg-slate-900/80 dark:border dark:border-slate-800">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* STEP 1: ROLE SELECTION */}
            {currentStep === 1 && (
              <div className="animate-in slide-in-from-right duration-500">
                {!userType ? (
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType('student')}
                      className="flex items-center p-4 rounded-xl border-2 border-slate-100 hover:border-primary/50 hover:bg-primary/5 transition-all text-left gap-4 group bg-white dark:bg-slate-800 dark:border-slate-700 w-full"
                    >
                      <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">🎓</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">I am a Student</h3>
                        <p className="text-sm text-slate-500">I want to share my work</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserType('teacher')}
                      className="flex items-center p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left gap-4 group bg-white dark:bg-slate-800 dark:border-slate-700 w-full"
                    >
                      <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">👩‍🏫</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">I am a Teacher</h3>
                        <p className="text-sm text-slate-500">Submitting for my class</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserType('parent')}
                      className="flex items-center p-4 rounded-xl border-2 border-slate-100 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left gap-4 group bg-white dark:bg-slate-800 dark:border-slate-700 w-full"
                    >
                      <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">👨‍👩‍👧</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">I am a Parent</h3>
                        <p className="text-sm text-slate-500">Submitting for my child</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-right duration-300">
                    <button
                      type="button"
                      onClick={() => { setIsZeeQue(true); setCurrentStep(2); }}
                      className="flex items-center p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-left gap-4 group w-full shadow-sm hover:shadow-md"
                    >
                      <div className="h-14 w-14 rounded-full bg-white text-primary shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="text-3xl">✨</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-primary">I am a ZeeQue {userType.charAt(0).toUpperCase() + userType.slice(1)}</h3>
                        <p className="text-base text-primary/70">I have a verified account</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setIsZeeQue(false); setCurrentStep(2); }}
                      className="flex items-center p-6 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all text-left gap-4 group bg-white dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 w-full"
                    >
                      <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform dark:bg-slate-900">
                        <span className="text-3xl">🌍</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-slate-700 dark:text-slate-200">I am not a ZeeQue {userType.charAt(0).toUpperCase() + userType.slice(1)}</h3>
                        <p className="text-base text-slate-500">I am a guest user</p>
                      </div>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setUserType(null)}
                      className="mt-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Role Selection
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: IDENTITY (Old Step 1) */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <Label className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200">My Name Is...</Label>
                  <Input
                    {...form.register('authorName')}
                    placeholder="Type your name here..."
                    className="h-11 text-base rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-background dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  />
                  {form.formState.errors.authorName && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.authorName.message}</p>}
                </div>

                {isZeeQue ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200">I Go To School At...</Label>
                      <SchoolSelector
                        value={form.watch('schoolName')}
                        onChange={(val, schoolObj) => {
                          form.setValue('schoolName', schoolObj ? schoolObj.original_name : val);
                        }}
                      />
                      {form.formState.errors.schoolName && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.schoolName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200">My Teacher Is...</Label>
                      <Input
                        {...form.register('teacherName')}
                        placeholder="My Teacher's Name"
                        className="h-11 text-base rounded-xl border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all bg-background dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                      />
                      {form.formState.errors.teacherName && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.teacherName.message}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200">My Email Is...</Label>
                      <Input
                        {...form.register('email')}
                        type="email"
                        placeholder="example@email.com"
                        className="h-11 text-base rounded-xl border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all bg-background dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                      />
                      {/* Note: TypeScript might complain if 'email' is not in SubmitFormData. I handled the schema update above, so inference should work. */}
                      {(form.formState.errors as any).email && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {(form.formState.errors as any).email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200">My Phone Number Is...</Label>
                      <Input
                        {...form.register('phoneNumber')}
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="h-11 text-base rounded-xl border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-background dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                      />
                      {(form.formState.errors as any).phoneNumber && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {(form.formState.errors as any).phoneNumber.message}</p>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 3: CATEGORY (Old Step 2) */}
            {currentStep === 3 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-right duration-500">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => form.setValue('category', cat)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 aspect-[4/3] w-full",
                      form.watch('category') === cat
                        ? "border-primary bg-primary/5 dark:bg-primary/20 scale-105 shadow-sm -translate-y-0.5"
                        : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5"
                    )}
                  >
                    <span className="text-3xl mb-1 filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">{categoryIcons[cat]}</span>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{categoryLabels[cat]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 4: DETAILS (Old Step 3) */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <Label className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200">
                    {(() => {
                      const cat = form.watch('category');
                      if (cat === 'poems') return 'Name of your Poem';
                      if (cat === 'drawings') return 'Title of your Artwork';
                      if (cat === 'news') return 'Headline';
                      if (cat === 'other') return 'Title of your Creation';
                      return 'My Title';
                    })()}
                  </Label>
                  <Input
                    {...form.register('title')}
                    placeholder={(() => {
                      const cat = form.watch('category');
                      if (cat === 'poems') return 'The Dancing Leaves...';
                      if (cat === 'drawings') return 'Sunset over the Hills...';
                      if (cat === 'news') return 'Class 5 Wins the Trophy!';
                      if (cat === 'other') return 'My Amazing Project...';
                      return 'The Magical Adventure...';
                    })()}
                    className="h-11 text-base rounded-xl border-slate-200 bg-background dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  />
                  {form.formState.errors.title && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-base md:text-lg font-bold text-slate-700 dark:text-slate-200">
                    {(() => {
                      const cat = form.watch('category');
                      if (cat === 'poems') return 'Your Poem';
                      if (cat === 'drawings') return 'Tell us about your drawing';
                      if (cat === 'news') return 'The News Story';
                      if (cat === 'video') return 'Video Description';
                      if (cat === 'other') return 'Tell us about your creation';
                      return 'My Story';
                    })()}
                  </Label>
                  <div className="relative">
                    <Textarea
                      {...form.register('content')}
                      placeholder={(() => {
                        const cat = form.watch('category');
                        if (cat === 'poems') return 'Roses are red...';
                        if (cat === 'drawings') return 'I used watercolors to paint...';
                        if (cat === 'news') return 'Today in our school...';
                        if (cat === 'video') return 'In this video, I will show...';
                        if (cat === 'other') return 'This is a project about...';
                        return 'Once upon a time...';
                      })()}
                      className="min-h-[120px] text-base rounded-xl border-slate-200 p-4 leading-relaxed bg-background dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                      <div className="text-sm">
                        {form.formState.errors.content ? (
                          <p className="text-red-500 font-bold">⚠️ {form.formState.errors.content.message}</p>
                        ) : (
                          (form.watch('content')?.length || 0) < 20 && (
                            <p className="text-amber-500 font-medium text-xs animate-pulse">
                              {contentHintMessages[form.watch('category')](20 - (form.watch('content')?.length || 0))}
                            </p>
                          )
                        )}
                      </div>
                      <div className={cn(
                        "text-xs font-mono font-medium px-2 py-1 rounded-full border",
                        (form.watch('content')?.length || 0) >= 20
                          ? "text-slate-500 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          : "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50"
                      )}>
                        {(form.watch('content')?.length || 0)} / 2000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: UPLOAD (Old Step 4) */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-in slide-in-from-right duration-500">
                {form.watch('category') === 'video' ? (
                  <Tabs defaultValue="link" onValueChange={(val) => {
                    if (val === 'link') {
                      setSelectedVideo(null);
                      setVideoPreview(null);
                    } else {
                      form.setValue('videoUrl', '');
                    }
                  }} className="w-full animate-in slide-in-from-right duration-500">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <TabsTrigger value="link" className="rounded-lg text-base h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        Share a Link 🔗
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="rounded-lg text-base h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                        Upload File 🎥
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="mt-0 space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <Label className="text-base font-bold mb-3 block dark:text-slate-200">Paste your video link here:</Label>
                        <Input
                          {...form.register('videoUrl')}
                          placeholder="https://youtube.com/..."
                          className="h-12 text-base rounded-xl bg-background dark:bg-slate-800 dark:border-slate-700 dark:text-white border-2 focus:border-primary/50"
                        />
                        <p className="text-sm text-slate-500 mt-2 ml-1">Supports YouTube, Vimeo, etc.</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" className="mt-0 space-y-4">
                      <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center group">
                        <input
                          ref={videoInputRef}
                          id={VIDEO_UPLOAD_ID}
                          type="file"
                          onChange={handleVideoChange}
                          accept="video/*"
                          className="hidden"
                          aria-label="Upload video file"
                        />
                        {selectedVideo ? (
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                              <Video className="w-8 h-8 text-primary" />
                            </div>
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 inline-flex items-center gap-2 max-w-full">
                              <Check className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-primary font-medium truncate text-sm">{selectedVideo.name}</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <label
                                htmlFor={VIDEO_UPLOAD_ID}
                                className="inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground"
                              >
                                Change video
                              </label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="rounded-full text-destructive hover:text-destructive"
                                onClick={clearSelectedVideo}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor={VIDEO_UPLOAD_ID}
                            className="block w-full cursor-pointer text-center"
                          >
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                              <Video className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">
                              Click to Upload Video
                            </p>
                            <p className="text-sm text-slate-500 mb-4">Max size 100MB</p>
                          </label>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center group overflow-hidden">
                    <input
                      ref={imageInputRef}
                      id={IMAGE_UPLOAD_ID}
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*,.heic,.heif"
                      className="hidden"
                      aria-label="Upload artwork image"
                    />
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-xl shadow-lg rotate-1 border-4 border-white dark:border-slate-700"
                        />
                        <p className="text-base font-bold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 inline-block px-3 py-1 rounded-full border border-green-100 dark:border-green-800">
                          Image ready to send
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <label
                            htmlFor={IMAGE_UPLOAD_ID}
                            className="inline-flex h-9 items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          >
                            Change image
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-destructive hover:text-destructive"
                            onClick={clearSelectedImage}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor={IMAGE_UPLOAD_ID}
                        className="block w-full cursor-pointer text-center"
                      >
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-200 mb-1">
                          {(() => {
                            const cat = form.watch('category');
                            if (cat === 'drawings') return 'Upload your Artwork';
                            if (cat === 'poems') return 'Add an illustration (Optional)';
                            return 'Add a Picture?';
                          })()}
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">
                          {(() => {
                            const cat = form.watch('category');
                            if (cat === 'drawings') return 'Tap here to choose a photo of your drawing';
                            if (cat === 'poems') return 'Upload a photo of your poem or a drawing!';
                            return 'Click here if you have a picture to go with it!';
                          })()}
                        </p>
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4 pt-6">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-xl text-base font-bold text-slate-500 bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 hover:text-slate-700 hover:border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
              ) : (
                <div className="hidden"></div> // Hide back button on First step (handled differently inside step 1 if needed, but visually we hide the main nav actions for Step 1 as it has its own buttons)
              )}

              {currentStep > 1 && (
                <Button
                  key={`btn-step-${currentStep}`}
                  type={currentStep < TOTAL_STEPS ? "button" : "submit"}
                  onClick={currentStep < TOTAL_STEPS ? handleNext : undefined}
                  disabled={isSubmitting}
                  className={`flex-1 h-12 rounded-xl text-base font-bold transition-all shadow-md active:scale-95 ${currentStep < TOTAL_STEPS
                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] shadow-xl shadow-slate-400/20 dark:shadow-black/40 dark:bg-primary dark:hover:bg-primary/90"
                    : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 hover:scale-[1.02] shadow-primary/25"}`}
                >
                  {currentStep < TOTAL_STEPS
                    ? <>Next Step <ArrowRight className="ml-2 w-4 h-4" /></>
                    : (isSubmitting ? <><Sparkles className="animate-spin mr-2" /> Sending...</> : <><PartyPopper className="mr-2" /> Finish & Send!</>)
                  }
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>

      <div className="text-center mt-6 opacity-60">
        <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
          Step {(isAuthenticated && !isAuthLoading) ? currentStep - 2 : currentStep} of {(isAuthenticated && !isAuthLoading) ? TOTAL_STEPS - 2 : TOTAL_STEPS}
        </p>
      </div>
    </div>
  );
}
