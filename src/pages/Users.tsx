import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User } from '@/types/user';
import api from '@/lib/api';
import { UserPlus, Search, School, Phone, Mail, User as UserIcon, Loader2, Trash2, Edit, Calendar, BadgeCheck, Eye, EyeOff, Hash, BookOpen, GraduationCap, Users as UsersIcon, Baby, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
    const [activeTab, setActiveTab] = useState<'SCHOOL' | 'EDITORIAL' | 'STUDENT' | 'TEACHER' | 'PARENT'>('SCHOOL');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const queryClient = useQueryClient();

    // Form State
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        school_name: '',
        school_code: '',
        phone_number: '',
    });

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get<User[]>('/users/');
            return response.data;
        },
    });

    const filteredUsers = users.filter(user => {
        const matchesTab = user.role === activeTab;
        const matchesSearch = (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.school_name && user.school_name.toLowerCase().includes(searchTerm.toLowerCase())));

        const matchesStatus = statusFilter === 'ALL'
            ? true
            : statusFilter === 'ACTIVE'
                ? user.is_onboarded
                : !user.is_onboarded;

        return matchesTab && matchesSearch && matchesStatus;
    });

    const createUserMutation = useMutation({
        mutationFn: async (newUser: any) => {
            const payload = { ...newUser, role: activeTab };
            if (!payload.username) {
                payload.username = payload.email.split('@')[0];
            }
            // Skip onboarding for institutional accounts created by admin
            if (['SCHOOL', 'EDITORIAL'].includes(activeTab)) {
                payload.is_onboarded = true;
            }
            await api.post('/users/', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeSheet();
            const roleLabel = activeTab.charAt(0) + activeTab.slice(1).toLowerCase();
            toast.success(`${roleLabel} user added successfully`);
        },
        onError: (error: any) => {
            const msg = error.response?.data?.detail
                || (typeof error.response?.data === 'object' ? Object.values(error.response.data).flat().join(', ') : '')
                || 'Failed to add user.';
            toast.error(msg);
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: async (data: any) => {
            const { id, ...updatedData } = data;
            if (!updatedData.password) {
                delete updatedData.password;
            }
            await api.patch(`/users/${id}/`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeSheet();
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.detail
                || (typeof error.response?.data === 'object' ? Object.values(error.response.data).flat().join(', ') : '')
                || 'Failed to update user.';
            toast.error(msg);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/users/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setDeleteId(null);
            setViewingUser(null);
            toast.success('User deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete user.');
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone_number') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
            }
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'EDITORIAL' && formData.phone_number && formData.phone_number.length !== 10) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        if (editingUser) {
            if (formData.password && formData.password.length < 8) {
                toast.error("Password must be at least 8 characters long");
                return;
            }
            updateUserMutation.mutate({ ...formData, id: editingUser.id });
        } else {
            if (!formData.email || !formData.password) {
                toast.error("Email and Password are required");
                return;
            }
            if (formData.password.length < 8) {
                toast.error("Password must be at least 8 characters long");
                return;
            }
            createUserMutation.mutate(formData);
        }
    };

    const openAddSheet = () => {
        setEditingUser(null);
        setFormData({
            email: '',
            username: '',
            password: '',
            school_name: '',
            school_code: '',
            phone_number: '',
        });
        setIsSheetOpen(true);
    };

    const openEditSheet = (e: React.MouseEvent, user: User) => {
        e.stopPropagation();
        setEditingUser(user);
        setFormData({
            email: user.email,
            username: user.username,
            password: '',
            school_name: user.school_name || '',
            school_code: user.school_code || '',
            phone_number: user.phone_number || '',
        });
        setIsSheetOpen(true);
    };

    const confirmDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const closeSheet = () => {
        setIsSheetOpen(false);
        setEditingUser(null);
        setFormData({
            email: '',
            username: '',
            password: '',
            school_name: '',
            school_code: '',
            phone_number: '',
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <Header />

            <main className="flex-1 container max-w-7xl py-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-display font-bold tracking-tight mb-2">
                            User Management
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Manage School and Editorial accounts.
                        </p>
                    </div>

                    <Button onClick={openAddSheet} size="lg" className="rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-hero border-0">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Add New {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
                    </Button>
                </div>

                <Tabs defaultValue="SCHOOL" onValueChange={(val) => setActiveTab(val as 'SCHOOL' | 'EDITORIAL' | 'STUDENT' | 'TEACHER' | 'PARENT')} className="w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex flex-col md:flex-row items-center mb-8 gap-4">
                        <TabsList className="w-full md:w-auto p-1 bg-white dark:bg-muted/50 rounded-xl md:rounded-full h-auto overflow-x-auto flex flex-nowrap justify-start md:justify-center scrollbar-hide snap-x mask-linear-fade">
                            <TabsTrigger value="SCHOOL" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2">
                                <School className="w-4 h-4" />
                                <span>Schools</span>
                            </TabsTrigger>
                            <TabsTrigger value="EDITORIAL" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>Editorial</span>
                            </TabsTrigger>
                            <TabsTrigger value="STUDENT" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 data-[state=active]:shadow-sm transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                <span>Students</span>
                            </TabsTrigger>
                            <TabsTrigger value="TEACHER" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-green-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2">
                                <UsersIcon className="w-4 h-4" />
                                <span>Teachers</span>
                            </TabsTrigger>
                            <TabsTrigger value="PARENT" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2">
                                <Baby className="w-4 h-4" />
                                <span>Parents</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:flex-1 md:pl-4">
                            {/* Filter Dropdown */}
                            <Select value={statusFilter} onValueChange={(val: 'ALL' | 'ACTIVE' | 'PENDING') => setStatusFilter(val)}>
                                <SelectTrigger className="w-full sm:w-[150px] h-12 rounded-full border-border/40 bg-white dark:bg-muted/30 focus:dark:bg-background focus:ring-primary/20 transition-all duration-300 shadow-sm pl-4">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="truncate">{statusFilter === 'ALL' ? 'All Status' : statusFilter === 'ACTIVE' ? 'Active' : 'Pending'}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent align="end" className="rounded-xl border-border/40 backdrop-blur-xl bg-background/95">
                                    <SelectItem value="ALL" className="cursor-pointer focus:bg-muted/50 rounded-lg my-1">All Status</SelectItem>
                                    <SelectItem value="ACTIVE" className="cursor-pointer focus:bg-muted/50 rounded-lg my-1 text-green-600 dark:text-green-400 font-medium">Active</SelectItem>
                                    <SelectItem value="PENDING" className="cursor-pointer focus:bg-muted/50 rounded-lg my-1 text-amber-600 dark:text-amber-400 font-medium">Pending</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Search Bar */}
                            <div className="relative w-full sm:w-auto md:min-w-[300px] group flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder={`Search ${activeTab.toLowerCase()}s...`}
                                    className="pl-10 h-12 rounded-full border-border/40 bg-white dark:bg-muted/30 focus:dark:bg-background focus:ring-primary/20 transition-all duration-300 shadow-sm w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border/40 bg-white dark:bg-card/50 backdrop-blur-sm shadow-card overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 flex justify-center text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No {activeTab.toLowerCase()}s found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    {searchTerm ? "Try adjusting your search terms." : `Get started by adding your first ${activeTab.toLowerCase()} account.`}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-b border-border/40">
                                        <TableHead className="pl-6 h-14">Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        {activeTab === 'SCHOOL' && <TableHead>School Code</TableHead>}
                                        {(activeTab === 'EDITORIAL' || activeTab === 'PARENT') && <TableHead>Phone</TableHead>}
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user, index) => (
                                        <TableRow
                                            key={user.id}
                                            className="cursor-pointer transition-colors hover:bg-muted/30 border-b border-border/40 last:border-0"
                                            onClick={() => setViewingUser(user)}
                                        >
                                            <TableCell className="pl-6 font-medium py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                                                        {user.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span>{user.username}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            {activeTab === 'SCHOOL' && (
                                                <TableCell>
                                                    {user.school_code ? (
                                                        <div className="flex items-center gap-2">
                                                            <Hash className="w-4 h-4 text-muted-foreground" />
                                                            {user.school_code}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-sm">-</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            {(activeTab === 'EDITORIAL' || activeTab === 'PARENT') && (
                                                <TableCell>
                                                    {user.phone_number ? (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                                            {user.phone_number}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-sm">-</span>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-center">
                                                {user.is_onboarded ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                        Pending
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                                                        onClick={(e) => openEditSheet(e, user)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                        onClick={(e) => confirmDelete(e, user.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </Tabs>
            </main>

            <Footer />

            <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <DialogContent noContentWrapper className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden max-h-[85vh] border-border/60 flex flex-col">
                    <div className="bg-gradient-hero h-24 w-full flex items-center justify-center relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-white/10" />
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-4 shadow-sm z-10 border border-white/20">
                            {activeTab === 'SCHOOL' && <School className="h-8 w-8 text-white" />}
                            {activeTab === 'EDITORIAL' && <BookOpen className="h-8 w-8 text-white" />}
                            {activeTab === 'STUDENT' && <GraduationCap className="h-8 w-8 text-white" />}
                            {activeTab === 'TEACHER' && <UsersIcon className="h-8 w-8 text-white" />}
                            {activeTab === 'PARENT' && <Baby className="h-8 w-8 text-white" />}
                        </div>
                    </div>

                    <div className="px-6 pb-8 pt-4 overflow-y-auto flex-1">
                        <DialogHeader className="mb-6 text-center">
                            <DialogTitle className="text-2xl font-display text-center">
                                {editingUser ? `Edit ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}` : `Add ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Name</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="username"
                                            name="username"
                                            placeholder="Name"
                                            className="pl-9 rounded-xl"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="email@example.com"
                                            className="pl-9 rounded-xl"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {activeTab === 'SCHOOL' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="school_code">School Code</Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="school_code"
                                                name="school_code"
                                                placeholder="SC12345"
                                                className="pl-9 rounded-xl"
                                                value={formData.school_code}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {['EDITORIAL', 'PARENT'].includes(activeTab) && (
                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number">Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone_number"
                                                name="phone_number"
                                                placeholder="(555) 000-0000"
                                                className="pl-9 rounded-xl"
                                                value={formData.phone_number}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {editingUser ? 'New Password (Optional)' : 'Password'}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                                            className="rounded-xl pr-10"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editingUser}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="mt-8 gap-3 sm:gap-0">
                                <Button variant="outline" type="button" onClick={closeSheet} className="flex-1 rounded-full border-border/60 hover:bg-muted">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                    className="flex-[2] rounded-full bg-gradient-hero border-0 shadow-md hover:shadow-lg transition-all"
                                >
                                    {(createUserMutation.isPending || updateUserMutation.isPending) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {editingUser ? 'Update Account' : 'Create Account'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the account
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteUserMutation.mutate(deleteId)}
                            className="bg-destructive hover:bg-destructive/90 rounded-full"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View User Dialog */}
            <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
                <DialogContent noContentWrapper className="max-w-md rounded-3xl p-0 overflow-hidden max-h-[85vh] border-border/60 flex flex-col">
                    <div className="h-24 bg-gradient-hero w-full relative shrink-0 z-10">
                        <div className="absolute -bottom-12 left-6">
                            <div className="h-24 w-24 rounded-full border-4 border-background bg-white shadow-xl flex items-center justify-center text-3xl font-display font-bold text-primary">
                                {viewingUser?.username?.[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-10 px-6 overflow-y-auto flex-1">
                        <DialogHeader className="mb-6 text-left">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {viewingUser?.username}
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground">
                                {viewingUser?.role} Account
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Email</Label>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Mail className="h-4 w-4 text-primary" />
                                        {viewingUser?.email}
                                    </div>
                                </div>
                                {viewingUser?.role === 'SCHOOL' && (
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">School Code</Label>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Hash className="h-4 w-4 text-primary" />
                                            {viewingUser?.school_code || 'N/A'}
                                        </div>
                                    </div>
                                )}
                                {viewingUser?.role === 'EDITORIAL' && (
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Phone</Label>
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Phone className="h-4 w-4 text-primary" />
                                            {viewingUser?.phone_number || 'N/A'}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Joined</Label>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        {viewingUser?.date_joined ? format(new Date(viewingUser.date_joined), 'MMM d, yyyy') : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
