import { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Upload, X, ImageIcon } from 'lucide-react';

const editPostSchema = z.object({
  authorName: z.string().min(1, "Please enter a name!").max(50, "Name is too long"),
  teacherName: z.string().min(1, "Please enter teacher name!").max(50, "Teacher name is too long"),
  schoolName: z.string().min(1, "Please enter school name!").max(100, "School name is too long"),
  title: z.string().min(1, "Please enter a title!").max(100, "Title is too long"),
  category: z.enum(['stories', 'poems', 'drawings', 'news', 'video', 'other']),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content is too long"),
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
  const form = useForm<EditPostFormData>({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      authorName: post.author_name,
      teacherName: post.teacher_name || '',
      schoolName: post.school_name || '',
      title: post.title,
      category: post.category,
      content: post.content,
      videoUrl: post.video_url || '',
    },
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(post.image_url || null);

  // Reset form when post changes
  useEffect(() => {
    if (open && post) {
      form.reset({
        authorName: post.author_name,
        teacherName: post.teacher_name || '',
        schoolName: post.school_name || '',
        title: post.title,
        category: post.category,
        content: post.content,
        videoUrl: post.video_url || '',
      });
      setPreviewUrl(post.image_url || null);
      setSelectedImage(null);
    }
  }, [open, post, form]);

  const selectedCategory = form.watch('category');

  const onSubmit = (data: EditPostFormData) => {
    const updates: any = {
      author_name: data.authorName,
      teacher_name: data.teacherName,
      school_name: data.schoolName,
      title: data.title,
      category: data.category,
      content: data.content,
      video_url: data.videoUrl || undefined,
    };

    if (selectedImage) {
      updates.image_url = selectedImage;
    } else if (post.image_url && !previewUrl) {
      updates.image_url = null;
    }

    onSave(post.id, updates);

    toast.success('Post updated successfully!', {
      description: `"${data.title}" has been updated`,
      duration: 3000,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-3xl p-6 shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader className="text-center sm:text-left pr-8">
          <DialogTitle className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Author Name */}
            <div className="space-y-2 text-left">
              <Label htmlFor="edit-authorName" className="text-sm font-semibold text-muted-foreground">
                Student Name 👋
              </Label>
              <Input
                id="edit-authorName"
                placeholder="Student name"
                {...form.register('authorName')}
                className="h-11 text-base rounded-xl shadow-sm border-slate-200 dark:border-slate-800 focus:border-primary/50 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/50"
              />
              {form.formState.errors.authorName && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.authorName.message}</p>
              )}
            </div>

            {/* Teacher Name */}
            <div className="space-y-2 text-left">
              <Label htmlFor="edit-teacherName" className="text-sm font-semibold text-muted-foreground">
                Teacher Name 👨‍🏫
              </Label>
              <Input
                id="edit-teacherName"
                placeholder="Teacher name"
                {...form.register('teacherName')}
                className="h-11 text-base rounded-xl shadow-sm border-slate-200 dark:border-slate-800 focus:border-primary/50 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/50"
              />
              {form.formState.errors.teacherName && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.teacherName.message}</p>
              )}
            </div>
          </div>

          {/* School Name */}
          <div className="space-y-2 text-left">
            <Label htmlFor="edit-schoolName" className="text-sm font-semibold text-muted-foreground">
              School Name 🏫
            </Label>
            <Input
              id="edit-schoolName"
              placeholder="School name"
              {...form.register('schoolName')}
              className="h-11 text-base rounded-xl shadow-sm border-slate-200 dark:border-slate-800 focus:border-primary/50 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/50"
            />
            {form.formState.errors.schoolName && (
              <p className="text-xs text-destructive font-medium">{form.formState.errors.schoolName.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-3 text-left">
            <Label className="text-sm font-semibold text-muted-foreground">
              Category 🎨
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => form.setValue('category', category)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all duration-200 w-full flex items-center gap-3 group outline-none focus:ring-2 focus:ring-primary/20',
                    selectedCategory === category
                      ? cn('border-transparent shadow-md transform scale-[1.02]', {
                        'bg-gradient-stories': category === 'stories',
                        'bg-gradient-poems': category === 'poems',
                        'bg-gradient-drawings': category === 'drawings',
                        'bg-gradient-news': category === 'news',
                        'bg-gradient-video': category === 'video',
                        'bg-gradient-other': category === 'other',
                      })
                      : 'border-slate-100 hover:border-primary/30 bg-slate-50/50 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'
                  )}
                >
                  <span className="text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">{categoryIcons[category]}</span>
                  <span className={cn(
                    'font-bold text-sm tracking-wide',
                    selectedCategory === category ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                  )}>
                    {categoryLabels[category]}
                  </span>
                </button>
              ))}
            </div>
            {form.formState.errors.category && (
              <p className="text-xs text-destructive font-medium">{form.formState.errors.category.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2 text-left">
            <Label className="text-sm font-semibold text-muted-foreground">
              Cover Image 🖼️
            </Label>
            <div className="flex items-start gap-4">
              {previewUrl ? (
                <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setSelectedImage(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-24 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImage(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
                <Label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 1200x630px or larger. JPG, PNG supported.
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2 text-left">
            <Label htmlFor="edit-title" className="text-sm font-semibold text-muted-foreground">
              Title ✏️
            </Label>
            <Input
              id="edit-title"
              placeholder="Post title"
              {...form.register('title')}
              className="h-11 text-base rounded-xl shadow-sm border-slate-200 dark:border-slate-800 focus:border-primary/50 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/50"
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive font-medium">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2 text-left">
            <Label htmlFor="edit-content" className="text-sm font-semibold text-muted-foreground">
              Content 📝
            </Label>
            <Textarea
              id="edit-content"
              placeholder="Post content..."
              {...form.register('content')}
              className="min-h-32 text-base rounded-xl resize-none shadow-sm border-slate-200 dark:border-slate-800 focus:border-primary/50 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/50"
            />
            {form.formState.errors.content && (
              <p className="text-xs text-destructive font-medium">{form.formState.errors.content.message}</p>
            )}
          </div>

          {/* Video URL (if category is video) */}
          {selectedCategory === 'video' && (
            <div className="space-y-2 text-left">
              <Label htmlFor="edit-videoUrl" className="text-sm font-semibold text-muted-foreground">
                Video URL 🔗
              </Label>
              <Input
                id="edit-videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                {...form.register('videoUrl')}
                className="h-11 text-base rounded-xl shadow-sm border-slate-200 dark:border-slate-800 focus:border-primary/50 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/50"
              />
              {form.formState.errors.videoUrl && (
                <p className="text-xs text-destructive font-medium">{form.formState.errors.videoUrl.message}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-3 sm:gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full h-11 border-2 border-slate-200 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
