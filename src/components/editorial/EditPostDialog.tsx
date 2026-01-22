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
    }
  }, [open, post, form]);

  const selectedCategory = form.watch('category');

  const onSubmit = (data: EditPostFormData) => {
    onSave(post.id, {
      author_name: data.authorName,
      teacher_name: data.teacherName,
      school_name: data.schoolName,
      title: data.title,
      category: data.category,
      content: data.content,
      video_url: data.videoUrl || undefined,
    });

    toast.success('Post updated successfully!', {
      description: `"${data.title}" has been updated`,
      duration: 3000,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-authorName" className="text-base font-semibold">
              Student Name 👋
            </Label>
            <Input
              id="edit-authorName"
              placeholder="Student name"
              {...form.register('authorName')}
              className="h-12 text-base rounded-xl"
            />
            {form.formState.errors.authorName && (
              <p className="text-sm text-destructive">{form.formState.errors.authorName.message}</p>
            )}
          </div>

          {/* Teacher Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-teacherName" className="text-base font-semibold">
              Teacher Name 👨‍🏫
            </Label>
            <Input
              id="edit-teacherName"
              placeholder="Teacher name"
              {...form.register('teacherName')}
              className="h-12 text-base rounded-xl"
            />
            {form.formState.errors.teacherName && (
              <p className="text-sm text-destructive">{form.formState.errors.teacherName.message}</p>
            )}
          </div>

          {/* School Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-schoolName" className="text-base font-semibold">
              School Name 🏫
            </Label>
            <Input
              id="edit-schoolName"
              placeholder="School name"
              {...form.register('schoolName')}
              className="h-12 text-base rounded-xl"
            />
            {form.formState.errors.schoolName && (
              <p className="text-sm text-destructive">{form.formState.errors.schoolName.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Category 🎨
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
                    'font-semibold block text-sm',
                    selectedCategory === category ? 'text-white' : 'text-foreground'
                  )}>
                    {categoryLabels[category]}
                  </span>
                </button>
              ))}
            </div>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-base font-semibold">
              Title ✏️
            </Label>
            <Input
              id="edit-title"
              placeholder="Post title"
              {...form.register('title')}
              className="h-12 text-base rounded-xl"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="edit-content" className="text-base font-semibold">
              Content 📝
            </Label>
            <Textarea
              id="edit-content"
              placeholder="Post content..."
              {...form.register('content')}
              className="min-h-32 text-base rounded-xl resize-none"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
            )}
          </div>

          {/* Video URL (if category is video) */}
          {selectedCategory === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="edit-videoUrl" className="text-base font-semibold">
                Video URL 🔗
              </Label>
              <Input
                id="edit-videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                {...form.register('videoUrl')}
                className="h-12 text-base rounded-xl"
              />
              {form.formState.errors.videoUrl && (
                <p className="text-sm text-destructive">{form.formState.errors.videoUrl.message}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
