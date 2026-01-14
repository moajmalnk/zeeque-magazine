import { useState } from 'react';
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
import { Send, Upload, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const submitSchema = z.object({
  authorName: z.string().min(1, "Please tell us your name!").max(50, "Name is too long"),
  title: z.string().min(1, "Give your work a title!").max(100, "Title is too long"),
  category: z.enum(['stories', 'poems', 'drawings', 'news']),
  content: z.string().min(10, "Tell us more! (at least 10 characters)").max(2000, "That's a lot! Try to keep it shorter"),
});

type SubmitFormData = z.infer<typeof submitSchema>;

const categories: Category[] = ['stories', 'poems', 'drawings', 'news'];

const categoryDescriptions: Record<Category, string> = {
  stories: 'Share your amazing adventures!',
  poems: 'Write beautiful words that rhyme!',
  drawings: 'Show us your colorful art!',
  news: 'Tell us what happened in class!',
};

export function SubmitForm() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      authorName: '',
      title: '',
      category: 'stories',
      content: '',
    },
  });

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

  const onSubmit = async (data: SubmitFormData) => {
    setIsSubmitting(true);
    
    // Simulate submission (will be replaced with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-published flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-published-foreground" />
        </div>
        <div>
          <p className="font-semibold">Wonderful! 🎉</p>
          <p className="text-sm text-muted-foreground">
            Your work has been sent for review. A teacher will look at it soon!
          </p>
        </div>
      </div>
    );
    
    form.reset();
    setSelectedImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
  };

  return (
    <Card className="border-0 shadow-card max-w-2xl mx-auto w-full">
      <CardHeader className="text-center pb-2 px-6 pt-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
          <span className="text-3xl">🌟</span>
        </div>
        <CardTitle className="font-display text-2xl md:text-3xl">
          Share Your Amazing Work!
        </CardTitle>
        <CardDescription className="text-base">
          We can't wait to see what you've created. Fill in the form below and a teacher will review it.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName" className="text-base font-semibold">
              Your Name 👋
            </Label>
            <Input
              id="authorName"
              placeholder="What should we call you?"
              {...form.register('authorName')}
              className="h-12 text-base rounded-xl"
            />
            {form.formState.errors.authorName && (
              <p className="text-sm text-destructive">{form.formState.errors.authorName.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              What are you sharing? 🎨
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              Your Story, Poem, or Description 📝
            </Label>
            <Textarea
              id="content"
              placeholder="Write your amazing content here..."
              {...form.register('content')}
              className="min-h-[150px] text-base rounded-xl resize-none"
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
            )}
          </div>

          {/* Image Upload */}
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
