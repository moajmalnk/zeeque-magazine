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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { User, UserRole } from '@/types/user';
import api from '@/lib/api';
import { UserPlus, Search, School, Phone, Mail, User as UserIcon, Loader2, Trash2, Edit, Calendar, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Teachers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const queryClient = useQueryClient();

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        school_name: '',
        phone_number: '',
    });

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get<User[]>('/users/');
            return response.data;
        },
    });

    const teachers = users.filter(user =>
        user.role === 'TEACHER' &&
        (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.school_name && user.school_name.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const createTeacherMutation = useMutation({
        mutationFn: async (newTeacher: any) => {
            const payload = { ...newTeacher, role: 'TEACHER' };
            if (!payload.username) {
                payload.username = payload.email.split('@')[0];
            }
            await api.post('/users/', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeSheet();
            toast.success('Teacher added successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to add teacher. ' + (error.response?.data?.email?.[0] || 'Check details.'));
        }
    });

    const updateTeacherMutation = useMutation({
        mutationFn: async (data: any) => {
            const { id, ...updatedData } = data;
            // Remove password from update if empty
            if (!updatedData.password) {
                delete updatedData.password;
            }
            await api.patch(`/users/${id}/`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeSheet();
            toast.success('Teacher updated successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to update teacher.');
        }
    });

    const deleteTeacherMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/users/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setDeleteId(null);
            setViewingUser(null);
            toast.success('Teacher deleted successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to delete teacher.');
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            updateTeacherMutation.mutate({ ...formData, id: editingUser.id });
        } else {
            if (!formData.email || !formData.password) {
                toast.error("Email and Password are required");
                return;
            }
            createTeacherMutation.mutate(formData);
        }
    };

    const openAddSheet = () => {
        setEditingUser(null);
        setFormData({
            email: '',
            username: '',
            password: '',
            school_name: '',
            phone_number: '',
        });
        setIsSheetOpen(true);
    };

    const openEditSheet = (e: React.MouseEvent, user: User) => {
        e.stopPropagation(); // Prevent row click
        setEditingUser(user);
        setFormData({
            email: user.email,
            username: user.username,
            password: '', // Don't show current password
            school_name: user.school_name || '',
            phone_number: user.phone_number || '',
        });
        setIsSheetOpen(true);
    };

    const confirmDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Prevent row click
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
            phone_number: '',
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <Header />

            <main className="flex-1 container max-w-7xl py-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-display font-bold tracking-tight mb-2">
                            Teachers Directory
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Manage authorized educators and their school details.
                        </p>
                    </div>

                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button onClick={openAddSheet} size="lg" className="rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-hero border-0">
                                <UserPlus className="mr-2 h-5 w-5" />
                                Add New Teacher
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px] border-l-border/50">
                            <SheetHeader className="mb-8">
                                <SheetTitle className="text-2xl font-display">
                                    {editingUser ? 'Edit Teacher' : 'Add Teacher'}
                                </SheetTitle>
                                <SheetDescription>
                                    {editingUser
                                        ? 'Update the teacher\'s information below.'
                                        : 'Create a new teacher account. They will be able to manage student submissions.'
                                    }
                                </SheetDescription>
                            </SheetHeader>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="teacher@school.edu"
                                            className="pl-9"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Full Name (Username)</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="username"
                                            name="username"
                                            placeholder="Ms. Jane Doe"
                                            className="pl-9"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="school_name">School Name</Label>
                                    <div className="relative">
                                        <School className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="school_name"
                                            name="school_name"
                                            placeholder="Springfield Elementary"
                                            className="pl-9"
                                            value={formData.school_name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone_number"
                                            name="phone_number"
                                            placeholder="+1 (555) 000-0000"
                                            className="pl-9"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {editingUser ? 'New Password (Optional)' : 'Password'}
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={!editingUser}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Must be at least 8 characters.
                                    </p>
                                </div>

                                <SheetFooter className="mt-8">
                                    <Button variant="outline" type="button" onClick={closeSheet} className="mr-2">Cancel</Button>
                                    <Button
                                        type="submit"
                                        disabled={createTeacherMutation.isPending || updateTeacherMutation.isPending}
                                        className="bg-gradient-hero border-0"
                                    >
                                        {(createTeacherMutation.isPending || updateTeacherMutation.isPending) && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {editingUser ? 'Update Account' : 'Create Account'}
                                    </Button>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 max-w-md animate-slide-up group" style={{ animationDelay: '100ms' }}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search by name, email, or school..."
                        className="pl-10 h-12 rounded-full border-2 border-transparent bg-muted/30 focus:bg-background focus:border-primary/20 transition-all duration-300 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Table Card */}
                <div className="rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
                    {isLoading ? (
                        <div className="p-12 flex justify-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : teachers.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <UserIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                {searchTerm ? "Try adjusting your search terms." : "Get started by adding your first teacher account."}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-b border-border/40">
                                    <TableHead className="pl-6 h-14">Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>School Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.map((teacher, index) => (
                                    <TableRow
                                        key={teacher.id}
                                        className={cn(
                                            "cursor-pointer transition-colors hover:bg-muted/30 border-b border-border/40 last:border-0",
                                        )}
                                        style={{
                                            animationDelay: `${300 + (index * 50)}ms`
                                        }}
                                        onClick={() => setViewingUser(teacher)}
                                    >
                                        <TableCell className="pl-6 font-medium py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                                                    {teacher.username[0].toUpperCase()}
                                                </div>
                                                <span>{teacher.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>
                                            {teacher.school_name ? (
                                                <div className="flex items-center gap-2">
                                                    <School className="w-4 h-4 text-muted-foreground" />
                                                    {teacher.school_name}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">Not specified</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {teacher.phone_number ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    {teacher.phone_number}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                                                    onClick={(e) => openEditSheet(e, teacher)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                    onClick={(e) => confirmDelete(e, teacher.id)}
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
            </main>

            <Footer />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the teacher account
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteTeacherMutation.mutate(deleteId)}
                            className="bg-destructive hover:bg-destructive/90 rounded-full"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Detail/Profile View Dialog */}
            <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-border/60">
                    {/* Header Background */}
                    <div className="h-32 bg-gradient-hero w-full relative">
                        <div className="absolute -bottom-12 left-6">
                            <div className="h-24 w-24 rounded-full border-4 border-background bg-white shadow-xl flex items-center justify-center text-3xl font-display font-bold text-primary">
                                {viewingUser?.username?.[0]?.toUpperCase()}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
                            onClick={() => setViewingUser(null)}
                        >
                            {/* Close icon handled by Dialog but custom close also common or just let default X work */}
                        </Button>
                    </div>

                    <div className="pt-16 pb-8 px-6">
                        <DialogHeader className="mb-6 text-left">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {viewingUser?.username}
                                <BadgeCheck className="h-5 w-5 text-blue-500" />
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground">
                                Teacher Account
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
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">School</Label>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <School className="h-4 w-4 text-primary" />
                                        {viewingUser?.school_name || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Phone</Label>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Phone className="h-4 w-4 text-primary" />
                                        {viewingUser?.phone_number || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Joined</Label>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        {viewingUser?.date_joined ? format(new Date(viewingUser.date_joined), 'MMM d, yyyy') : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-200 text-sm border border-orange-100 dark:border-orange-900/30">
                                <p className="font-semibold mb-1 flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    Authorized Educator
                                </p>
                                <p className="opacity-90">
                                    This user has full access to manage student submissions and review creative works for their school.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button className="flex-1 rounded-full bg-gradient-hero border-0 shadow-md" onClick={(e) => {
                                    setViewingUser(null);
                                    if (viewingUser) openEditSheet(e as any, viewingUser);
                                }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-full border-border/60" onClick={() => setViewingUser(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
