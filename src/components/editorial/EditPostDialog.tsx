import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Post, Category, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Upload, X, ImageIcon, Video, Check, ChevronsUpDown, Search, Sparkles, User, School, GraduationCap, PenLine, FileText, Link as LinkIcon, Grid3x3, Hash, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Command as CommandPrimitive } from "cmdk";
import { SchoolSelector } from '@/components/SchoolSelector';

// --- Helper: School Selector (Matching SubmitForm for consistency) ---

const editPostSchema = z.object({
  authorName: z.string().min(1, "Please enter a name!").max(50, "Name is too long"),
  teacherName: z.string().optional().or(z.literal('')),
  schoolName: z.string().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  title: z.string().min(1, "Please enter a title!").max(100, "Title is too long"),
  category: z.enum(['stories', 'poems', 'drawings', 'news', 'video', 'other']),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content is too long"),
  schoolCode: z.string().optional().or(z.literal('')),
  videoUrl: z.union([
    z.string().url("Please enter a valid video URL"),
    z.literal(''),
  ]).optional(),
});

type EditPostFormData = z.infer<typeof editPostSchema>;

const categories: Category[] = ['stories', 'poems', 'drawings', 'news', 'video', 'other'];

interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (postId: string, updates: Partial<Post>) => void;
}

export function EditPostDialog({ post, open, onOpenChange, onSave }: EditPostDialogProps) {
  const [isManualSchoolMode, setIsManualSchoolMode] = useState(false);

  const form = useForm<EditPostFormData>({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      authorName: post.author_name,
      teacherName: post.teacher_name || '',
      schoolName: post.school_name || '',
      schoolCode: post.school_code || '',
      phoneNumber: post.phone_number || '',
      title: post.title,
      category: post.category,
      content: post.content,
      videoUrl: post.video_url || '',
    },
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(post.image_url || post.image || null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [mediaTab, setMediaTab] = useState<string>(post.video_file ? 'upload' : 'link');

  // Reset form when post changes
  useEffect(() => {
    if (open && post) {
      form.reset({
        authorName: post.author_name,
        teacherName: post.teacher_name || '',
        schoolName: post.school_name || '',
        schoolCode: post.school_code || '',
        phoneNumber: post.phone_number || '',
        title: post.title,
        category: post.category,
        content: post.content,
        videoUrl: post.video_url || '',
      });
      setSelectedVideo(null);
      setVideoPreview(null);
      setPreviewUrl(post.image_url || post.image || null);
      setMediaTab(post.video_file ? 'upload' : 'link');

      // Initialize manual mode
      const role = post.author_role?.toUpperCase();
      if (role !== 'SCHOOL') {
        const isKnown = schoolsData.some(s => s.original_name === post.school_name || s.code === post.school_code);
        setIsManualSchoolMode(!isKnown && !!post.school_name);
      } else {
        setIsManualSchoolMode(false);
      }
    }
  }, [open, post, form]);

  const selectedCategory = form.watch('category');

  const displayConfig = useMemo(() => {
    const role = post.author_role?.toUpperCase();
    const isSchool = role === 'SCHOOL';
    const isTeacher = role === 'TEACHER' || role === 'ADMIN';
    const isEditorial = role === 'EDITORIAL';
    const isParent = role === 'PARENT';
    const isNews = selectedCategory === 'news';

    return {
      showTeacher: !isSchool && !isEditorial && !isParent,
      showAuthor: !isSchool,
      showSchool: !isParent && !isEditorial,
      showPhone: isParent,
      isSchool,
      isParent,
      labels: {
        author: isParent ? "Parent Name 👪" : isNews ? "Reporter Name 👋" : isTeacher ? "Teacher Name 👨‍🏫" : "Student Name 👋",
        teacher: isTeacher ? "Assigned Classroom / Subject 🏫" : "Teacher Name 👨‍🏫",
        school: isSchool ? "Identifying Institution 🏫" : "School Name 🏫",
        title: isNews ? "Headline 📣" : selectedCategory === 'poems' ? "Poem Title ✨" : selectedCategory === 'drawings' ? "Artwork Title 🎨" : "Post Title ✏️",
        content: isNews ? "News Story 📝" : selectedCategory === 'poems' ? "Your poem 📖" : selectedCategory === 'drawings' ? "About your artwork 🖌️" : "Post Content 📝",
      },
      icons: {
        section: (isSchool || isParent) ? <School className="w-4 h-4 text-primary opacity-50" /> : <User className="w-4 h-4 text-primary opacity-50" />
      }
    };
  }, [selectedCategory, post.author_role]);

  const onSubmit = (data: EditPostFormData) => {
    // If it's a school account, the author name is the school name
    let finalAuthorName = data.authorName;
    if (displayConfig.isSchool) {
      finalAuthorName = data.schoolName;
    }

    const updates: any = {
      author_name: finalAuthorName,
      teacher_name: data.teacherName,
      school_name: data.schoolName,
      school_code: data.schoolCode,
      phone_number: data.phoneNumber,
      title: data.title,
      category: data.category,
      content: data.content,
      video_url: data.videoUrl || undefined,
      video_file: selectedVideo || undefined,
    };

    if (data.category === 'video') {
      if (mediaTab === 'link') {
        updates.video_file = null;
        updates.video_url = data.videoUrl;
      } else if (mediaTab === 'upload') {
        updates.video_url = null;
      }
    }

    if (selectedImage) {
      updates.image_url = selectedImage;
    } else if ((post.image_url || post.image) && !previewUrl) {
      updates.image_url = null;
    }

    onSave(post.id, updates);

    toast.success('Post updated successfully!', {
      description: `"${data.title}" has been updated`,
      duration: 3000,
    });

    onOpenChange(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'stories': return 'from-indigo-500 via-purple-500 to-pink-500';
      case 'poems': return 'from-rose-400 via-fuchsia-500 to-indigo-500';
      case 'drawings': return 'from-emerald-400 via-teal-500 to-cyan-500';
      case 'news': return 'from-orange-400 via-amber-500 to-yellow-500';
      case 'video': return 'from-blue-500 via-indigo-600 to-violet-600';
      default: return 'from-slate-500 via-gray-500 to-zinc-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        noContentWrapper
        hideCloseButton
        aria-describedby={undefined}
        className="max-w-[1100px] w-[95vw] h-[85vh] md:h-[80vh] p-0 border-0 !rounded-[2rem] bg-white dark:bg-black shadow-2xl overflow-hidden flex flex-col z-[100] outline-none"
      >
        <DialogTitle className="sr-only">Edit Creation</DialogTitle>
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left: Branding & Preview (Mobile: Hidden or small) */}
          <div className={cn(
            "relative w-full md:w-[40%] h-[200px] md:h-full shrink-0 flex flex-col items-center justify-center p-8 text-white overflow-hidden transition-all duration-700",
            `bg-gradient-to-br ${getCategoryColor(selectedCategory)}`
          )}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Grid3x3 className="w-full h-full scale-150 rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/30 transform transition-transform hover:scale-105 duration-500">
                <span className="text-5xl md:text-6xl filter drop-shadow-md">{categoryIcons[selectedCategory]}</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight">{categoryLabels[selectedCategory]}</h2>
                <p className="text-white/80 text-sm font-medium uppercase tracking-widest italic">{post.status} Creation</p>
              </div>

              {/* Media Preview Miniature */}
              <div className="mt-4 w-full max-w-[200px] aspect-video bg-black/20 rounded-2xl border border-white/10 overflow-hidden shadow-inner hidden md:block">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                ) : post.video_file ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900"><Video className="text-white/20" /></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900"><FileText className="text-white/20" /></div>
                )}
              </div>
            </div>

            {/* Floating Sparkles */}
            <Sparkles className="absolute top-10 right-10 w-8 h-8 opacity-20 animate-pulse" />
            <Sparkles className="absolute bottom-10 left-10 w-6 h-6 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Right: The Form Section */}
          <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 h-20 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md z-20">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-primary" />
                  Edit Creation
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">
                  Refining the Masterpiece
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition-all text-slate-400 hover:text-slate-600 hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-elegant">
              <form id="edit-post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-4">
                {/* Section 1: Identity & Origin */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {displayConfig.icons.section}
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity & Origin</span>
                    </div>
                    {displayConfig.isSchool ? (
                      <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20 font-bold">ZeeQue Partner Only</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsManualSchoolMode(!isManualSchoolMode)}
                        className="text-[10px] font-black uppercase tracking-tighter text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {isManualSchoolMode ? (
                          <><GraduationCap className="w-3 h-3" /> Partner Network</>
                        ) : (
                          <><PenLine className="w-3 h-3" /> Type Manually</>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Dynamic Layout: Adapts to show either 1 or 2 columns based on visibility */}
                    <div className={cn(
                      "grid gap-6",
                      ((displayConfig.showTeacher && displayConfig.showAuthor) || (displayConfig.showAuthor && displayConfig.showPhone)) ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    )}>

                      {/* School Field */}
                      {displayConfig.showSchool && (
                        <div className={cn(
                          "space-y-4",
                          displayConfig.isSchool ? "order-1 md:col-span-1" : "order-3 md:col-span-1"
                        )}>
                          <div className="relative px-1">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {displayConfig.labels.school}
                            </Label>
                          </div>

                          {isManualSchoolMode && !displayConfig.isSchool ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Manual School Name</Label>
                                <div className="relative">
                                  <School className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...form.register('schoolName')}
                                    placeholder="Enter school name"
                                    className="pl-11 h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Institution Code (Optional)</Label>
                                <div className="relative">
                                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    {...form.register('schoolCode')}
                                    placeholder="e.g. SCH-001"
                                    className="pl-11 h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                              <div className="flex items-center justify-between px-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Verified Partner Selection</span>
                                <Check className="w-3 h-3 text-green-500" />
                              </div>
                              <SchoolSelector
                                value={form.watch('schoolCode') || form.watch('schoolName')}
                                onChange={(val, school) => {
                                  if (school) {
                                    form.setValue('schoolName', school.original_name);
                                    form.setValue('schoolCode', school.code);
                                  } else {
                                    form.setValue('schoolName', val);
                                  }
                                }}
                              />
                              {displayConfig.isSchool && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                                  <Hash className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-[10px] font-mono font-bold text-muted-foreground">INSTITUTION CODE: {form.watch('schoolCode') || 'PENDING SELECTION'}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {form.formState.errors.schoolName && (
                            <p className="text-[10px] text-destructive font-bold ml-1 mt-1">⚠️ {form.formState.errors.schoolName.message}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Author Name - Shown conditionally */}
                    {displayConfig.showAuthor && (
                      <div className={cn(
                        "space-y-2",
                        displayConfig.isSchool ? "order-2" : "order-1"
                      )}>
                        <Label htmlFor="edit-authorName" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                          {displayConfig.labels.author}
                        </Label>
                        <Input
                          id="edit-authorName"
                          {...form.register('authorName')}
                          className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shadow-sm focus:ring-primary/20 font-medium"
                        />
                        {form.formState.errors.authorName && (
                          <p className="text-[10px] text-destructive font-bold ml-1">⚠️ {form.formState.errors.authorName.message}</p>
                        )}
                      </div>
                    )}

                    {/* Teacher/Classroom Field - Shown conditionally */}
                    {displayConfig.showTeacher && (
                      <div className="space-y-2 order-2">
                        <Label htmlFor="edit-teacherName" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                          {displayConfig.labels.teacher}
                        </Label>
                        <Input
                          id="edit-teacherName"
                          placeholder="Name of teacher or classroom"
                          {...form.register('teacherName')}
                          className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shadow-sm focus:ring-primary/20 font-medium"
                        />
                      </div>
                    )}

                    {/* Phone Number Field - Shown for Parents */}
                    {displayConfig.showPhone && (
                      <div className="space-y-2 order-2">
                        <Label htmlFor="edit-phoneNumber" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                          Parent Contact Number 📱
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="edit-phoneNumber"
                            {...form.register('phoneNumber')}
                            placeholder="e.g. 0123456789"
                            className="pl-11 h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shadow-sm focus:ring-primary/20 font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Content Details */}
                <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">The Magic Details</span>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Category (Pill Selection Style) */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Category 🎨</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => form.setValue('category', cat)}
                            className={cn(
                              "flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all duration-300",
                              selectedCategory === cat
                                ? "border-primary bg-primary/5 dark:bg-primary/20 scale-[1.02] shadow-sm text-primary"
                                : "border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-primary/30"
                            )}
                          >
                            <span className="text-lg">{categoryIcons[cat]}</span>
                            <span className="font-bold text-xs">{categoryLabels[cat]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-title" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {displayConfig.labels.title}
                      </Label>
                      <Input
                        id="edit-title"
                        {...form.register('title')}
                        className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shadow-sm focus:ring-primary/20 font-medium"
                      />
                      {form.formState.errors.title && (
                        <p className="text-[10px] text-destructive font-bold ml-1">⚠️ {form.formState.errors.title.message}</p>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-content" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {displayConfig.labels.content}
                      </Label>
                      <Textarea
                        id="edit-content"
                        {...form.register('content')}
                        className="min-h-[120px] rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 shadow-sm focus:ring-primary/20 p-4 leading-loose resize-none scrollbar-elegant"
                      />
                      {form.formState.errors.content && (
                        <p className="text-[10px] text-destructive font-bold ml-1">⚠️ {form.formState.errors.content.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Media */}
                <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-primary opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Media & Visuals</span>
                  </div>

                  {selectedCategory === 'video' ? (
                    <div className="space-y-4">
                      <Tabs value={mediaTab} onValueChange={(val) => setMediaTab(val)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4 h-12 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl">
                          <TabsTrigger value="link" className="rounded-lg text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-primary transition-all">
                            Video Link 🔗
                          </TabsTrigger>
                          <TabsTrigger value="upload" className="rounded-lg text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-primary transition-all">
                            Upload File 🎥
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="link" className="mt-0">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground ml-1">YouTube / Vimeo Link</Label>
                            <Input
                              id="edit-videoUrl"
                              type="url"
                              placeholder="https://youtube.com/watch?v=..."
                              {...form.register('videoUrl')}
                              className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50"
                            />
                            {form.formState.errors.videoUrl && (
                              <p className="text-[10px] text-destructive font-bold ml-1">⚠️ {form.formState.errors.videoUrl.message}</p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="upload" className="mt-0">
                          <div className="relative border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-all text-center cursor-pointer group">
                            <input
                              type="file"
                              accept="video/*"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 100 * 1024 * 1024) { toast.error("Video too large"); return; }
                                  setSelectedVideo(file);
                                  setVideoPreview(URL.createObjectURL(file));
                                  form.setValue('videoUrl', '');
                                }
                              }}
                            />
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                              <Video className="w-7 h-7 text-primary" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                              {selectedVideo ? "New Video Selected!" : post.video_file ? "Replace Current Video" : "Click to Upload Video"}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">MP4, MOV up to 100MB</p>

                            {(selectedVideo || post.video_file) && (
                              <div className="mt-4 bg-primary/5 border border-primary/10 rounded-xl p-3 inline-flex items-center gap-3 relative z-20">
                                <Check className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-xs font-bold text-primary truncate max-w-[150px]">
                                  {selectedVideo ? selectedVideo.name : 'Existing Video File'}
                                </span>
                                {selectedVideo && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSelectedVideo(null); setVideoPreview(null); }}
                                    className="p-1 hover:bg-red-50 text-red-400 rounded-full transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold text-muted-foreground ml-1">Featured / Cover Image</Label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-800/50">
                        {previewUrl ? (
                          <div className="relative w-full sm:w-40 aspect-video rounded-xl overflow-hidden shadow-lg group">
                            <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => setPreviewUrl(null)}
                                className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full sm:w-40 aspect-video rounded-xl border-2 border-dashed border-slate-200 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-950">
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1 space-y-3">
                          <p className="text-[10px] text-muted-foreground leading-relaxed italic">Upload a high-quality thumbnail for {categoryLabels[selectedCategory]}. Landscape orientation works best.</p>
                          <div className="flex items-center gap-3">
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedImage(file);
                                  setPreviewUrl(URL.createObjectURL(file));
                                }
                              }}
                            />
                            <Label
                              htmlFor="image-upload"
                              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl cursor-pointer text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              {previewUrl ? 'Change Image' : 'Choose Photo'}
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 h-24 bg-white dark:bg-zinc-950 flex items-center justify-end gap-4 shrink-0 px-8">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl font-bold px-6 h-12 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Discard Changes
              </Button>
              <Button
                type="submit"
                form="edit-post-form"
                className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold px-10 h-12 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Save Creation
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
