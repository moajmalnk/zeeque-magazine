import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Grid, Bookmark, Users, Settings, PlusCircle, Heart, MessageCircle, MapPin, Link as LinkIcon, Image as ImageIcon, Calendar, Award, CheckCircle2, Grid3x3, Palette, PenLine, Star } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Zod Schema for Profile Edit
const profileSchema = z.object({
    username: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().max(150, "Bio must be less than 150 characters").optional(),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    phone_number: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
    const { logout } = useAuth();
    const queryClient = useQueryClient();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Full User Profile
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await api.get('/users/me/');
            return response.data;
        },
    });

    // Fetch User Posts
    const { data: posts = [], isLoading: isPostsLoading } = useQuery({
        queryKey: ['my-posts', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            // Using the new filtering capability we added
            const response = await api.get(`/posts/?user_id=${user.id}`);
            return response.data;
        },
    });

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        values: {
            username: user?.username || '',
            bio: user?.bio || '',
            website: user?.website || '',
            phone_number: user?.phone_number || '',
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            const formData = new FormData();
            // Append text fields
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    formData.append(key, data[key]);
                }
            });
            // Append image if selected
            if (selectedImage) {
                formData.append('profile_image', selectedImage);
            }

            // Axios usually handles Content-Type for FormData automatically, 
            // but our api instance has hardcoded JSON type. We override it.
            const response = await api.patch('/users/me/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setIsEditOpen(false);
            setSelectedImage(null);
            setImagePreview(null);
            toast.success("Profile saved.");
        },
        onError: (error: any) => {
            toast.error("Failed to update profile.");
            console.error(error);
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data: ProfileFormData) => {
        updateProfileMutation.mutate(data);
    };

    if (isUserLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background/50 flex flex-col font-sans">
            <Header />

            <main className="flex-1 container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">

                    {/* Left Sidebar: Student ID / Profile Card */}
                    <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-6">
                        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl shadow-primary/5 relative group">
                            {/* Decorative Background Pattern */}
                            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
                            <div className="absolute top-0 right-0 p-6 opacity-20">
                                <Grid3x3 className="w-24 h-24 text-primary rotate-12" />
                            </div>

                            <div className="relative pt-12 px-6 pb-8 flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="relative mb-4">
                                    <div className="w-32 h-32 rounded-2xl rotate-3 bg-background p-2 shadow-lg group-hover:rotate-0 transition-transform duration-300">
                                        <div className="w-full h-full rounded-xl overflow-hidden bg-muted">
                                            <Avatar className="w-full h-full rounded-none">
                                                <AvatarImage src={user.profile_image} className="object-cover" />
                                                <AvatarFallback className="text-4xl font-display font-bold bg-primary/10 text-primary">{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full shadow-md cursor-pointer hover:bg-muted transition-colors" onClick={() => setIsEditOpen(true)}>
                                        <Settings className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </div>

                                {/* Identity */}
                                <h1 className="text-2xl font-display font-bold text-foreground mb-1 break-all">{user.username}</h1>
                                {user.teacher_name && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Student of {user.teacher_name}</span>
                                    </div>
                                )}

                                {/* Bio */}
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-4 break-words px-2">
                                    {user.bio || "No bio added yet."}
                                </p>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 w-full border-t border-border/50 pt-6 mb-6">
                                    <div className="flex flex-col items-center p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                        <span className="text-xl font-bold font-display text-foreground">{posts.length}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Posts</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toast.info("Coming soon!")}>
                                        <span className="text-xl font-bold font-display text-foreground">{user.followers_count || 0}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Followers</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => toast.info("Coming soon!")}>
                                        <span className="text-xl font-bold font-display text-foreground">{user.following_count || 0}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Following</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="w-full space-y-3">
                                    <Button onClick={() => setIsEditOpen(true)} className="w-full rounded-xl font-semibold shadow-sm">
                                        Edit Profile
                                    </Button>
                                    <div className="grid grid-cols-2 gap-3">
                                        {user.website && (
                                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="col-span-2">
                                                <Button variant="outline" className="w-full rounded-xl gap-2 h-10 border-dashed">
                                                    <LinkIcon className="w-4 h-4" />
                                                    Portfolio Link
                                                </Button>
                                            </a>
                                        )}
                                        {/* <Button variant="secondary" className="w-full rounded-xl gap-2 h-10">
                                            <Bookmark className="w-4 h-4" />
                                            Saved
                                        </Button> */}
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Main Content Area: Portfolio */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">

                        <Tabs defaultValue="ALL" className="w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-foreground">My Creative Work</h2>
                                    <p className="text-muted-foreground mt-1">Showcase of all your stories, poems, and art.</p>
                                </div>
                                <TabsList className="bg-muted/50 p-1 h-auto rounded-xl sm:rounded-full w-full sm:w-auto overflow-x-auto flex flex-nowrap justify-start sm:justify-center snap-x script-scroll-padding">
                                    <TabsTrigger
                                        value="ALL"
                                        className="rounded-full px-4 sm:px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap snap-start"
                                    >
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="PUBLISHED"
                                        className="rounded-full px-4 sm:px-6 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all whitespace-nowrap snap-start"
                                    >
                                        Published
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="PENDING"
                                        className="rounded-full px-4 sm:px-6 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all whitespace-nowrap snap-start"
                                    >
                                        Pending
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="REJECTED"
                                        className="rounded-full px-4 sm:px-6 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all whitespace-nowrap snap-start"
                                    >
                                        Rejected
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Content Grid */}
                            {['ALL', 'PUBLISHED', 'PENDING', 'REJECTED'].map((tabValue) => (
                                <TabsContent key={tabValue} value={tabValue} className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus-visible:outline-none">
                                    {isPostsLoading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                                <div key={i} className="aspect-[4/5] rounded-3xl bg-muted/30 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : posts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 border-2 border-dashed border-muted rounded-3xl bg-muted/5">
                                            <div className="p-6 rounded-full bg-primary/5">
                                                <Palette className="w-12 h-12 text-primary/40" />
                                            </div>
                                            <div className="space-y-2 max-w-md mx-auto">
                                                <h3 className="text-xl font-bold font-display">Time to Create!</h3>
                                                <p className="text-muted-foreground">
                                                    Your portfolio is looking a bit empty. Share your first masterpiece with the world.
                                                </p>
                                            </div>
                                            <Button asChild size="lg" className="rounded-full text-base font-semibold px-8">
                                                <Link to="/submit">
                                                    <PlusCircle className="w-5 h-5 mr-2" />
                                                    Create New Submission
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="masonry-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                                            {posts
                                                .filter((post: any) => tabValue === 'ALL' || post.status.toUpperCase() === tabValue)
                                                .map((post: any) => (
                                                    <div
                                                        key={post.id}
                                                        className="group relative flex flex-col bg-card border border-border/40 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 h-full cursor-pointer"
                                                        onClick={() => setSelectedPost(post)}
                                                    >
                                                        {/* Image / Thumbnail Area */}
                                                        <div className="relative aspect-[4/3] w-full bg-muted/30 overflow-hidden">
                                                            {post.image ? (
                                                                <img
                                                                    src={post.image}
                                                                    alt={post.title}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-secondary/5 text-center group-hover:bg-muted/50 transition-colors">
                                                                    <span className="text-5xl mb-4 opacity-10 font-serif italic text-primary">Aa</span>
                                                                    <h4 className="font-display font-bold text-foreground/60 line-clamp-3 px-2 break-all text-sm leading-relaxed">
                                                                        {post.title}
                                                                    </h4>
                                                                </div>
                                                            )}

                                                            {/* Category Badge overlay */}
                                                            <div className="absolute top-4 left-4 z-10">
                                                                <Badge variant="secondary" className="backdrop-blur-xl bg-white/90 dark:bg-black/40 shadow-sm border border-white/20 font-bold tracking-wider text-[10px] uppercase px-2.5 py-1">
                                                                    {post.category}
                                                                </Badge>
                                                            </div>

                                                            {/* Status Indicator Dot */}
                                                            <div className="absolute top-4 right-4 z-10">
                                                                <div className={cn(
                                                                    "w-3 h-3 rounded-full shadow-sm ring-2 ring-white/20",
                                                                    post.status === 'published' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" :
                                                                        post.status === 'pending' ? "bg-amber-500" : "bg-red-500"
                                                                )} />
                                                            </div>

                                                            {/* Hover Overlay with Action */}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="rounded-full font-semibold translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                                                    onClick={() => setSelectedPost(post)}
                                                                >
                                                                    View Project
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Content Area */}
                                                        <div className="flex-1 p-6 flex flex-col gap-3">
                                                            <div>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mb-2 font-medium">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                                                                </div>
                                                                <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors break-all">
                                                                    {post.title}
                                                                </h3>
                                                            </div>

                                                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-all">
                                                                {post.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </main>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {/* Image Change Section */}
                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={imagePreview || user.profile_image} />
                                <AvatarFallback>{user.username?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">{user.username}</h4>
                                <Label htmlFor="picture" className="text-blue-500 text-sm font-semibold cursor-pointer hover:text-blue-700">
                                    Change profile photo
                                </Label>
                                <Input
                                    id="picture"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Name</Label>
                                <Input id="username" {...form.register('username')} placeholder="Name" />
                                <p className="text-[10px] text-muted-foreground">
                                    Help people discover your account by using the name you're known by: either your full name, nickname, or business name.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" {...form.register('website')} placeholder="Website" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    {...form.register('bio')}
                                    placeholder="Write a little bit about yourself..."
                                    className="resize-none h-20"
                                />
                                <div className="text-right text-xs text-muted-foreground">
                                    {form.watch('bio')?.length || 0} / 150
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" {...form.register('phone_number')} placeholder="Phone Number" />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full md:w-auto rounded-lg">
                                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Post Detail View Dialog */}
            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-card rounded-2xl border border-border/50 shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh]">
                    {/* Visual Media Side (Left/Top) */}
                    {selectedPost?.image && (
                        <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative group">
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                            <img
                                src={selectedPost.image}
                                alt={selectedPost.title}
                                className="w-full h-full object-contain relative z-10 max-h-[40vh] md:max-h-full"
                            />
                        </div>
                    )}

                    {/* Content Side (Right/Bottom) */}
                    <div className={cn("flex flex-col flex-1 min-w-0 bg-card", !selectedPost?.image && "w-full")}>
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-border/40 flex flex-col gap-2 bg-muted/10">
                            <div className="flex items-center justify-between">
                                <DialogTitle className="font-display font-bold text-xl md:text-2xl leading-tight pr-8">
                                    {selectedPost?.title}
                                </DialogTitle>
                            </div>

                            <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{selectedPost && new Date(selectedPost.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                                    {selectedPost?.category}
                                </Badge>
                                <Badge className={cn(
                                    "border-0",
                                    selectedPost?.status === 'published' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                        selectedPost?.status === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                            "bg-destructive/10 text-destructive"
                                )}>
                                    {selectedPost?.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {selectedPost?.content}
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-4 border-t border-border/40 bg-muted/5 flex justify-end gap-2">
                            {/* Optional: Add Edit/Delete actions here if needed later */}
                            <Button variant="secondary" onClick={() => setSelectedPost(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
