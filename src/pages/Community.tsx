import { useState, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
    Search,
    UserPlus,
    UserCheck,
    Users,
    School,
    BookOpen,
    BadgeCheck,
    GraduationCap,
    Baby,
    FileText,
    MoreHorizontal,
    Share2,
    Link as LinkIcon,
    User as UserIcon
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PublicUser {
    id: string;
    username: string;
    role: string;
    profile_image: string | null;
    bio: string;
    school_name?: string;
    followers_count: number;
    following_count: number;
    is_following: boolean;
}

interface UserApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PublicUser[];
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

import { getRoleColor, isVerifiedRole, ROLE_THEME } from '@/lib/roleUtils';

// Helper to construct button classes from theme
const getButtonClasses = (role: string) => {
    const theme = ROLE_THEME[role] || ROLE_THEME['ALL'];
    return `${theme.bg} text-white ${theme.hover} ${theme.border}`;
};

export default function Community() {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [activeRole, setActiveRole] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'SCHOOL' | 'PARENT' | 'EDITORIAL'>('ALL');

    // Infinite Query for Users
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useInfiniteQuery<UserApiResponse>({
        queryKey: ['community-users', activeRole, debouncedSearch],
        queryFn: async ({ pageParam = 1 }) => {
            const params: any = {
                page: pageParam,
                search: debouncedSearch,
                page_size: 20
            };
            if (activeRole !== 'ALL') {
                params.role = activeRole;
            }
            const response = await api.get('/users/', { params });
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.next) {
                const url = new URL(lastPage.next);
                const page = url.searchParams.get('page');
                return page ? parseInt(page) : undefined;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    // Follow/Unfollow Mutation
    const followMutation = useMutation({
        mutationFn: async ({ userId, isFollowing }: { userId: string, isFollowing: boolean }) => {
            if (isFollowing) {
                await api.post(`/users/${userId}/unfollow/`);
            } else {
                await api.post(`/users/${userId}/follow/`);
            }
        },
        onMutate: async ({ userId, isFollowing }) => {
            // Optimistic Update
            await queryClient.cancelQueries({ queryKey: ['community-users'] });

            const previousData = queryClient.getQueryData(['community-users', activeRole, debouncedSearch]);

            queryClient.setQueryData(['community-users', activeRole, debouncedSearch], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        results: page.results.map((user: PublicUser) => {
                            if (user.id === userId) {
                                return {
                                    ...user,
                                    is_following: !isFollowing,
                                    followers_count: isFollowing ? user.followers_count - 1 : user.followers_count + 1
                                };
                            }
                            return user;
                        })
                    }))
                };
            });

            return { previousData };
        },
        onError: (err, newTodo, context: any) => {
            queryClient.setQueryData(['community-users', activeRole, debouncedSearch], context.previousData);
            toast.error("Failed to update follow status.");
        },
        onSettled: () => {
            // Optional: invalidate queries to ensure consistency
            // queryClient.invalidateQueries({ queryKey: ['community-users'] });
        }
    });

    const [confirmAction, setConfirmAction] = useState<{ type: 'follow' | 'unfollow', user: PublicUser } | null>(null);

    const handleFollowToggle = (e: React.MouseEvent, user: PublicUser) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
            toast.error("Please log in to follow creators.");
            return;
        }
        setConfirmAction({
            type: user.is_following ? 'unfollow' : 'follow',
            user
        });
    };

    const proceedWithAction = () => {
        if (!confirmAction) return;
        followMutation.mutate({
            userId: confirmAction.user.id,
            isFollowing: confirmAction.type === 'unfollow' // true if currently following
        });
        setConfirmAction(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <Header />

            <main className="flex-1">
                {/* Hero Search Section */}
                <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <div className="container relative z-10 max-w-4xl text-center space-y-8 px-4">
                        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight animate-fade-in">
                            Discover the
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 mx-2">
                                Community
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animation-delay-100">
                            Connect with thousands of students, teachers, and schools sharing their creativity.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto group animate-fade-in animation-delay-200 mb-8">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-border/50 rounded-full shadow-lg overflow-hidden h-14 md:h-16 px-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300">
                                <Search className="w-6 h-6 text-slate-400 dark:text-slate-500 ml-4" />
                                <input
                                    type="text"
                                    placeholder="Search by name, school, or bio..."
                                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 appearance-none shadow-none px-4 text-lg placeholder:text-muted-foreground/50 h-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="p-2 mr-2 text-muted-foreground hover:text-foreground">
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Tabs - Horizontal Scroll */}
                        <div className="relative -mx-4 px-4 overflow-hidden">
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mask-fade-right snap-x snap-mandatory px-4 md:justify-center md:px-0">
                                <FilterButton
                                    active={activeRole === 'ALL'}
                                    onClick={() => setActiveRole('ALL')}
                                    icon={<Users className="w-4 h-4" />}
                                    label="All"
                                    activeClass={getButtonClasses('ALL')}
                                    textClass={ROLE_THEME['ALL'].text}
                                />
                                <FilterButton
                                    active={activeRole === 'STUDENT'}
                                    onClick={() => setActiveRole('STUDENT')}
                                    icon={<GraduationCap className="w-4 h-4" />}
                                    label="Students"
                                    activeClass={getButtonClasses('STUDENT')}
                                    textClass={ROLE_THEME['STUDENT'].text}
                                />
                                <FilterButton
                                    active={activeRole === 'TEACHER'}
                                    onClick={() => setActiveRole('TEACHER')}
                                    icon={<School className="w-4 h-4" />}
                                    label="Teachers"
                                    activeClass={getButtonClasses('TEACHER')}
                                    textClass={ROLE_THEME['TEACHER'].text}
                                />
                                <FilterButton
                                    active={activeRole === 'SCHOOL'}
                                    onClick={() => setActiveRole('SCHOOL')}
                                    icon={<BookOpen className="w-4 h-4" />}
                                    label="Schools"
                                    activeClass={getButtonClasses('SCHOOL')}
                                    textClass={ROLE_THEME['SCHOOL'].text}
                                />
                                <FilterButton
                                    active={activeRole === 'PARENT'}
                                    onClick={() => setActiveRole('PARENT')}
                                    icon={<Baby className="w-4 h-4" />}
                                    label="Parents"
                                    activeClass={getButtonClasses('PARENT')}
                                    textClass={ROLE_THEME['PARENT'].text}
                                />
                                <FilterButton
                                    active={activeRole === 'EDITORIAL'}
                                    onClick={() => setActiveRole('EDITORIAL')}
                                    icon={<FileText className="w-4 h-4" />}
                                    label="Editorial"
                                    activeClass={getButtonClasses('EDITORIAL')}
                                    textClass={ROLE_THEME['EDITORIAL'].text}
                                />
                            </div>
                            {/* Gradient Fade for scroll indication on mobile */}
                            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
                            <div className="absolute left-0 top-0 bottom-4 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
                        </div>
                    </div>
                </section>

                {/* Results List */}
                <section className="container max-w-3xl pb-24 px-4 min-h-[50vh]">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40">
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                    <Skeleton className="w-20 h-9 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : (data?.pages[0].results.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                            <div className="bg-muted/50 p-6 rounded-full mb-4">
                                <Search className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-foreground">No users found</h3>
                            <p className="max-w-xs mx-auto">We couldn't find anyone matching "{searchTerm}". Try a different name or role.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {data?.pages.map((page, i) => (
                                <UserListPage
                                    key={i}
                                    results={page.results}
                                    handleFollow={handleFollowToggle}
                                    activeRoleColor={getButtonClasses(activeRole)}
                                    isAuthenticated={!!currentUser}
                                />
                            ))}

                            {/* Load More Trigger */}
                            {hasNextPage && (
                                <div className="flex justify-center pt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="rounded-full px-8 text-muted-foreground hover:text-foreground"
                                    >
                                        {isFetchingNextPage ? (
                                            <Skeleton className="w-4 h-4 mr-2 rounded-full bg-muted-foreground/20" />
                                        ) : null}
                                        {isFetchingNextPage ? 'Loading more...' : 'Show more results'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>
            <Footer />

            <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === 'follow' ? 'Follow User?' : 'Unfollow User?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === 'follow'
                                ? `Are you sure you want to follow ${confirmAction?.user.username}? You will start seeing their updates in your feed.`
                                : `Are you sure you want to unfollow ${confirmAction?.user.username}? You will stop seeing their updates in your feed.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={proceedWithAction}
                            className={confirmAction?.type === 'unfollow' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                        >
                            {confirmAction?.type === 'follow' ? 'Follow' : 'Unfollow'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function UserListPage({ results, handleFollow, activeRoleColor, isAuthenticated }: { results: PublicUser[], handleFollow: any, activeRoleColor: string, isAuthenticated: boolean }) {
    const navigate = useNavigate();

    const handleProfileClick = (userId: string) => {
        if (!isAuthenticated) {
            toast.info("Please log in to view profiles.", {
                action: { label: "Log In", onClick: () => navigate('/login') }
            });
            return;
        }
        navigate(`/profile/${userId}`);
    };

    return (
        <>
            {results.map((user) => (
                <div
                    key={user.id}
                    onClick={() => handleProfileClick(user.id)}
                    className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                >
                    {/* Avatar with optional verified badge */}
                    <div className="relative shrink-0">
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border border-border/50 shadow-sm">
                            <AvatarImage src={user.profile_image || undefined} alt={user.username} className="object-cover" />
                            <AvatarFallback className={cn("font-bold", getRoleColor(user.role).avatar)}>
                                {user.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {isVerifiedRole(user.role) && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-[1px] shadow-sm">
                                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-base text-foreground truncate">
                                {user.username}
                            </h3>
                            {user.role === 'SCHOOL' && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 text-white shrink-0" />}
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground truncate">
                            <span className="capitalize font-medium text-xs bg-muted px-1.5 py-0.5 rounded-md mr-2 shrink-0">
                                {user.role.toLowerCase()}
                            </span>
                            {user.school_name && (
                                <span className="truncate opacity-80" title={user.school_name}>
                                    • {user.school_name}
                                </span>
                            )}
                        </div>
                        {user.bio && (
                            <p className="text-xs text-muted-foreground/70 truncate mt-1 max-w-[90%] hidden sm:block">
                                {user.bio}
                            </p>
                        )}
                    </div>

                    {/* Action */}
                    <div className="shrink-0 flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation() /* Prevent link click */}>
                        <Button
                            size="sm"
                            variant={user.is_following ? "outline" : "default"}
                            className={cn(
                                "rounded-full h-9 px-5 font-semibold transition-all shadow-sm",
                                user.is_following
                                    ? "bg-white dark:bg-transparent border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 w-28"
                                    : cn(activeRoleColor, "w-24")
                            )}
                            onClick={(e) => handleFollow(e, user)}
                        >
                            {user.is_following ? "Following" : "Follow"}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-border/40 backdrop-blur-xl bg-background/95">
                                <DropdownMenuItem
                                    onClick={() => handleProfileClick(user.id)}
                                    className="rounded-xl py-2.5 font-medium cursor-pointer"
                                >
                                    <UserIcon className="w-4 h-4 mr-2 opacity-70" />
                                    View Full Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        const url = `${window.location.origin}/profile/${user.id}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Profile link copied to clipboard!");
                                    }}
                                    className="rounded-xl py-2.5 font-medium cursor-pointer"
                                >
                                    <LinkIcon className="w-4 h-4 mr-2 opacity-70" />
                                    Copy Profile Link
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: `${user.username} on ZeeQue`,
                                                text: `Check out ${user.username}'s profile on ZeeQue Portfolio!`,
                                                url: `${window.location.origin}/profile/${user.id}`,
                                            });
                                        } else {
                                            toast.error("Sharing is not supported on this browser.");
                                        }
                                    }}
                                    className="rounded-xl py-2.5 font-medium cursor-pointer"
                                >
                                    <Share2 className="w-4 h-4 mr-2 opacity-70" />
                                    Share Profile
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
        </>
    );
}

function FilterButton({ active, onClick, icon, label, activeClass, textClass }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, activeClass?: string, textClass?: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                active
                    ? cn(activeClass || "bg-primary text-white border-primary", "shadow-md")
                    : cn("bg-white dark:bg-card border-border/50 hover:bg-muted/50", textClass || "text-primary")
            )}
        >
            <span className={cn("mr-2", active ? "text-white" : textClass || "text-primary")}>{icon}</span>
            {label}
        </button>
    )
}
