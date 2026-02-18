
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Grid3x3, Users, Calendar, Palette, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Post } from '@/types/post';

// MOCK DATA FOR LANDING PAGE DEMO ONLY (Matches Index.tsx)
const MOCK_USERS_DATA: Record<string, any> = {
    'mock-1': {
        id: 'mock-1', username: 'Mubashir', bio: 'Tech enthusiast and AI explorer.',
        profile_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
        role: 'STUDENT', teacher_name: 'Mr. Anderson',
        posts: [{
            id: 101, title: "The Future of AI in Learning", category: "Tech", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=300&h=400&fit=crop",
            content: "Artificial Intelligence is transforming how we learn...", status: 'published', created_at: new Date().toISOString()
        }]
    },
    'mock-2': {
        id: 'mock-2', username: 'Basith B1', bio: 'Weaving stories from the threads of imagination.',
        profile_image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop',
        role: 'STUDENT', teacher_name: 'Mrs. Roberts',
        posts: [{
            id: 102, title: "Whispers of the Old Library", category: "Story", image: "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=300&h=400&fit=crop",
            content: "They say the books whisper at night...", status: 'published', created_at: new Date().toISOString()
        }]
    },
    'mock-3': {
        id: 'mock-3', username: 'Junaid', bio: 'Looking at the stars and dreaming of Mars.',
        profile_image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
        role: 'STUDENT', teacher_name: 'Dr. Sagan',
        posts: [{
            id: 103, title: "Mars: A New Horizon", category: "Science", image: "https://images.unsplash.com/photo-1614728853913-3e274b967927?q=80&w=300&h=400&fit=crop",
            content: "Exploring the technical and ethical challenges...", status: 'published', created_at: new Date().toISOString()
        }]
    },
    'mock-4': {
        id: 'mock-4', username: 'Shafeequ', bio: 'Capturing moments of silence in a noisy world.',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        role: 'STUDENT', teacher_name: 'Ms. Adams',
        posts: [{
            id: 104, title: "Urban Solitude", category: "Photo", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=300&h=400&fit=crop",
            content: "A photographic journey through the empty streets...", status: 'published', created_at: new Date().toISOString()
        }]
    },
    'mock-5': {
        id: 'mock-5', username: 'Abdulla', bio: 'Painting emotions with words and colors.',
        profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        role: 'STUDENT', teacher_name: 'Mr. Ross',
        posts: [{
            id: 105, title: "The Gradient Sky", category: "Poem", image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=300&h=400&fit=crop",
            content: "Orange bleeds into violet...", status: 'published', created_at: new Date().toISOString()
        }]
    },
    'mock-6': {
        id: 'mock-6', username: 'Rahman', bio: 'Designing a sustainable future.',
        profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        role: 'STUDENT', teacher_name: 'Mrs. Hadid',
        posts: [{
            id: 106, title: "Sustainable Architecture", category: "Design", image: "https://images.unsplash.com/photo-1518005020951-ecc8e1e8d47c?q=80&w=300&h=400&fit=crop",
            content: "How modern biomimicry is shaping...", status: 'published', created_at: new Date().toISOString()
        }]
    },
};


export default function PublicProfile() {
    const { userId } = useParams<{ userId: string }>();
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Fetch User Profile
    const { data: user, isLoading: isUserLoading, isError } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            if (userId && MOCK_USERS_DATA[userId]) return MOCK_USERS_DATA[userId];
            const response = await api.get(`/users/${userId}/`);
            return response.data;
        },
        retry: 1
    });

    // Fetch User Posts
    const { data: posts = [], isLoading: isPostsLoading } = useQuery({
        queryKey: ['user-posts', userId],
        enabled: !!userId,
        queryFn: async () => {
            if (userId && MOCK_USERS_DATA[userId]) return MOCK_USERS_DATA[userId].posts;

            // Only fetch PUBLISHED posts for public profile
            const response = await api.get(`/posts/?user_id=${userId}&status=PUBLISHED`);
            return response.data;
        },
    });

    if (isUserLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="min-h-screen bg-background flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="bg-muted p-6 rounded-full mb-4">
                        <Users className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">User Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                        The user profile you are looking for might have been removed or does not exist.
                    </p>
                    <Link to="/">
                        <Button>Go Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 flex flex-col font-sans">
            <Header />

            <main className="flex-1 container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">

                    {/* Left Sidebar: Profile Card (Read Only) */}
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
                                    {user.bio || "No bio available."}
                                </p>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 w-full border-t border-border/50 pt-6 mb-6">
                                    <div className="flex flex-col items-center p-2 rounded-xl bg-muted/20">
                                        <span className="text-xl font-bold font-display text-foreground">{posts.length}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Posts</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-xl bg-muted/20">
                                        <span className="text-xl font-bold font-display text-foreground">{user.followers_count || 0}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Followers</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-xl bg-muted/20">
                                        <span className="text-xl font-bold font-display text-foreground">{user.following_count || 0}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Following</span>
                                    </div>
                                </div>

                                {user.website && (
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="w-full">
                                        <Button variant="outline" className="w-full rounded-xl gap-2 h-10 border-dashed">
                                            <LinkIcon className="w-4 h-4" />
                                            Portfolio Link
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area: Portfolio */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">

                        <Tabs defaultValue="PUBLISHED" className="w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-3xl font-display font-bold text-foreground">Creative Portfolio</h2>
                                    <p className="text-muted-foreground mt-1">Showcase of published stories, poems, and art.</p>
                                </div>
                            </div>

                            {/* Content Grid */}
                            <TabsContent value="PUBLISHED" className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus-visible:outline-none mt-0">
                                {isPostsLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="aspect-[4/5] rounded-3xl bg-muted/30 animate-pulse" />
                                        ))}
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 border-2 border-dashed border-muted rounded-3xl bg-muted/5">
                                        <div className="p-6 rounded-full bg-muted/50">
                                            <Palette className="w-12 h-12 text-muted-foreground/40" />
                                        </div>
                                        <div className="space-y-2 max-w-md mx-auto">
                                            <h3 className="text-xl font-bold font-display">No published works yet</h3>
                                            <p className="text-muted-foreground">
                                                This user hasn't published any creative works yet.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="masonry-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                                        {posts.map((post: Post) => (
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
                        </Tabs>
                    </div>
                </div>
            </main>

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
                                <Badge className="border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Published
                                </Badge>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                <span className="float-left text-5xl font-black text-primary/20 mr-2 mt-0 leading-none">
                                    {selectedPost?.content?.charAt(0)}
                                </span>
                                {selectedPost?.content}
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-4 border-t border-border/40 bg-muted/5 flex justify-end gap-2">
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
