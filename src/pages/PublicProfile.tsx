
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, Grid3x3, Users, Calendar, Palette, Link as LinkIcon,
    X, MoreHorizontal, FileText, Share2, Heart, MessageCircle,
    UserPlus, UserCheck, BadgeCheck
} from 'lucide-react';
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
    // Adding admin/verified examples
    'admin': {
        id: 'admin', username: 'ZeeQue Admin', bio: 'Official administration account.',
        profile_image: 'https://ui-avatars.com/api/?name=ZeeQue+Admin&background=0D8ABC&color=fff',
        role: 'ADMIN',
        posts: []
    },
    'school': {
        id: 'school', username: 'ZeeQue High School', bio: 'Official school profile.',
        profile_image: 'https://ui-avatars.com/api/?name=ZeeQue+High&background=6366f1&color=fff',
        role: 'SCHOOL',
        posts: []
    },
    'editorial': {
        id: 'editorial', username: 'ZeeQue Editorial', bio: 'Curating the best content.',
        profile_image: 'https://ui-avatars.com/api/?name=ZeeQue+Edit&background=10b981&color=fff',
        role: 'EDITORIAL',
        posts: []
    }
};


export default function PublicProfile() {
    const { userId } = useParams<{ userId: string }>();
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Fetch User Profile
    const { data: user, isLoading: isUserLoading, isError } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            // Mock data fallback for dev
            if (userId && (MOCK_USERS_DATA[userId] || userId === 'admin' || userId === 'school' || userId === 'editorial')) {
                return MOCK_USERS_DATA[userId] || MOCK_USERS_DATA['mock-1']; // Fallback strictly to avoid crash if key missing but listed in logic
            }
            if (userId && MOCK_USERS_DATA[userId]) return MOCK_USERS_DATA[userId];
            const response = await api.get(`/users/${userId}/`);
            return response.data;
        },
        retry: 1
    });

    // Determine verification status
    const isVerified = user?.role === 'ADMIN' || user?.role === 'SCHOOL' || user?.role === 'EDITORIAL';

    // Fetch User Posts
    const { data: posts = [], isLoading: isPostsLoading } = useQuery({
        queryKey: ['user-posts', userId],
        // ... (rest of query matches original except keeping same)
        enabled: !!userId,
        queryFn: async () => {
            if (userId && MOCK_USERS_DATA[userId]) return MOCK_USERS_DATA[userId].posts;

            // Only fetch PUBLISHED posts for public profile
            const response = await api.get(`/posts/?user_id=${userId}&status=PUBLISHED`);
            return response.data;
        },
    });

    const [isFollowing, setIsFollowing] = useState(false);

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
        if (!isFollowing) {
            toast.success(`You are now following ${user?.username}`);
        } else {
            toast.info(`Unfollowed ${user?.username}`);
        }
    };

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
                                <div className="flex items-center gap-2 justify-center mb-1">
                                    <h1 className="text-2xl font-display font-bold text-foreground break-all">{user.username}</h1>
                                    {isVerified && (
                                        <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500 text-white" />
                                    )}
                                </div>
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

                                {/* Follow Action */}
                                <div className="w-full px-2 mb-6">
                                    <Button
                                        onClick={toggleFollow}
                                        variant={isFollowing ? "outline" : "default"}
                                        className={cn(
                                            "w-full rounded-full font-semibold shadow-sm transition-all duration-300",
                                            isFollowing
                                                ? "border-muted-foreground/20 text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10 dark:hover:text-red-400"
                                                : "bg-primary text-primary-foreground hover:brightness-110 shadow-primary/20"
                                        )}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Follow
                                            </>
                                        )}
                                    </Button>
                                </div>

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
                <DialogContent
                    noContentWrapper
                    hideCloseButton
                    className="max-w-5xl w-[95vw] md:w-full rounded-2xl p-0 overflow-hidden bg-background text-foreground border-border shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[650px] gap-0 outline-none"
                >
                    {/* LEFT: Image Section */}
                    <div className="w-full md:w-[40%] bg-black/95 flex items-center justify-center relative h-[40vh] md:h-full flex-shrink-0 border-r border-border/10 overflow-hidden p-6 md:p-12">
                        {selectedPost?.image ? (
                            <>
                                {/* Subtle Gradient Backdrop for Depth */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none"
                                />

                                {/* Main Image - Floating Card Style */}
                                <img
                                    src={selectedPost.image}
                                    alt={selectedPost.title}
                                    className="w-full h-full object-contain relative z-10 rounded-lg shadow-2xl drop-shadow-2xl"
                                />
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center relative overflow-hidden">
                                {/* Abstract Pattern Background */}
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

                                {/* Large Background Icon */}
                                <FileText className="absolute text-white/5 w-64 h-64 -bottom-12 -right-12 rotate-12" />

                                {/* Content */}
                                <div className="relative z-10 flex flex-col items-center max-w-md">
                                    <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mb-6" />
                                    <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight leading-tight mb-4 line-clamp-3">
                                        {selectedPost?.title}
                                    </h3>
                                    <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] border border-white/10 px-3 py-1 rounded-full">
                                        {selectedPost?.category}
                                    </span>
                                </div>
                            </div>
                        )}
                        {/* Mobile Close Button Overlay */}
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelectedPost(null)}
                            className="absolute top-3 right-3 z-50 text-white/70 hover:bg-white/10 hover:text-white backdrop-blur-md rounded-full md:hidden"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* RIGHT: Content Section */}
                    <div className="flex flex-col flex-1 min-w-0 bg-background w-full overflow-hidden">

                        {/* 1. Header: User Info & Actions */}
                        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8 border border-border">
                                    <AvatarImage src={user?.profile_image} />
                                    <AvatarFallback className="bg-muted text-foreground text-xs">{user?.username?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col justify-center">
                                    <span className="font-semibold text-sm text-foreground leading-none">
                                        {user?.username}
                                    </span>
                                    {/* If post author is different from profile user (e.g. reshared), we could show it here. Assuming direct authorship for now or simplify. */}
                                    <span className="text-[10px] text-muted-foreground mt-0.5">Author</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-transparent">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedPost(null)}
                                    className="text-muted-foreground hover:text-foreground hover:bg-transparent hidden md:flex"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        {/* 2. Scrollable Body: Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 custom-scrollbar bg-background">
                            {/* Title */}
                            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-6 leading-tight tracking-tight font-display">
                                {selectedPost?.title}
                            </h2>

                            {/* Body Text */}
                            <div className="text-lg md:text-xl leading-loose text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium pb-8">
                                {/* Drop cap effect */}
                                {selectedPost?.content && (
                                    <>
                                        <span className="float-left text-5xl md:text-6xl font-black text-primary mr-3 mt-1 leading-none transform -rotate-2">
                                            {selectedPost.content.charAt(0)}
                                        </span>
                                        {selectedPost.content.slice(1)}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center text-xs text-muted-foreground mt-4 pt-4 border-t border-border/40">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                <span>Published on {selectedPost && new Date(selectedPost.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* Footer Actions (Optional) */}
                        <div className="p-4 border-t border-border bg-muted/5 flex items-center justify-between gap-2 shrink-0">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/5">
                                    <Heart className="w-4 h-4" /> Like
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/5">
                                    <MessageCircle className="w-4 h-4" /> Comment
                                </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5">
                                <Share2 className="w-4 h-4" /> Share
                            </Button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
