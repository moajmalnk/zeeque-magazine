import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, Upload, Sparkles, Video, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

const submitSchema = z.object({
  authorName: z.string().min(1, "Please tell us your name!").max(50, "Name is too long"),
  teacherName: z.string().min(1, "Please tell us your teacher's name!").max(50, "Teacher name is too long"),
  schoolName: z.string().min(1, "Please tell us your school name!").max(100, "School name is too long"),
  title: z.string().min(1, "Give your work a title!").max(100, "Title is too long"),
  category: z.enum(['stories', 'poems', 'drawings', 'news', 'video', 'other']),
  content: z.string().min(10, "Tell us more! (at least 10 characters)").max(2000, "That's a lot! Try to keep it shorter"),
  videoUrl: z.union([
    z.string().url("Please enter a valid video URL"),
    z.literal(''),
  ]).optional(),
});

type SubmitFormData = z.infer<typeof submitSchema>;

const categories: Category[] = ['stories', 'poems', 'drawings', 'news', 'video', 'other'];

const categoryDescriptions: Record<Category, string> = {
  stories: 'Share your amazing adventures!',
  poems: 'Write beautiful words that rhyme!',
  drawings: 'Show us your colorful art!',
  news: 'Tell us what happened in class!',
  video: 'Share your video creations!',
  other: 'Something else you want to share!',
};

export function SubmitForm() {
  const { addPost } = usePosts();
  const { role, username, school_name } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if current user is a teacher
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

  // Effect to pre-fill teacher info if logged in as teacher
  useEffect(() => {
    if (isTeacher) {
      if (username) form.setValue('teacherName', username);
      if (school_name) form.setValue('schoolName', school_name);
    }
  }, [isTeacher, username, school_name, form]);

  const selectedCategory = form.watch('category');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image is too big! Please use a smaller one.");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video is too big! Please use a smaller one (max 100MB).");
        return;
      }
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a video file.");
        return;
      }
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onload = () => setVideoPreview(reader.result as string);
      reader.readAsDataURL(file);
      // Clear video URL if video file is selected
      form.setValue('videoUrl', '');
    }
  };

  const onSubmit = async (data: SubmitFormData) => {
    // Validate video category has either URL or file
    if (data.category === 'video' && !data.videoUrl && !selectedVideo) {
      toast.error("Please provide either a video URL or upload a video file.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    // Simulate submission (will be replaced with actual API call)
    // In a real implementation, you would upload the video file here
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create the post with all fields including teacher and school name
    addPost({
      author_name: data.authorName,
      teacher_name: data.teacherName,
      school_name: data.schoolName,
      title: data.title,
      category: data.category,
      content: data.content,
      image_url: selectedImage || undefined, // Send File as image_url for serializer mapping
      video_file: selectedVideo || undefined,
      // If we have a video URL but no file, send that.
      video_url: (!selectedVideo && data.videoUrl) ? data.videoUrl : undefined,
    });

    toast.success(
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-published flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-published-foreground" />
        </div>
        <div>
          <p className="font-semibold">{isTeacher ? "Submission Received! 🎉" : "Wonderful! 🎉"}</p>
          <p className="text-sm text-muted-foreground">
            {isTeacher
              ? `Thank you for submitting ${data.authorName}'s work.`
              : "Your work has been sent for review. A teacher will look at it soon!"
            }
          </p>
        </div>
      </div>
    );

    form.reset({
      authorName: '',
      title: '',
      content: '',
      videoUrl: '',
      // Maintain teacher info across submissions for convenience
      teacherName: isTeacher && username ? username : '',
      schoolName: isTeacher && school_name ? school_name : '',
      category: 'stories',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedVideo(null);
    setVideoPreview(null);
    setIsSubmitting(false);
  };

  return (
    <Card className="border-0 shadow-card w-full">
      <CardHeader className="text-center pb-2 px-6 pt-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
          <span className="text-3xl">🌟</span>
        </div>
        <CardTitle className="font-display text-2xl md:text-3xl">
          {isTeacher ? "Submit Student Work" : "Share Your Amazing Work!"}
        </CardTitle>
        <CardDescription className="text-base">
          {isTeacher
            ? "Upload and submit creative works on behalf of your students."
            : "We can't wait to see what you've created. Fill in the form below and a teacher will review it."
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName" className="text-base font-semibold">
              {isTeacher ? "Student Name 🎓" : "Your Name 👋"}
            </Label>
            <Input
              id="authorName"
              placeholder={isTeacher ? "Enter student's full name" : "What should we call you?"}
              {...form.register('authorName')}
              className="h-12 text-base rounded-xl"
            />
            {form.formState.errors.authorName && (
              <p className="text-sm text-destructive">{form.formState.errors.authorName.message}</p>
            )}
          </div>

          {/* Teacher Name - Hidden for Teachers, Visible for Students */}
          <div className={cn("space-y-2", isTeacher && "hidden")}>
            <Label htmlFor="teacherName" className="text-base font-semibold">
              Teacher Name 👨‍🏫
            </Label>
            <Input
              id="teacherName"
              placeholder="What's your teacher's name?"
              {...form.register('teacherName')}
              className="h-12 text-base rounded-xl"
              readOnly={isTeacher} // Extra safety
            />
            {form.formState.errors.teacherName && (
              <p className="text-sm text-destructive">{form.formState.errors.teacherName.message}</p>
            )}
          </div>

          {/* School Name - Hidden for Teachers, Visible for Students */}
          <div className={cn("space-y-2", isTeacher && "hidden")}>
            <Label htmlFor="schoolName" className="text-base font-semibold">
              School Name 🏫
            </Label>
            <Input
              id="schoolName"
              placeholder="Which school are you from?"
              {...form.register('schoolName')}
              className="h-12 text-base rounded-xl"
              readOnly={isTeacher} // Extra safety
            />
            {form.formState.errors.schoolName && (
              <p className="text-sm text-destructive">{form.formState.errors.schoolName.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              What are you sharing? 🎨
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => form.setValue('category', category)}
                  className={cn(
                    'p-4 rounded-2xl border-2 text-left transition-all duration-200 w-full',
                    selectedCategory === category
                      ? cn('border-transparent shadow-card', {
                        'bg-gradient-stories': category === 'stories',
                        'bg-gradient-poems': category === 'poems',
                        'bg-gradient-drawings': category === 'drawings',
                        'bg-gradient-news': category === 'news',
                        'bg-gradient-video': category === 'video',
                        'bg-gradient-other': category === 'other',
                      })
                      : 'border-border hover:border-primary/30 bg-background hover:bg-muted/50'
                  )}
                >
                  <span className="text-2xl mb-1 block">{categoryIcons[category]}</span>
                  <span className={cn(
                    'font-semibold block',
                    selectedCategory === category ? 'text-white' : 'text-foreground'
                  )}>
                    {categoryLabels[category]}
                  </span>
                  <span className={cn(
                    'text-xs',
                    selectedCategory === category ? 'text-white/80' : 'text-muted-foreground'
                  )}>
                    {categoryDescriptions[category]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              Give it a Title ✍️
            </Label>
            <Input
              id="title"
              placeholder="What's your work called?"
              {...form.register('title')}
              className="h-12 text-base rounded-xl"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-semibold">
              {selectedCategory === 'video' ? 'Video Description 📝' : 'Your Story, Poem, or Description 📝'}
            </Label>
            <Textarea
              id="content"
              placeholder={selectedCategory === 'video' ? "Tell us about your video..." : "Write your amazing content here..."}
              {...form.register('content')}
              className="min-h-[150px] text-base rounded-xl resize-none"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
            )}
          </div>

          {/* Video-specific fields */}
          {selectedCategory === 'video' && (
            <>
              {/* Video URL */}
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-base font-semibold">
                  Video URL 🔗
                </Label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    {...form.register('videoUrl')}
                    className="h-12 text-base rounded-xl pl-10"
                    disabled={!!selectedVideo}
                    onChange={(e) => {
                      form.setValue('videoUrl', e.target.value);
                      // Clear video file if URL is entered
                      if (e.target.value) {
                        setSelectedVideo(null);
                        setVideoPreview(null);
                      }
                    }}
                  />
                </div>
                {form.formState.errors.videoUrl && (
                  <p className="text-sm text-destructive">{form.formState.errors.videoUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Paste a link from YouTube, Vimeo, or other video platforms
                </p>
              </div>

              {/* Video File Upload */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Or Upload Video File 🎥
                </Label>
                <div className="relative">
                  {videoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black/5">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-48 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVideo(null);
                          setVideoPreview(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Video className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Tap to upload a video file
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Max 100MB (MP4, MOV, AVI)
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                        className="hidden"
                        onChange={handleVideoChange}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedVideo && `Selected: ${selectedVideo.name} (${(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)`}
                </p>
              </div>

              {/* Thumbnail/Image Upload for Video */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Video Thumbnail (Optional) 🖼️
                </Label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Thumbnail Preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground font-medium">
                        Tap to upload a thumbnail image
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Image Upload (for non-video categories) */}
          {selectedCategory !== 'video' && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                Add a Picture (Optional) 🖼️
              </Label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground font-medium">
                      Tap to upload a picture
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send for Review
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            A teacher will review your work before it appears in the magazine. 📚
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
