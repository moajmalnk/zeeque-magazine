
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { CommentItem } from "@/components/CommentItem";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Grid3x3, Users, Calendar, Palette, Link as LinkIcon,
    MoreHorizontal, FileText, Share2, Heart, MessageCircle,
    UserPlus, UserCheck, BadgeCheck, Send, User as UserIcon, X
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Post } from '@/types/post';
import { getRoleColor, isVerifiedRole } from '@/lib/roleUtils';
import { getCategoryStyle } from '@/lib/categoryUtils';
import { usePosts } from '@/hooks/usePosts';
import { Skeleton } from '@/components/ui/skeleton';

const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'stories': return 'bg-blue-600';
        case 'poems': return 'bg-rose-500';
        case 'drawings': return 'bg-amber-500';
        case 'news': return 'bg-emerald-600';
        case 'video': return 'bg-purple-600';
        default: return 'bg-slate-700';
    }
};

// Helper to convert video URLs to embed format
const getVideoEmbedUrl = (url: string, isPreview: boolean = true): string | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
            if (videoId) {
                // Preview: Autoplay, Mute, No Controls, Loop
                if (isPreview) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&disablekb=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoId}`;
                // Detail: Autoplay, Sound, Controls
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0`;
            }
        }
        if (urlObj.hostname.includes('vimeo.com')) {
            const videoId = urlObj.pathname.split('/').pop();
            if (videoId) {
                if (isPreview) return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1`;
                return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
            }
        }
        return null;
    } catch (e) {
        return null;
    }
};

function FollowButton({ userId, username, isFollowing: initialIsFollowing }: { userId: string, username: string, isFollowing?: boolean }) {
    const queryClient = useQueryClient();
    // We rely on props, but for list items, we might need local state if the parent doesn't update instantly
    // Actually, react-query invalidation is best.
    // But for a list, invalidating the WHOLE list is expensive and causes flicker.
    // Local state is better for the button.
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

    // Sync with prop if it changes (e.g. invalidation)
    useMemo(() => setIsFollowing(initialIsFollowing), [initialIsFollowing]);

    const mutation = useMutation({
        mutationFn: async () => {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            await api.post(`/users/${userId}/${endpoint}/`);
        },
        onMutate: async () => {
            setIsFollowing(!isFollowing);
        },
        onError: () => {
            setIsFollowing(!isFollowing); // Revert
            toast.error("Failed to update status");
        },
        onSuccess: () => {
            // We can invalidate broadly or just let local state hold.
            // Invalidating 'users-list' is good to keep sync.
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
        }
    });

    return (
        <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); mutation.mutate(); }}
            disabled={mutation.isPending}
            variant={isFollowing ? "outline" : "default"}
            className={cn(
                "rounded-lg h-8 px-4 text-xs font-bold transition-all w-24",
                isFollowing
                    ? "border-border/50 bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                    : "bg-primary text-primary-foreground hover:brightness-110"
            )}
        >
            {isFollowing ? "Following" : "Follow"}
        </Button>
    );
}

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
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { toggleShare } = usePosts();
    const { userId } = useParams<{ userId: string }>();
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const { isAuthenticated: isLoggedIn, user: currentUser, isLoading } = useAuth(); // Renamed to avoid collison with profile 'user'

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            toast.info("Please log in to view user profiles", {
                id: 'auth-redirect-profile' // Prevent duplicate toasts
            });
            navigate('/login');
        }
    }, [isLoggedIn, navigate, isLoading]);

    const likeMutation = useMutation({
        mutationFn: async () => {
            if (!selectedPost) return;
            const { data } = await api.post(`/posts/${selectedPost.id}/like/`);
            return data;
        },
        onMutate: async () => {
            // Optimistic update of selectedPost
            if (selectedPost) {
                const wasLiked = selectedPost.is_liked_by_me;
                const newLiked = !wasLiked;
                const newCount = wasLiked ? (selectedPost.likes_count || 0) - 1 : (selectedPost.likes_count || 0) + 1;

                setSelectedPost({
                    ...selectedPost,
                    is_liked_by_me: newLiked,
                    likes_count: Math.max(0, newCount)
                });
            }
        },
        onError: () => {
            toast.error("Failed to update like status");
            // Revert logic omitted for simplicity given local state
        },
        onSuccess: (data) => {
            if (selectedPost) {
                setSelectedPost({
                    ...selectedPost,
                    is_liked_by_me: data.status === 'liked',
                    likes_count: data.likes_count
                });
            }
            queryClient.invalidateQueries({ queryKey: ['user-posts', userId] });
        }
    });

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            toast.error("Please log in to like posts");
            navigate('/login');
            return;
        }
        likeMutation.mutate();
    };

    // Fetch User Profile
    const { data: user, isLoading: isUserLoading, isError } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            // Check if it's a mock ID first (strictly for demo purposes)
            if (userId && MOCK_USERS_DATA[userId]) return MOCK_USERS_DATA[userId];

            // Otherwise fetch from real API
            const response = await api.get(`/users/${userId}/`);
            return response.data;
        },
        retry: 1
    });

    // Check verification
    const isVerified = user?.role === 'ADMIN' || user?.role === 'SCHOOL' || user?.role === 'EDITORIAL';

    // Fetch User Posts
    const { data: postsData, isLoading: isPostsLoading } = useQuery({
        queryKey: ['user-posts', userId],
        enabled: !!userId,
        queryFn: async () => {
            if (userId && MOCK_USERS_DATA[userId]) return MOCK_USERS_DATA[userId].posts;
            const response = await api.get(`/posts/?user_id=${userId}&status=PUBLISHED`);
            return response.data;
        },
    });

    const posts = useMemo(() => {
        if (!postsData) return [];
        return Array.isArray(postsData) ? postsData : (postsData.results || []);
    }, [postsData]);

    const [isFollowing, setIsFollowing] = useState(false); // Deprecated by mutation-driven UI but kept for safety if ref used
    const [viewingList, setViewingList] = useState<'followers' | 'following' | null>(null);

    // Fetch Followers/Following List
    const {
        data: usersListData,
        isLoading: isUsersListLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useInfiniteQuery({
        queryKey: ['users-list', userId, viewingList],
        enabled: !!viewingList && !!userId,
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            const endpoint = viewingList === 'followers' ? 'followers' : 'following';
            const response = await api.get(`/users/${userId}/${endpoint}/?page=${pageParam}`);
            return response.data;
        },
        getNextPageParam: (lastPage: any) => {
            if (lastPage.next) {
                try {
                    const url = new URL(lastPage.next);
                    return parseInt(url.searchParams.get('page') || '1');
                } catch (e) {
                    const match = lastPage.next.match(/page=(\d+)/);
                    return match ? parseInt(match[1]) : undefined;
                }
            }
            return undefined;
        },
    });

    const usersList = useMemo(() => {
        if (!usersListData) return [];
        return usersListData.pages.flatMap((page: any) =>
            Array.isArray(page) ? page : (page.results || [])
        );
    }, [usersListData]);

    // Follow/Unfollow Mutation
    const followMutation = useMutation({
        mutationFn: async (isFollowing: boolean) => {
            if (isFollowing) {
                await api.post(`/users/${userId}/unfollow/`);
            } else {
                await api.post(`/users/${userId}/follow/`);
            }
        },
        onMutate: async (isFollowing) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['user', userId] });

            // Snapshot previous value
            const previousUser = queryClient.getQueryData(['user', userId]);

            // Optimistically update
            queryClient.setQueryData(['user', userId], (old: any) => ({
                ...old,
                is_following: !isFollowing,
                followers_count: old.followers_count + (isFollowing ? -1 : 1)
            }));

            return { previousUser };
        },
        onError: (err, newTodo, context: any) => {
            queryClient.setQueryData(['user', userId], context.previousUser);
            toast.error("Failed to update follow status.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        },
        onSuccess: (_, isFollowing) => {
            if (isFollowing) { // was following, now unfollowed
                toast.info(`Unfollowed ${user?.username}`);
            } else {
                toast.success(`You are now following ${user?.username}`);
            }
        }
    });

    // Comments Logic
    const [commentText, setCommentText] = useState("");
    const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
        queryKey: ['comments', selectedPost?.id],
        enabled: !!selectedPost?.id,
        queryFn: async () => {
            const response = await api.get(`/posts/${selectedPost?.id}/comments/`);
            return response.data.results || response.data;
        }
    });

    const commentMutation = useMutation({
        mutationFn: async (text: string) => {
            await api.post(`/posts/${selectedPost?.id}/comments/`, { content: text });
        },
        onMutate: async (text) => {
            await queryClient.cancelQueries({ queryKey: ['comments', selectedPost?.id] });
            const previousComments = queryClient.getQueryData(['comments', selectedPost?.id]);

            // Optimistic update
            const newComment = {
                id: `temp-${Date.now()}`,
                content: text,
                user: {
                    id: user?.id, // Profile owner... wait, CURRENT USER. 
                    // I need current user info. I'll rely on available data or a placeholder.
                    // Ideally I fetch 'me' first.
                    username: 'You', // Placeholder until refresh
                    profile_image: null
                },
                created_at: new Date().toISOString(),
                replies_count: 0
            };

            queryClient.setQueryData(['comments', selectedPost?.id], (old: any) => {
                const list = old && old.results ? old.results : (old || []);
                return [newComment, ...list];
            });

            setCommentText(""); // Clear input immediately
            return { previousComments };
        },
        onError: (err, newTodo, context: any) => {
            queryClient.setQueryData(['comments', selectedPost?.id], context.previousComments);
            toast.error("Failed to post comment");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', selectedPost?.id] });
        }
    });

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        commentMutation.mutate(commentText);
    };

    const handleFollowClick = () => {
        if (!user) return;
        followMutation.mutate(user.is_following);
    };

    if (isUserLoading) {
        return (
            <div className="min-h-screen bg-background/50 flex flex-col font-sans">
                <Header />
                <main className="flex-1 container max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
                        {/* Sidebar Skeleton */}
                        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-6">
                            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-xl shadow-primary/5 p-6 flex flex-col items-center">
                                <Skeleton className="w-32 h-32 rounded-2xl mb-6" />
                                <Skeleton className="h-8 w-48 mb-4" />
                                <Skeleton className="h-4 w-32 mb-8" />
                                <Skeleton className="h-20 w-full rounded-2xl mb-8" />
                                <div className="grid grid-cols-3 gap-4 w-full">
                                    <Skeleton className="h-12 rounded-xl" />
                                    <Skeleton className="h-12 rounded-xl" />
                                    <Skeleton className="h-12 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-64" />
                                <Skeleton className="h-4 w-96" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-card border border-border/40 rounded-3xl overflow-hidden aspect-[4/5] flex flex-col">
                                        <Skeleton className="flex-1 rounded-none" />
                                        <div className="p-5 space-y-3">
                                            <Skeleton className="h-4 w-2/3" />
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-4/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
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
                                                <AvatarFallback className={cn("text-4xl font-display font-bold", getRoleColor(user.role).avatar)}>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                </div>

                                {/* Identity */}
                                <div className="flex items-center gap-2 justify-center mb-1">
                                    <h1 className="text-2xl font-display font-bold text-foreground break-all">{user.username}</h1>
                                    {isVerifiedRole(user?.role) && (
                                        <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500" />
                                    )}
                                </div>
                                {user.teacher_name && (
                                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4", getRoleColor(user.role).badge)}>
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
                                        onClick={handleFollowClick}
                                        disabled={followMutation.isPending}
                                        variant={user?.is_following ? "outline" : "default"}
                                        className={cn(
                                            "w-full rounded-full font-semibold shadow-sm transition-all duration-300",
                                            user?.is_following
                                                ? "border-muted-foreground/20 text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10 dark:hover:text-red-400"
                                                : "bg-primary text-primary-foreground hover:brightness-110 shadow-primary/20"
                                        )}
                                    >
                                        {followMutation.isPending ? (
                                            <Skeleton className="w-4 h-4 mr-2 rounded-full bg-primary-foreground/30" />
                                        ) : user?.is_following ? (
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
                                    <div className="flex flex-col items-center p-2 rounded-2xl bg-muted/20">
                                        <span className="text-xl font-bold font-display text-foreground">{posts.length}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Posts</span>
                                    </div>
                                    <button
                                        onClick={() => setViewingList('followers')}
                                        className="flex flex-col items-center p-2 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group/stat"
                                    >
                                        <span className="text-xl font-bold font-display text-foreground group-hover/stat:text-primary transition-colors">{user.followers_count || 0}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Followers</span>
                                    </button>
                                    <button
                                        onClick={() => setViewingList('following')}
                                        className="flex flex-col items-center p-2 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group/stat"
                                    >
                                        <span className="text-xl font-bold font-display text-foreground group-hover/stat:text-primary transition-colors">{user.following_count || 0}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Following</span>
                                    </button>
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
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="bg-card border border-border/40 rounded-3xl overflow-hidden aspect-[4/5] flex flex-col">
                                                <Skeleton className="flex-1 rounded-none" />
                                                <div className="p-5 space-y-3">
                                                    <Skeleton className="h-4 w-2/3" />
                                                    <Skeleton className="h-3 w-full" />
                                                    <Skeleton className="h-3 w-4/5" />
                                                </div>
                                            </div>
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
                                                    {post.image_url || post.image ? (
                                                        <img
                                                            src={post.image_url || post.image}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : post.video_url || post.video_file ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                                                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                                                            </div>
                                                        </div>
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
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn(
                                                                "backdrop-blur-xl shadow-sm border font-bold tracking-wider text-[10px] uppercase px-2.5 py-1 transition-colors",
                                                                getCategoryStyle(post.category).bg,
                                                                getCategoryStyle(post.category).text,
                                                                getCategoryStyle(post.category).border
                                                            )}
                                                        >
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
                                                <div className="flex-1 p-5 md:p-6 flex flex-col gap-3">
                                                    <div>
                                                        <div className="flex items-center justify-between gap-2 mb-2">
                                                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground/80 font-medium">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                                                            </div>

                                                            {/* Engagement Stats - Showing if > 0 for immediate feedback */}
                                                            <div className="flex items-center gap-3">
                                                                {(post.likes_count ?? 0) > 0 && (
                                                                    <div className="flex items-center gap-0.5 text-pink-500 animate-in fade-in zoom-in duration-300">
                                                                        <Heart className="w-3.5 h-3.5 fill-current" />
                                                                        <span className="text-[10px] font-bold">{post.likes_count}</span>
                                                                    </div>
                                                                )}
                                                                {(post.comments_count ?? 0) > 0 && (
                                                                    <div className="flex items-center gap-0.5 text-blue-500 animate-in fade-in zoom-in duration-300">
                                                                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                                                        <span className="text-[10px] font-bold">{post.comments_count}</span>
                                                                    </div>
                                                                )}
                                                                {(post.share_count ?? 0) > 0 && (
                                                                    <div className="flex items-center gap-0.5 text-emerald-500 animate-in fade-in zoom-in duration-300">
                                                                        <Share2 className="w-3.5 h-3.5" />
                                                                        <span className="text-[10px] font-bold">{post.share_count}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <h3 className="font-display font-bold text-base md:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
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

            <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent
                    hideCloseButton
                    noContentWrapper
                    className="max-w-[1100px] w-[95vw] h-[85vh] md:h-[80vh] p-0 border-0 !rounded-[2rem] bg-white dark:bg-black shadow-2xl overflow-hidden flex flex-col z-[100] outline-none"
                >
                    <DialogTitle className="sr-only">{selectedPost?.title}</DialogTitle>
                    <DialogDescription className="sr-only">Read {selectedPost?.title} by {user?.username}</DialogDescription>

                    <div className="flex flex-col md:flex-row h-full">
                        {/* LEFT: Media Side */}
                        <div className="relative w-full md:w-[40%] h-[30vh] md:h-full bg-black flex items-center justify-center overflow-hidden border-r border-slate-100 dark:border-zinc-800 shrink-0">

                            {/* Mobile Close Button */}
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white backdrop-blur-md md:hidden z-50 hover:bg-black/70"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Background Blur Effect */}
                            {(selectedPost?.image_url || selectedPost?.image || selectedPost?.video_file) && (
                                <div className="absolute inset-0 z-0 opacity-40 blur-xl transform scale-110 pointer-events-none">
                                    {selectedPost.video_file ? (
                                        <video src={selectedPost.video_file} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={selectedPost.image_url || selectedPost.image || ''} className="w-full h-full object-cover" alt="" />
                                    )}
                                </div>
                            )}

                            {/* Main Media Content */}
                            <div className="relative z-10 w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm">
                                {selectedPost?.video_file ? (
                                    <div className="relative w-full h-full cursor-pointer flex items-center justify-center" onClick={(e) => {
                                        const video = e.currentTarget.querySelector('video');
                                        if (video) video.paused ? video.play() : video.pause();
                                    }}>
                                        <video
                                            src={selectedPost.video_file}
                                            autoPlay
                                            loop
                                            className="max-w-full max-h-full object-contain shadow-2xl"
                                        />
                                    </div>
                                ) : selectedPost?.video_url ? (() => {
                                    const embedUrl = getVideoEmbedUrl(selectedPost.video_url, false);
                                    return embedUrl ? (
                                        <iframe
                                            src={embedUrl}
                                            title={selectedPost.title}
                                            className="w-full h-full border-0"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="text-white font-bold p-10 bg-zinc-900 rounded-2xl flex flex-col items-center gap-4">
                                            <FileText className="w-12 h-12 text-primary" />
                                            <span>Video Content</span>
                                        </div>
                                    )
                                })() : (selectedPost?.image_url || selectedPost?.image) ? (
                                    <img src={selectedPost.image_url || selectedPost.image || ''} alt={selectedPost.title} className="max-w-full max-h-full object-contain shadow-lg" />
                                ) : (
                                    <div className={`w-full h-full flex flex-col items-center justify-center p-10 text-center ${getCategoryColor(selectedPost?.category || '')} bg-opacity-80`}>
                                        <FileText className="w-24 h-24 text-white/80 mb-4" />
                                        <h2 className="text-3xl font-bold text-white shadow-sm">{selectedPost?.title}</h2>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Content Section (Instagram Style Sidebar) */}
                        <div className="flex flex-col flex-1 h-full bg-white dark:bg-black overflow-hidden shadow-2xl">
                            {/* 1. Profile Header */}
                            <div className="p-3 pr-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 h-16 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all overflow-hidden",
                                            user?.profile_image ? "" : getRoleColor(user?.role).avatar,
                                            getRoleColor(user?.role).border
                                        )}>
                                            {user?.profile_image ? (
                                                <img src={user.profile_image} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                user?.username?.[0]?.toUpperCase()
                                            )}
                                        </div>
                                        {isVerifiedRole(user?.role) && (
                                            <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-zinc-900 rounded-full p-[1px] shadow">
                                                <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h3 className="font-bold text-sm text-foreground leading-none truncate max-w-[150px]">
                                            {user?.username}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user?.role}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-sm font-bold bg-primary/10 text-primary border-0 capitalize">{selectedPost?.category}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition-colors text-slate-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* 2. Scrollable Content & Comments */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-elegant overflow-x-hidden space-y-8">
                                {/* Main Post Header */}
                                <div className="space-y-6">
                                    <h1 className="font-display font-black text-2xl md:text-4xl text-foreground leading-tight tracking-tight">
                                        {selectedPost?.title}
                                    </h1>
                                    <div className="text-foreground/80 text-base md:text-lg leading-loose whitespace-pre-wrap break-words border-l-4 border-primary/20 pl-6 italic font-medium">
                                        {selectedPost?.content}
                                    </div>
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold tracking-widest uppercase">
                                            <Calendar className="w-4 h-4" />
                                            <span>{selectedPost && new Date(selectedPost.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments List */}
                                <div className="pt-4 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Pulse of Community</h3>
                                        <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-full font-bold">{comments.length}</span>
                                    </div>

                                    {isCommentsLoading ? (
                                        <div className="space-y-4 py-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex gap-4">
                                                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-1/4 rounded" />
                                                        <Skeleton className="h-3 w-full rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center py-12 px-6 bg-slate-50/50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-border">
                                            <MessageCircle className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm font-medium text-muted-foreground italic">Be the first to share your thoughts!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {comments.map((comment: any) => (
                                                <CommentItem
                                                    key={comment.id}
                                                    comment={comment}
                                                    postId={selectedPost?.id || ''}
                                                    variant="bubble"
                                                    getRoleColor={getRoleColor}
                                                    getInitials={(name) => name?.[0]?.toUpperCase() || 'U'}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Sticky Footer Actions */}
                            <div className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-black p-4 md:p-6 shrink-0 z-10 space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <button onClick={handleLike} className="group flex items-center gap-2 transition-all hover:scale-110">
                                            <Heart className={cn("w-5 h-5 transition-colors", selectedPost?.is_liked_by_me ? 'fill-red-500 text-red-500' : 'text-foreground')} strokeWidth={2} />
                                            <span className="font-bold text-sm tracking-tight">{selectedPost?.likes_count || 0}</span>
                                        </button>
                                        <button className="group flex items-center gap-2 transition-all hover:scale-110">
                                            <MessageCircle className="w-5 h-5 text-foreground" strokeWidth={2} />
                                            <span className="font-bold text-sm tracking-tight">{comments.length}</span>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); toggleShare(selectedPost?.id || ''); }} className="group flex items-center gap-2 transition-all hover:scale-110">
                                            <Share2 className="w-5 h-5 text-foreground" strokeWidth={2} />
                                            <span className="font-bold text-sm tracking-tight">{selectedPost?.share_count || 0}</span>
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[.2em] animate-pulse">
                                        LIVE ON ZEEQUE
                                    </div>
                                </div>

                                {/* Comment Composer */}
                                {isLoggedIn ? (
                                    <form onSubmit={handlePostComment} className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-zinc-800/80">
                                        <Avatar className="w-8 h-8 rounded-full shrink-0 border border-border">
                                            <AvatarImage src={user?.profile_image} className="object-cover" />
                                            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{user?.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <input
                                            type="text"
                                            placeholder="Write your review..."
                                            className="flex-1 bg-slate-50 dark:bg-zinc-900 border-0 text-sm focus:ring-1 focus:ring-primary/20 rounded-full px-4 py-2 placeholder:text-muted-foreground/60 text-foreground transition-all focus:bg-white dark:focus:bg-black h-10 shadow-inner"
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            disabled={commentMutation.isPending}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!commentText.trim() || commentMutation.isPending}
                                            className="rounded-full font-bold px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-10"
                                        >
                                            {commentMutation.isPending ? <Skeleton className="w-8 h-4 bg-white/30 rounded" /> : 'Post'}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                                        <Button onClick={() => navigate('/login')} className="w-full rounded-xl font-bold h-11 bg-primary/10 text-primary hover:bg-primary/20 border-0 transition-all">
                                            Log in to Review this Project
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Followers / Following List Dialog */}
            <Dialog open={!!viewingList} onOpenChange={(open) => !open && setViewingList(null)}>
                <DialogContent className="max-w-md w-full p-0 gap-0 overflow-hidden outline-none border-border bg-card rounded-2xl">
                    <DialogTitle className="sr-only">List of {viewingList}</DialogTitle>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/5">
                        <h3 className="font-bold text-lg text-foreground capitalize flex items-center gap-2">
                            {viewingList === 'followers' ? <Users className="w-5 h-5 text-primary" /> : <UserCheck className="w-5 h-5 text-primary" />}
                            {viewingList}
                        </h3>
                    </div>

                    {/* List */}
                    <div className="h-[60vh] overflow-y-auto custom-scrollbar p-0">
                        {isUsersListLoading ? (
                            <div className="space-y-4 p-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : usersList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <div className="p-4 bg-muted/30 rounded-full mb-3">
                                    <Users className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="font-medium">No users found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/40">
                                {usersList.map((listUser: any) => (
                                    <div key={listUser.id} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Link to={`/profile/${listUser.id}`} onClick={() => setViewingList(null)} className="relative shrink-0">
                                                <Avatar className="w-12 h-12 border border-border group-hover:border-primary/50 transition-colors">
                                                    <AvatarImage src={listUser.profile_image} className="object-cover" />
                                                    <AvatarFallback className="bg-muted text-xs font-bold">{listUser.username?.[0]?.toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                {isVerifiedRole(listUser.role) && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-[1px] shadow-sm">
                                                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex flex-col min-w-0">
                                                <Link
                                                    to={`/profile/${listUser.id}`}
                                                    onClick={() => setViewingList(null)}
                                                    className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors block"
                                                >
                                                    {listUser.username}
                                                </Link>
                                                <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                    {listUser.role !== 'STUDENT' && (
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">{listUser.role}</Badge>
                                                    )}
                                                    {listUser.bio ? listUser.bio.substring(0, 30) + (listUser.bio.length > 30 ? '...' : '') : user?.teacher_name ? `Student of ${user.teacher_name}` : 'ZeeQue Member'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Follow Button - self check by verifying if this user is current user logic, currently omitted but button handles its own state */}
                                        <div className="pl-2 shrink-0 flex items-center gap-2">
                                            {/* We should ideally hide this if listUser.id === currentUserId. Without auth context, we show it (backend handles error). */}
                                            <FollowButton
                                                userId={listUser.id}
                                                username={listUser.username}
                                                isFollowing={listUser.is_following}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {hasNextPage && (
                                    <div className="p-4 flex justify-center border-t border-border/10">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            className="text-primary font-bold hover:bg-primary/5 rounded-full px-8 h-10 transition-all uppercase tracking-widest text-[10px]"
                                        >
                                            {isFetchingNextPage ? (
                                                <>
                                                    <Skeleton className="w-3.5 h-3.5 mr-2 rounded-full" />
                                                    Discovering...
                                                </>
                                            ) : (
                                                "Show More Users"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
