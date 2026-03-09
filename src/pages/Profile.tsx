import { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
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
import { Grid, Bookmark, Users, Settings, PlusCircle, Heart, MessageCircle, Share2, MapPin, Link as LinkIcon, Image as ImageIcon, Calendar, Award, CheckCircle2, Grid3x3, Palette, PenLine, Star, X, BadgeCheck, FileText, UserPlus, UserCheck, MoreHorizontal, User as UserIcon, Lock, Eye, EyeOff, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn, getMediaUrl } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { getRoleColor, isVerifiedRole } from '@/lib/roleUtils';
import { getCategoryStyle } from '@/lib/categoryUtils';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { Slider } from "@/components/ui/slider";
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/types/post';
import { Skeleton } from '@/components/ui/skeleton';

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

// Zod Schema for Profile Edit
const profileSchema = z.object({
    username: z.string().min(2, "Name must be at least 2 characters"),
    bio: z.string().max(150, "Bio must be less than 150 characters").optional(),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    phone_number: z.string().optional(),
});

// Zod Schema for Password Change
const passwordSchema = z.object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

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

function FollowButton({ userId, username, isFollowing: initialIsFollowing, onToggle }: { userId: string, username: string, isFollowing?: boolean, onToggle?: () => void }) {
    const queryClient = useQueryClient();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);

    const mutation = useMutation({
        mutationFn: async () => {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            await api.post(`/users/${userId}/${endpoint}/`);
        },
        onMutate: () => {
            setIsFollowing(!isFollowing);
        },
        onError: () => {
            setIsFollowing(!isFollowing);
            toast.error("Failed to update status");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            queryClient.invalidateQueries({ queryKey: ['me'] });
            if (onToggle) onToggle();
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

export default function Profile() {
    const { logout, syncUser, isAuthenticated: isLoggedIn, isLoading } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toggleShare } = usePosts();

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            toast.info("Please log in to view your profile", {
                id: 'auth-redirect-my-profile'
            });
            navigate('/login');
        }
    }, [isLoggedIn, navigate, isLoading]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    // --- Post Detail State & Interactions ---
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [commentText, setCommentText] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Comments Query for Detail View
    const { data: commentsRaw = [], isLoading: isCommentsLoading } = useQuery({
        queryKey: ['comments', selectedPost?.id],
        enabled: !!selectedPost,
        queryFn: async () => {
            const response = await api.get(`/posts/${selectedPost?.id}/comments/`);
            return response.data;
        }
    });
    const comments = Array.isArray(commentsRaw) ? commentsRaw : (commentsRaw as any)?.results || [];

    const commentMutation = useMutation({
        mutationFn: async (text: string) => {
            await api.post(`/posts/${selectedPost?.id}/comments/`, { content: text });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', selectedPost?.id] });
            setCommentText("");
        },
        onError: () => toast.error("Failed to post comment")
    });

    const handlePostComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || commentMutation.isPending) return;
        commentMutation.mutate(commentText);
    };

    // Like/Share handles for detail view (Local state sync)
    const [detailLikes, setDetailLikes] = useState(0);
    const [isDetailLiked, setIsDetailLiked] = useState(false);

    useEffect(() => {
        if (selectedPost) {
            setDetailLikes(selectedPost.likes_count || 0);
            setIsDetailLiked(selectedPost.is_liked_by_me || false);
        }
    }, [selectedPost]);

    const likeMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/posts/${selectedPost?.id}/like/`);
        },
        onMutate: () => {
            const wasLiked = isDetailLiked;
            setIsDetailLiked(!wasLiked);
            setDetailLikes(prev => wasLiked ? prev - 1 : prev + 1);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile-posts'] });
        },
        onError: () => {
            setIsDetailLiked(!isDetailLiked);
            setDetailLikes(prev => isDetailLiked ? prev - 1 : prev + 1);
            toast.error("Could not update like status");
        }
    });

    const handleLike = () => {
        if (likeMutation.isPending) return;
        likeMutation.mutate();
    };

    const togglePlay = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = e.currentTarget.querySelector('video');
        if (video) {
            if (video.paused) video.play();
            else video.pause();
        }
    };


    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const formattedDate = selectedPost ? new Date(selectedPost.created_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }) : '';
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cropping State
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);

    // Fetch Full User Profile
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await api.get('/users/me/');
            return response.data;
        },
    });

    const [viewingList, setViewingList] = useState<'followers' | 'following' | null>(null);

    // Fetch Followers/Following List with Infinite Query
    const {
        data: usersListData,
        isLoading: isUsersListLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useInfiniteQuery({
        queryKey: ['users-list', user?.id, viewingList],
        enabled: !!viewingList && !!user?.id,
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            const endpoint = viewingList === 'followers' ? 'followers' : 'following';
            const response = await api.get(`/users/${user.id}/${endpoint}/?page=${pageParam}`);
            return response.data;
        },
        getNextPageParam: (lastPage: any) => {
            if (lastPage.next) {
                try {
                    const url = new URL(lastPage.next);
                    return parseInt(url.searchParams.get('page') || '1');
                } catch (e) {
                    // Fallback parse if URL is relative or malformed
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

    // Fetch User Posts
    const { data: postsData, isLoading: isPostsLoading } = useQuery({
        queryKey: ['my-posts', user?.id],
        enabled: !!user?.id,
        queryFn: async () => {
            // Using the new filtering capability we added
            const response = await api.get(`/posts/?user_id=${user.id}`);
            return response.data;
        },
    });

    const posts = useMemo(() => {
        if (!postsData) return [];
        return Array.isArray(postsData) ? postsData : (postsData.results || []);
    }, [postsData]);

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
            if (profileImage) {
                formData.append('profile_image', profileImage);
            } else if (imagePreview === null) {
                // If preview is explicitly null (removed), we might want to clear it on backend
                // Handle deletion logic if your backend supports a 'clear' flag or null value
                // In ZeeQue, let's assume we can send empty string or null
                formData.append('profile_image', '');
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
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            syncUser(data); // Immediately update local auth state
            setIsEditOpen(false);
            setProfileImage(null);
            setImagePreview(null);
            toast.success("Profile saved.");
        },
        onError: (error: any) => {
            toast.error("Failed to update profile.");
            console.error(error);
        }
    });

    const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setIsCropping(true);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
            };
            reader.readAsDataURL(file);
        }
    };

    const applyCrop = async () => {
        if (!tempImage || !croppedAreaPixels) return;

        try {
            const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
            if (croppedBlob) {
                const croppedFile = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
                setProfileImage(croppedFile);
                const previewUrl = URL.createObjectURL(croppedBlob);
                setImagePreview(previewUrl);
                setIsCropping(false);
                setTempImage(null);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to crop image");
        }
    };

    const removeImage = () => {
        setProfileImage(null);
        setImagePreview(null);
    };

    const onSubmit = (data: ProfileFormData) => {
        updateProfileMutation.mutate(data);
    };

    // Password form
    type PasswordFormData = z.infer<typeof passwordSchema>;
    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { old_password: '', new_password: '', confirm_password: '' },
    });
    const newPasswordValue = passwordForm.watch('new_password');

    const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
        if (!password) return { label: '', color: '', width: '0%' };
        if (password.length < 6) return { label: 'Too Short', color: 'bg-red-500', width: '20%' };
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
        if (password.length >= 12 && score >= 4) return { label: 'Very Strong', color: 'bg-emerald-500', width: '100%' };
        if (password.length >= 8 && score >= 3) return { label: 'Strong', color: 'bg-green-500', width: '75%' };
        if (score >= 2) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
        return { label: 'Weak', color: 'bg-red-400', width: '25%' };
    };

    const passwordStrength = getPasswordStrength(newPasswordValue);

    const changePasswordMutation = useMutation({
        mutationFn: async (data: PasswordFormData) => {
            const response = await api.post('/users/change_password/', {
                old_password: data.old_password,
                new_password: data.new_password,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Password updated successfully! 🔐', { description: 'Your account is now secured with the new password.' });
            passwordForm.reset();
            setIsPasswordSectionOpen(false);
        },
        onError: (error: any) => {
            const errData = error?.response?.data;
            if (errData?.old_password) {
                passwordForm.setError('old_password', { message: errData.old_password[0] });
            } else {
                toast.error('Password change failed', { description: errData?.detail || 'Please try again.' });
            }
        },
    });

    const onPasswordSubmit = (data: PasswordFormData) => {
        changePasswordMutation.mutate(data);
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
                                                <AvatarImage src={getMediaUrl(user.profile_image)} className="object-cover" />
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
                                    <div className="flex flex-col items-center p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setViewingList('followers')}>
                                        <span className="text-xl font-bold font-display text-foreground">{user.followers_count || 0}</span>
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Followers</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setViewingList('following')}>
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
                                <TabsList className="bg-white dark:bg-muted/50 p-1 h-auto rounded-xl sm:rounded-full w-full sm:w-auto overflow-x-auto flex flex-nowrap justify-start sm:justify-center snap-x script-scroll-padding">
                                    <TabsTrigger
                                        value="ALL"
                                        className="rounded-full px-4 sm:px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all whitespace-nowrap snap-start"
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
                                                <div key={i} className="bg-card border border-border/40 rounded-2xl overflow-hidden aspect-[4/5] flex flex-col">
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
                                                        {/* Image / Thumbnail / Video Preview Area */}
                                                        <div className="relative aspect-[4/3] w-full bg-muted/30 overflow-hidden rounded-t-3xl group/media transform-gpu">
                                                            {post.video_file ? (
                                                                <video
                                                                    src={post.video_file}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                    autoPlay
                                                                    muted
                                                                    loop
                                                                    playsInline
                                                                />
                                                            ) : post.video_url && getVideoEmbedUrl(post.video_url) ? (
                                                                <div className="w-full h-full relative pointer-events-none">
                                                                    <iframe
                                                                        src={getVideoEmbedUrl(post.video_url, true) || ''}
                                                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
                                                                        title={post.title}
                                                                    />
                                                                </div>
                                                            ) : (post.image_url || post.image) ? (
                                                                <img
                                                                    src={getMediaUrl(post.image_url || post.image)}
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
                            ))}
                        </Tabs>
                    </div>
                </div>
            </main >

            {/* Cropping Dialog */}
            < Dialog open={isCropping} onOpenChange={(open) => {
                if (!open) {
                    setIsCropping(false);
                    setTempImage(null);
                }
            }
            }>
                <DialogContent aria-describedby={undefined} className="max-w-[90vw] md:max-w-md w-full p-0 overflow-hidden bg-white dark:bg-black border-0 rounded-[2rem] shadow-2xl z-[150]">
                    <DialogHeader className="p-6 border-b border-slate-100 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                        <DialogTitle className="text-center font-display font-bold text-xl">Perfect Your Look</DialogTitle>
                    </DialogHeader>

                    <div className="relative h-[350px] md:h-[400px] w-full bg-slate-100 dark:bg-zinc-900">
                        {tempImage && (
                            <Cropper
                                image={tempImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        )}
                    </div>

                    <div className="p-8 space-y-6 bg-white dark:bg-black border-t border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[50px]">Zoom</span>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={([val]) => setZoom(val)}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsCropping(false);
                                    setTempImage(null);
                                }}
                                className="flex-1 font-bold rounded-xl h-12"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={applyCrop}
                                className="flex-1 font-bold rounded-xl h-12 bg-primary hover:brightness-110 shadow-lg shadow-primary/20"
                            >
                                Apply Crop
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Edit Profile Dialog */}
            < Dialog open={isEditOpen} onOpenChange={setIsEditOpen} >
                <DialogContent
                    aria-describedby={undefined}
                    noContentWrapper
                    hideCloseButton
                    className="max-w-[1100px] w-[95vw] h-[90vh] md:h-[80vh] p-0 border-0 !rounded-[2rem] bg-white dark:bg-black shadow-2xl overflow-hidden z-[100] outline-none"
                >
                    <DialogTitle className="sr-only">Edit Profile</DialogTitle>
                    {/* Main Container: Single scroll on mobile, split columns on desktop */}
                    <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden scrollbar-elegant">
                        {/* Left: Branding & Visual - Part of flow on mobile, fixed on desktop */}
                        <div className="relative w-full md:w-[40%] h-auto md:h-full bg-slate-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 overflow-hidden py-10 md:py-0 shrink-0">
                            {/* Decorative Background */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <Grid3x3 className="w-full h-full text-primary scale-150 rotate-12" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center gap-6">
                                <div className="relative group/avatar">
                                    <div className={cn(
                                        "w-32 h-32 md:w-48 md:h-48 rounded-[2rem] border-4 shadow-2xl transition-all duration-500 overflow-hidden bg-background",
                                        getRoleColor(user.role).border
                                    )}>
                                        <Avatar className="w-full h-full rounded-none">
                                            <AvatarImage src={imagePreview || user.profile_image} className="object-cover" />
                                            <AvatarFallback className="text-5xl font-display font-bold bg-primary/5 text-primary">
                                                {user.username?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
                                    >
                                        <PenLine className="w-5 h-5" />
                                    </button>

                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-destructive text-white p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all z-20 border-2 border-white dark:border-zinc-900"
                                            title="Remove photo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="text-center space-y-1">
                                    <h3 className="text-xl font-display font-bold text-foreground">{user.username}</h3>
                                    <Badge variant="secondary" className={cn("rounded-full px-4", getRoleColor(user.role).badge)}>
                                        {user.role}
                                    </Badge>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary font-bold hover:bg-primary/5 rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Change profile photo
                                </Button>
                                <Input
                                    id="picture-input"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>

                        {/* Right: Form Content */}
                        <div className="flex-1 flex flex-col bg-white dark:bg-black min-h-0">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 h-20 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-[60]">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">Edit Profile</h2>
                                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Keep your identity up to date on ZeeQue</p>
                                </div>
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition-colors text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form Body - Scrollable only on desktop, part of main flow on mobile */}
                            <div className="flex-1 md:overflow-y-auto p-6 md:p-8 space-y-8 md:scrollbar-elegant">
                                <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label htmlFor="username" className="text-sm font-bold text-foreground/80 ml-1">Full Name</Label>
                                            <Input
                                                id="username"
                                                {...form.register('username')}
                                                placeholder="Your Name"
                                                className="h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 focus:ring-primary/20"
                                            />
                                            <p className="text-[10px] text-muted-foreground ml-1 italic leading-relaxed">
                                                This is how you'll be known in the community.
                                            </p>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label htmlFor="phone" className="text-sm font-bold text-foreground/80 ml-1">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                {...form.register('phone_number')}
                                                placeholder="+1 (555) 000-0000"
                                                className="h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label htmlFor="website" className="text-sm font-bold text-foreground/80 ml-1">Personal Website / Portfolio</Label>
                                        <div className="relative group">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                            <Input
                                                id="website"
                                                {...form.register('website')}
                                                placeholder="https://yourportfolio.com"
                                                className="h-12 pl-11 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between ml-1">
                                            <Label htmlFor="bio" className="text-sm font-bold text-foreground/80">Bio</Label>
                                            <span className={cn(
                                                "text-[10px] font-bold",
                                                (form.watch('bio')?.length || 0) > 140 ? "text-red-500" : "text-muted-foreground text-opacity-50"
                                            )}>
                                                {form.watch('bio')?.length || 0} / 150
                                            </span>
                                        </div>
                                        <Textarea
                                            id="bio"
                                            {...form.register('bio')}
                                            placeholder="Tell the community about your creative journey..."
                                            className="resize-none h-32 rounded-[2rem] border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 p-4 leading-relaxed"
                                        />
                                    </div>
                                </form>

                                {/* Password Change Section — OUTSIDE profile form to prevent nested form submission bug */}
                                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Lock className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Change Password</p>
                                                <p className="text-xs text-muted-foreground">Keep your account secure</p>
                                            </div>
                                        </div>
                                        {isPasswordSectionOpen
                                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                    </button>

                                    {isPasswordSectionOpen && (
                                        <form
                                            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                                            className="p-4 sm:p-6 border-t border-slate-100 dark:border-zinc-800 space-y-4 bg-slate-50/50 dark:bg-zinc-900/30"
                                        >
                                            {/* Current Password */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-foreground/70 ml-1">Current Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        {...passwordForm.register('old_password')}
                                                        type={showOldPass ? 'text' : 'password'}
                                                        placeholder="Enter your current password"
                                                        className="h-11 pr-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                                    />
                                                    <button type="button" onClick={() => setShowOldPass(!showOldPass)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                        {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {passwordForm.formState.errors.old_password && (
                                                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                                                        <X className="w-3 h-3" /> {passwordForm.formState.errors.old_password.message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* New Password */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-foreground/70 ml-1">New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        {...passwordForm.register('new_password')}
                                                        type={showNewPass ? 'text' : 'password'}
                                                        placeholder="Create a strong new password"
                                                        className="h-11 pr-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                                    />
                                                    <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {/* Strength Meter */}
                                                {newPasswordValue && (
                                                    <div className="space-y-1 px-1">
                                                        <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={cn("h-full rounded-full transition-all duration-500", passwordStrength.color)}
                                                                style={{ width: passwordStrength.width }}
                                                            />
                                                        </div>
                                                        <p className={cn("text-[10px] font-bold", passwordStrength.color.replace('bg-', 'text-'))}>
                                                            {passwordStrength.label}
                                                        </p>
                                                    </div>
                                                )}
                                                {passwordForm.formState.errors.new_password && (
                                                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                                                        <X className="w-3 h-3" /> {passwordForm.formState.errors.new_password.message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Confirm New Password */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-foreground/70 ml-1">Confirm New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        {...passwordForm.register('confirm_password')}
                                                        type={showConfirmPass ? 'text' : 'password'}
                                                        placeholder="Repeat your new password"
                                                        className="h-11 pr-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                                    />
                                                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {passwordForm.formState.errors.confirm_password && (
                                                    <p className="text-xs text-red-500 ml-1 flex items-center gap-1">
                                                        <X className="w-3 h-3" /> {passwordForm.formState.errors.confirm_password.message}
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={changePasswordMutation.isPending}
                                                className="w-full h-11 rounded-xl font-bold bg-primary hover:brightness-110 shadow-md shadow-primary/20"
                                            >
                                                {changePasswordMutation.isPending ? (
                                                    <><Skeleton className="w-4 h-4 mr-2 rounded-full bg-white/30" /> Updating...</>
                                                ) : (
                                                    <><Shield className="w-4 h-4 mr-2" /> Update Password</>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Footer Actions - Fixed at bottom on both cases for better UX */}
                            <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/10 flex items-center justify-end gap-3 shrink-0 sticky bottom-0 z-[60] backdrop-blur-md">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsEditOpen(false)}
                                    className="rounded-xl font-bold px-6 h-12"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    form="profile-form"
                                    disabled={updateProfileMutation.isPending}
                                    className="rounded-xl font-bold px-8 h-12 shadow-lg shadow-primary/20 min-w-[140px]"
                                >
                                    {updateProfileMutation.isPending ? (
                                        <Skeleton className="mr-2 h-4 w-4 rounded-full bg-white/30" />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Post Detail View Dialog - Magazine Style */}
            < Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogContent
                    hideCloseButton
                    noContentWrapper
                    className="max-w-[1100px] w-[95vw] h-[85vh] md:h-[80vh] p-0 border-0 !rounded-[2rem] bg-white dark:bg-black shadow-2xl overflow-hidden flex flex-col z-[100] outline-none"
                >
                    <DialogTitle className="sr-only">{selectedPost?.title}</DialogTitle>
                    <DialogDescription className="sr-only">Read {selectedPost?.title} by {user.username}</DialogDescription>

                    <div className="flex flex-col md:flex-row h-full">
                        {/* Left: Media Section */}
                        <div className={`relative w-full md:w-[40%] h-[30vh] md:h-full bg-black flex items-center justify-center overflow-hidden border-r border-slate-100 dark:border-zinc-800 shrink-0`}>

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
                                    <div className="relative w-full h-full cursor-pointer flex items-center justify-center" onClick={togglePlay}>
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
                                            <LinkIcon className="w-12 h-12 text-primary" />
                                            <span>Video Link Attached</span>
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

                        {/* Right: Instagram-Style Sidebar */}
                        <div className="flex-1 flex flex-col h-full bg-white dark:bg-black overflow-hidden">
                            {/* 1. Profile Header */}
                            <div className="p-3 pr-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 h-16 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all overflow-hidden",
                                            user.profile_image ? "" : getRoleColor(user.role).avatar,
                                            getRoleColor(user.role).border
                                        )}>
                                            {user.profile_image ? (
                                                <img src={user.profile_image} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                getInitials(user.username)
                                            )}
                                        </div>
                                        {isVerifiedRole(user.role) && (
                                            <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-zinc-900 rounded-full p-[1px] shadow">
                                                <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h3 className="font-bold text-sm text-foreground leading-none truncate max-w-[180px]">
                                            {user.username}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user.role}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-sm font-bold bg-primary/10 text-primary border-0">{selectedPost?.category}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-full transition-colors text-slate-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* 2. Scrollable Content & Comments List */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-elegant overflow-x-hidden space-y-8">
                                {/* Main Post Content Section */}
                                <div className="space-y-6">
                                    <h1 className="font-display font-black text-2xl md:text-3xl text-foreground leading-tight">
                                        {selectedPost?.title}
                                    </h1>
                                    <div className="text-foreground/80 text-base leading-loose whitespace-pre-wrap break-words border-l-2 border-primary/20 pl-6 italic">
                                        {selectedPost?.content}
                                    </div>
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <span>Original Creation • {formattedDate}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Area */}
                                <div className="pt-4 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Community Feedback</h3>
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
                                        <div className="text-center py-12 px-6 bg-slate-50/50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
                                            <MessageCircle className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm font-medium text-muted-foreground italic">No feedback yet from the community.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {comments.map((comment: any) => (
                                                <div key={comment.id} className="flex gap-4 group animate-in fade-in slide-in-from-left-2 duration-300">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl shrink-0 overflow-hidden border-2 shadow-sm",
                                                        getRoleColor(comment.user?.role).border
                                                    )}>
                                                        {comment.user?.profile_image ? (
                                                            <img src={comment.user.profile_image} alt={comment.user.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-muted text-muted-foreground">{comment.user?.username?.[0]?.toUpperCase()}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm text-foreground">{comment.user?.username}</span>
                                                            <span className="text-[10px] text-muted-foreground font-mono">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Sticky Footer Actions */}
                            <div className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-black p-4 md:p-6 shrink-0 z-10 space-y-4">
                                {/* Interaction Bar */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={handleLike}
                                            className="group flex items-center gap-2 transition-all hover:scale-110"
                                        >
                                            <Heart className={cn("w-5 h-5 transition-colors", isDetailLiked ? 'fill-red-500 text-red-500' : 'text-foreground')} strokeWidth={2} />
                                            <span className="font-bold text-sm">{detailLikes}</span>
                                        </button>
                                        <button className="group flex items-center gap-2 transition-all hover:scale-110">
                                            <MessageCircle className="w-5 h-5 text-foreground" strokeWidth={2} />
                                            <span className="font-bold text-sm">{comments.length}</span>
                                        </button>
                                        <button className="group flex items-center gap-2 transition-all hover:scale-110">
                                            <Share2 className="w-5 h-5 text-foreground" strokeWidth={2} />
                                            <span className="font-bold text-sm">{selectedPost?.share_count || 0}</span>
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest text-right">
                                        ZeeQue Portfolio Item
                                    </div>
                                </div>

                                {/* Comment Composer */}
                                <form onSubmit={handlePostComment} className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                                    <Avatar className="w-8 h-8 rounded-full shrink-0 border border-border">
                                        <AvatarImage src={user.profile_image} className="object-cover" />
                                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">{user.username?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <input
                                        type="text"
                                        placeholder="Add to the conversation..."
                                        className="flex-1 bg-slate-50 dark:bg-zinc-900 border-0 text-sm focus:ring-1 focus:ring-primary/20 rounded-full px-4 py-2 placeholder:text-muted-foreground/60 text-foreground h-10"
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
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Followers / Following List Dialog */}
            <Dialog open={!!viewingList} onOpenChange={(open) => !open && setViewingList(null)}>
                <DialogContent aria-describedby={undefined} className="max-w-md w-full p-0 gap-0 overflow-hidden outline-none border-border bg-card rounded-2xl z-[200]">
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
                                                    {listUser.bio ? listUser.bio.substring(0, 30) + (listUser.bio.length > 30 ? '...' : '') : `ZeeQue Member`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pl-2 shrink-0 flex items-center gap-2">
                                            {listUser.id !== user?.id && (
                                                <FollowButton
                                                    userId={listUser.id}
                                                    username={listUser.username}
                                                    isFollowing={listUser.is_following}
                                                />
                                            )}
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
        </div >
    );
}
