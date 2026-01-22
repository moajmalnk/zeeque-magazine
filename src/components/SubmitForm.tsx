import { useState, useEffect } from 'react';
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
import { Send, Upload, Sparkles, Video, ArrowRight, ArrowLeft, Star, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

// --- Form Schema ---
// Made teacher/school optional to prevent validation blocks on hidden fields.
// We will handle required logic in the UI or backend if needed.
const submitSchema = z.object({
  authorName: z.string().min(1, "What's your name?").max(50),
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
  title: z.string().min(1, "Give it a title!").max(100),
  category: z.enum(['stories', 'poems', 'drawings', 'news', 'video', 'other']),
  content: z.string().min(10, "Write a little bit more!").max(2000),
  videoUrl: z.string().url("Needs to be a valid link").optional().or(z.literal('')),
});

type SubmitFormData = z.infer<typeof submitSchema>;

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
    <div className="relative bg-white p-3 rounded-2xl rounded-bl-none shadow-[2px_2px_0px_#e5e7eb] border border-slate-100 max-w-[250px] md:max-w-sm">
      <div className="text-sm md:text-base font-bold text-slate-700 font-display leading-tight">
        {message}
      </div>
      {/* Speech bubble tail */}
      <div className="absolute -bottom-[1px] -left-1.5 w-3 h-3 bg-white border-b border-l border-slate-100 skew-x-12" />
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
  const { role, username, school_name } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 4;

  const isTeacher = role === 'TEACHER' || role === 'ADMIN';

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      authorName: '',
      teacherName: '',
      schoolName: '',
      title: '',
      category: 'stories',
      content: '',
      videoUrl: '',
    },
  });

  // Pre-fill for teachers
  useEffect(() => {
    if (isTeacher) {
      if (username) form.setValue('teacherName', username);
      if (school_name) form.setValue('schoolName', school_name);
    }
  }, [isTeacher, username, school_name, form]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof SubmitFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['authorName'];
      if (!isTeacher) fieldsToValidate.push('schoolName');
    }
    if (currentStep === 2) fieldsToValidate = ['category'];
    if (currentStep === 3) fieldsToValidate = ['title', 'content'];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("Oops! Can you check the red fields?");
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ... (Image/Video handlers omitted as they don't impact layout logic, keeping logic same)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error("Too big!"); return; }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
    if (data.category === 'video' && !data.videoUrl && !selectedVideo) {
      toast.error("Please add a video link or file!");
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
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
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-50 duration-500 px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
          <PartyPopper className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 font-display">Woohoo! 🎉</h2>
        <p className="text-base text-slate-600 mb-6 max-w-sm">
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
      <ProgressStars step={currentStep} total={TOTAL_STEPS} />

      <GuideMascot
        mood={currentStep === TOTAL_STEPS ? 'excited' : 'happy'}
        message={
          currentStep === 1 ? "Hi! Let's get started. Who are you?" :
            currentStep === 2 ? "Ooh, fun! What kind of art is this?" :
              currentStep === 3 ? "Tell me all about your masterpiece!" :
                currentStep === 4 ? isTeacher ? "Upload the files here." : "Do you have a picture or video to show?" :
                  "Almost done! Ready to send?"
        }
      />

      <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-xl rounded-[1.5rem] overflow-visible">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* STEP 1: IDENTITY */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <Label className="text-base md:text-lg font-bold text-slate-700">My Name Is...</Label>
                  <Input
                    {...form.register('authorName')}
                    placeholder="Type your name here..."
                    className="h-11 text-base rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-white"
                  />
                  {form.formState.errors.authorName && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.authorName.message}</p>}
                </div>

                {!isTeacher && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-base md:text-lg font-bold text-slate-700">I Go To School At...</Label>
                      <Input
                        {...form.register('schoolName')}
                        placeholder="My School Name"
                        className="h-11 text-base rounded-xl border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all bg-white"
                      />
                      {form.formState.errors.schoolName && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.schoolName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base md:text-lg font-bold text-slate-700">My Teacher Is...</Label>
                      <Input
                        {...form.register('teacherName')}
                        placeholder="My Teacher's Name"
                        className="h-11 text-base rounded-xl border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all bg-white"
                      />
                      {form.formState.errors.teacherName && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.teacherName.message}</p>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 2: CATEGORY */}
            {currentStep === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-right duration-500">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => form.setValue('category', cat)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 aspect-[4/3] w-full",
                      form.watch('category') === cat
                        ? "border-primary bg-primary/5 scale-105 shadow-sm -translate-y-0.5"
                        : "border-slate-100 bg-white hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5"
                    )}
                  >
                    <span className="text-3xl mb-1 filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">{categoryIcons[cat]}</span>
                    <span className="font-bold text-sm text-slate-700">{categoryLabels[cat]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 3: DETAILS */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in slide-in-from-right duration-500">
                <div className="space-y-2">
                  <Label className="text-base md:text-lg font-bold text-slate-700">My Title</Label>
                  <Input
                    {...form.register('title')}
                    placeholder="The Magical Adventure..."
                    className="h-11 text-base rounded-xl border-slate-200 bg-white"
                  />
                  {form.formState.errors.title && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-base md:text-lg font-bold text-slate-700">My Story</Label>
                  <Textarea
                    {...form.register('content')}
                    placeholder="Once upon a time..."
                    className="min-h-[120px] text-base rounded-xl border-slate-200 p-4 leading-relaxed bg-white"
                  />
                  {form.formState.errors.content && <p className="text-red-500 font-bold ml-2 text-sm">⚠️ {form.formState.errors.content.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 4: UPLOAD */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in slide-in-from-right duration-500">
                {form.watch('category') === 'video' ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <Label className="text-base font-bold mb-2 block">Video Link 🔗</Label>
                      <Input
                        {...form.register('videoUrl')}
                        placeholder="https://youtube.com/..."
                        className="h-11 text-base rounded-xl bg-white"
                      />
                    </div>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer">
                      <input type="file" onChange={handleVideoChange} accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Video className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-base font-bold text-slate-600">
                        {selectedVideo ? "Video Selected! 🎥" : "Or Click to Upload Video"}
                      </p>
                      {selectedVideo && <p className="text-primary font-bold mt-1 text-sm">{selectedVideo.name}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors text-center cursor-pointer group">
                    <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-md rotate-1" />
                        <p className="mt-3 text-base font-bold text-green-500">Looks great! 🌟</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-lg font-bold text-slate-600 mb-1">Add a Picture?</p>
                        <p className="text-sm text-slate-400">Click here to upload your drawing or photo!</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex gap-3 pt-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="h-11 px-5 rounded-xl text-base font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
              )}

              <Button
                type={currentStep < TOTAL_STEPS ? "button" : "submit"}
                onClick={currentStep < TOTAL_STEPS ? handleNext : undefined}
                disabled={isSubmitting}
                className={`flex-1 h-11 rounded-xl text-base font-bold transition-all shadow-md ${currentStep < TOTAL_STEPS
                  ? "bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02] shadow-slate-200"
                  : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 hover:scale-[1.02] shadow-primary/25"}`}
              >
                {currentStep < TOTAL_STEPS
                  ? <>Next Step <ArrowRight className="ml-2 w-4 h-4" /></>
                  : (isSubmitting ? <><Sparkles className="animate-spin mr-2" /> Sending...</> : <><PartyPopper className="mr-2" /> Finish & Send!</>)
                }
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      <div className="text-center mt-6 opacity-60">
        <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Step {currentStep} of {TOTAL_STEPS}</p>
      </div>
    </div>
  );
}
