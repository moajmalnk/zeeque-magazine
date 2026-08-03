import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { SchoolSelector } from '@/components/SchoolSelector';
import { useSchools } from '@/hooks/useSchools';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { toast } from 'sonner';
import { getRoleColor, isVerifiedRole } from '@/lib/roleUtils';
import { format } from 'date-fns';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { 
    Download, 
    UserPlus, 
    School, 
    BookOpen, 
    GraduationCap, 
    Users as UsersIcon, 
    Baby, 
    ListFilter, 
    SortAsc, 
    Search, 
    X, 
    RotateCcw, 
    User as UserIcon, 
    Hash, 
    Phone, 
    BadgeCheck, 
    Edit, 
    Trash2, 
    ChevronsLeft, 
    ChevronsRight, 
    Zap, 
    ShieldOff, 
    ShieldCheck, 
    Calendar, 
    PenLine, 
    Mail, 
    Eye, 
    EyeOff, 
    Globe 
} from 'lucide-react';


export default function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'BLOCKED'>('ALL');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
    const [activeTab, setActiveTab] = useState<'SCHOOL' | 'EDITORIAL' | 'STUDENT' | 'TEACHER' | 'PARENT'>('SCHOOL');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [blockingUser, setBlockingUser] = useState<User | null>(null);
    const queryClient = useQueryClient();

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, statusFilter, sortBy, debouncedSearch]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Form State
    const [showPassword, setShowPassword] = useState(false);
    const initialFormState = {
        email: '',
        username: '',
        password: '',
        school_name: '',
        school_code: '',
        phone_number: '',
        bio: '',
        website: '',
        place: '',
        district: '',
        state: '',
        country: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isManualSchoolMode, setIsManualSchoolMode] = useState(false);

    const { data: schoolsData = [] } = useSchools();

    // Sync manual mode when editing a school
    useEffect(() => {
        if (editingUser && activeTab === 'SCHOOL') {
            const isKnown = (schoolsData as any[]).some(s => s.school_code === editingUser.school_code);
            setIsManualSchoolMode(!isKnown && !!editingUser.school_code);
        } else if (editingUser) {
            const isKnown = (schoolsData as any[]).some(s => s.school_name === editingUser.school_name || s.school_code === editingUser.school_code);
            setIsManualSchoolMode(!isKnown && !!editingUser.school_name);
        } else {
            setIsManualSchoolMode(false);
        }
    }, [editingUser, activeTab, schoolsData]);

    const handleSchoolSelect = (schoolId: string, school: any) => {
        if (school) {
            setFormData(prev => ({
                ...prev,
                ...(activeTab === 'SCHOOL' ? { username: school.original_name } : {}),
                school_name: school.original_name,
                school_code: school.code,
                place: school.place || prev.place,
                district: school.district || prev.district,
                state: school.state || prev.state,
                country: school.country || prev.country
            }));
        }
    };

    const getOrderingParam = () => {
        if (sortBy === 'oldest') return 'created_at';
        if (sortBy === 'name') return 'username';
        return '-created_at'; // newest
    };

    const { data: usersData, isLoading, isFetching } = useQuery({
        queryKey: ['users', activeTab, statusFilter, sortBy, debouncedSearch, currentPage, pageSize],
        queryFn: async () => {
            const params: Record<string, string | number> = {
                role: activeTab,
                page: currentPage,
                page_size: pageSize,
                ordering: getOrderingParam(),
            };

            if (debouncedSearch.trim()) {
                params.search = debouncedSearch.trim();
            }

            if (statusFilter === 'ACTIVE') {
                params.is_onboarded = 'true';
                params.is_active = 'true';
            }
            if (statusFilter === 'PENDING') params.is_onboarded = 'false';
            if (statusFilter === 'BLOCKED') params.is_active = 'false';

            const response = await api.get<any>('/users/', { params });
            return response.data;
        },
    });

    const results = usersData?.results || [];
    const totalCount = usersData?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const handleExport = async () => {
        const toastId = toast.loading(`Preparing export for ${activeTab.toLowerCase()} list...`);
        try {
            // Fetch ALL matching users (handling pagination)
            let allResults: any[] = [];
            let nextPage = 1;
            let hasMore = true;

            // Use a larger page size for export if supported, otherwise 100 (backend max)
            const exportPageSize = 100;

            while (hasMore) {
                const params: Record<string, string | number> = {
                    role: activeTab,
                    page: nextPage,
                    page_size: exportPageSize,
                    ordering: getOrderingParam(),
                };

                if (debouncedSearch.trim()) {
                    params.search = debouncedSearch.trim();
                }

                if (statusFilter === 'ACTIVE') {
                    params.is_onboarded = 'true';
                    params.is_active = 'true';
                }
                if (statusFilter === 'PENDING') params.is_onboarded = 'false';
                if (statusFilter === 'BLOCKED') params.is_active = 'false';

                const response = await api.get<any>('/users/', { params });
                const data = response.data;
                allResults = [...allResults, ...(data.results || [])];

                if (data.next && allResults.length < 1000) { // Limit to 1000 for safety in frontend
                    nextPage++;
                } else {
                    hasMore = false;
                }
            }

            if (allResults.length === 0) {
                toast.error("No users found to export.", { id: toastId });
                return;
            }

            // Create Worksheet Data
            const reportMetadata = [
                ["ZeeQue User Management Report"],
                [`Role: ${activeTab}`, `Status: ${statusFilter}`, `Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`],
                [""], // Spacer
                ['Name', 'Email', 'School Code', 'Place', 'District', 'State', 'Country', 'Status']
            ];

            const rowData = allResults.map(user => [
                user.school_name || user.username || '-',
                user.email,
                user.school_code || '-',
                user.place || '-',
                user.district || '-',
                user.state || '-',
                user.country || '-',
                user.is_active ? 'ACTIVE' : 'BLOCKED'
            ]);

            const fullData = [...reportMetadata, ...rowData];

            // Create Workbook and Worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(fullData);

            // Professional Styling - Column Widths
            const colWidths = [
                { wch: 35 }, // Name
                { wch: 30 }, // Email
                { wch: 15 }, // School Code
                { wch: 20 }, // Place
                { wch: 20 }, // District
                { wch: 15 }, // State
                { wch: 15 }, // Country
                { wch: 12 }, // Status
            ];
            ws['!cols'] = colWidths;

            // Merge cells for the title
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } } // Merge A1-H1
            ];

            // Append Worksheet to Workbook
            XLSX.utils.book_append_sheet(wb, ws, "Users Report");

            // Export to File
            const dateStr = format(new Date(), 'yyyy-MM-dd');
            XLSX.writeFile(wb, `ZeeQue_${activeTab.toLowerCase()}_report_${dateStr}.xlsx`);

            toast.success(`${activeTab} report exported successfully! (${allResults.length} records)`, { id: toastId });
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report.', { id: toastId });
        }
    };

    const createUserMutation = useMutation({
        mutationFn: async (newUser: any) => {
            const payload = { ...newUser, role: activeTab };
            if (!payload.username) {
                payload.username = (activeTab === 'SCHOOL' && payload.school_name) 
                    ? payload.school_name 
                    : payload.email.split('@')[0];
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
            const { id, ...raw } = data;
            const updatedData: Record<string, any> = { ...raw };

            // School display name in the table is `username` — keep it in sync with school_name
            if (activeTab === 'SCHOOL' && updatedData.school_name?.trim()) {
                updatedData.username = updatedData.school_name.trim();
                updatedData.school_name = updatedData.school_name.trim();
            }
            if (typeof updatedData.school_code === 'string') {
                updatedData.school_code = updatedData.school_code.trim();
            }
            if (typeof updatedData.email === 'string') {
                updatedData.email = updatedData.email.trim();
            }

            if (!updatedData.password) {
                delete updatedData.password;
            }
            // Empty website fails URLField validation on some backends
            if (!updatedData.website?.trim()) {
                updatedData.website = '';
            }

            await api.patch(`/users/${id}/`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeSheet();
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            const data = error.response?.data;
            let msg = 'Failed to update user.';
            if (typeof data === 'string') {
                msg = data;
            } else if (data?.detail) {
                msg = Array.isArray(data.detail) ? data.detail.join(', ') : String(data.detail);
            } else if (data && typeof data === 'object') {
                msg = Object.entries(data)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
                    .join(' · ');
            }
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

    const toggleUserStatusMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
            await api.patch(`/users/${id}/`, { is_active });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setBlockingUser(null);
            setViewingUser(null);
            toast.success(`User ${variables.is_active ? 'unblocked' : 'blocked'} successfully`);
        },
        onError: () => {
            toast.error('Failed to update user status.');
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

        if (activeTab === 'SCHOOL') {
            if (!formData.school_name?.trim()) {
                toast.error('School name is required');
                return;
            }
            if (!formData.school_code?.trim()) {
                toast.error('Institution code is required');
                return;
            }
        }

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
            const payload = { ...formData };
            if (activeTab === 'SCHOOL' && payload.school_name?.trim()) {
                payload.username = payload.school_name.trim();
                payload.school_name = payload.school_name.trim();
            }
            createUserMutation.mutate(payload);
        }
    };

    const openAddSheet = () => {
        setEditingUser(null);
        setFormData(initialFormState);
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
            bio: user.bio || '',
            website: user.website || '',
            place: user.place || '',
            district: user.district || '',
            state: user.state || '',
            country: user.country || '',
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
        setFormData(initialFormState);
    };

    const getImageUrl = (url: string | null | undefined) => {
        if (!url) return '';
        if (url.startsWith('http')) {
            try {
                const urlObj = new URL(url);
                if (urlObj.port === '8000' || urlObj.hostname === '127.0.0.1' || urlObj.hostname === 'localhost') {
                    return urlObj.pathname;
                }
            } catch (e) {
                return url;
            }
        }
        return url;
    };

    const DetailItem = ({ label, value, icon: Icon }: { label: string, value: string | null | undefined, icon: any }) => (
        <div className="space-y-1.5 px-1">
            <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">{label}</Label>
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800 dark:text-zinc-200">
                <div className="p-1.5 rounded-lg bg-primary/5 dark:bg-primary/20 text-primary shrink-0">
                    <Icon className="h-4 w-4" />
                </div>
                <span className="truncate">{value || 'Not provided'}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
            <Header />

            <main className="flex-1 container max-w-7xl py-8 md:py-10">
                <Tabs
                    defaultValue="SCHOOL"
                    onValueChange={(val) => {
                        setActiveTab(val as 'SCHOOL' | 'EDITORIAL' | 'STUDENT' | 'TEACHER' | 'PARENT');
                        // Status filter was sticky across tabs (e.g. BLOCKED), which hid matching users on the next role tab.
                        setStatusFilter('ALL');
                        setCurrentPage(1);
                    }}
                    className="w-full animate-slide-up space-y-4"
                >
                    {/* Row 1: filters + actions */}
                    <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 shrink-0">
                                <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                                    <SelectTrigger className="flex-1 sm:w-[140px] h-11 rounded-full border-border/40 bg-white dark:bg-muted/20 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 shadow-sm pl-4">
                                        <div className="flex items-center gap-2 truncate">
                                            <ListFilter className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-[11px] font-black uppercase tracking-wider truncate">
                                                {statusFilter === 'ALL' ? 'Status' : statusFilter}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent align="start" className="rounded-2xl border-border/40 backdrop-blur-xl bg-background/95 p-1">
                                        <SelectItem value="ALL" className="rounded-xl font-bold py-2.5">All Status</SelectItem>
                                        <SelectItem value="ACTIVE" className="rounded-xl font-bold py-2.5 text-green-600">Active</SelectItem>
                                        <SelectItem value="PENDING" className="rounded-xl font-bold py-2.5 text-amber-600">Pending</SelectItem>
                                        <SelectItem value="BLOCKED" className="rounded-xl font-bold py-2.5 text-rose-600">Blocked</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                                    <SelectTrigger className="flex-1 sm:w-[140px] h-11 rounded-full border-border/40 bg-white dark:bg-muted/20 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 shadow-sm pl-4">
                                        <div className="flex items-center gap-2 truncate">
                                            <SortAsc className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-[11px] font-black uppercase tracking-wider truncate">
                                                {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Name'}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent align="start" className="rounded-2xl border-border/40 backdrop-blur-xl bg-background/95 p-1">
                                        <SelectItem value="newest" className="rounded-xl font-bold py-2.5">Newest Joined</SelectItem>
                                        <SelectItem value="oldest" className="rounded-xl font-bold py-2.5">Oldest Joined</SelectItem>
                                        <SelectItem value="name" className="rounded-xl font-bold py-2.5">Alphabetical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="relative group flex-1 min-w-0">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <Search className="h-4 w-4 text-slate-500 dark:text-zinc-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder={`Search ${activeTab.toLowerCase()} accounts...`}
                                        className="pl-10 h-11 rounded-full border-border/40 bg-white dark:bg-muted/20 backdrop-blur-sm focus:dark:bg-background focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-300 shadow-sm w-full font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setDebouncedSearch('');
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                {(statusFilter !== 'ALL' || sortBy !== 'newest' || searchTerm) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setStatusFilter('ALL');
                                            setSortBy('newest');
                                            setSearchTerm('');
                                            setDebouncedSearch('');
                                        }}
                                        className="h-11 shrink-0 px-4 rounded-full border-2 border-primary/50 bg-primary/15 text-foreground hover:bg-primary/25 hover:border-primary dark:bg-primary/20 dark:border-primary/60 dark:text-white dark:hover:bg-primary/30 text-[10px] font-black uppercase tracking-widest shadow-sm"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                className="rounded-full h-11 border-border/40 hover:bg-muted font-semibold transition-all flex-1 sm:flex-none"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export List
                            </Button>
                            <Button
                                onClick={openAddSheet}
                                className="rounded-full h-11 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-hero border-0 flex-1 sm:flex-none font-bold"
                            >
                                <UserPlus className="mr-2 h-5 w-5" />
                                Add New {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
                            </Button>
                        </div>
                    </div>

                    {/* Row 2: role tabs */}
                    <TabsList className="w-full p-1 bg-white dark:bg-muted/50 rounded-xl md:rounded-full h-auto overflow-x-auto flex flex-nowrap justify-start scrollbar-hide snap-x">
                        <TabsTrigger value="SCHOOL" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2 font-bold">
                            <School className="w-4 h-4" />
                            <span>Schools</span>
                        </TabsTrigger>
                        <TabsTrigger value="EDITORIAL" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2 font-bold">
                            <BookOpen className="w-4 h-4" />
                            <span>Editorial</span>
                        </TabsTrigger>
                        <TabsTrigger value="STUDENT" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2 font-bold">
                            <GraduationCap className="w-4 h-4" />
                            <span>Students</span>
                        </TabsTrigger>
                        <TabsTrigger value="TEACHER" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2 font-bold">
                            <UsersIcon className="w-4 h-4" />
                            <span>Teachers</span>
                        </TabsTrigger>
                        <TabsTrigger value="PARENT" className="rounded-full px-4 md:px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 flex-shrink-0 whitespace-nowrap snap-start flex items-center gap-2 font-bold">
                            <Baby className="w-4 h-4" />
                            <span>Parents</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="rounded-3xl border border-border/40 bg-white dark:bg-card/50 backdrop-blur-sm shadow-card overflow-hidden">
                        {(isLoading || (isFetching && results.length === 0)) ? (
                            <div className="p-8 space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-6 flex-1 rounded-md" />
                                        <Skeleton className="h-6 w-24 rounded-md" />
                                        <Skeleton className="h-6 w-20 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No {activeTab.toLowerCase()}s found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    {statusFilter !== 'ALL' && searchTerm
                                        ? `No ${statusFilter.toLowerCase()} ${activeTab.toLowerCase()}s match “${searchTerm}”. Try Status → All, or clear search.`
                                        : statusFilter !== 'ALL'
                                            ? `No ${statusFilter.toLowerCase()} ${activeTab.toLowerCase()}s in this list. Try Status → All.`
                                            : searchTerm
                                                ? "Try adjusting your search terms, or search by name, email, or phone."
                                                : `Get started by adding your first ${activeTab.toLowerCase()} account.`}
                                </p>
                                {(statusFilter !== 'ALL' || searchTerm) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-5 rounded-full font-bold"
                                        onClick={() => {
                                            setStatusFilter('ALL');
                                            setSortBy('newest');
                                            setSearchTerm('');
                                            setDebouncedSearch('');
                                        }}
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-b border-border/40">
                                        <TableHead className="pl-6 h-14">Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        {activeTab === 'SCHOOL' && (
                                            <>
                                                <TableHead>School Code</TableHead>
                                                <TableHead>Place</TableHead>
                                                <TableHead>District</TableHead>
                                                <TableHead className="hidden lg:table-cell">State</TableHead>
                                                <TableHead className="hidden lg:table-cell">Country</TableHead>
                                            </>
                                        )}
                                        {['STUDENT', 'TEACHER', 'PARENT'].includes(activeTab) && <TableHead>School</TableHead>}
                                        {activeTab === 'STUDENT' && <TableHead>Teacher</TableHead>}
                                        {['EDITORIAL', 'TEACHER', 'PARENT'].includes(activeTab) && <TableHead>Phone</TableHead>}
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((user: User, index: number) => (
                                        <TableRow
                                            key={user.id}
                                            className={cn(
                                                "cursor-pointer transition-colors hover:bg-muted/30 border-b border-border/40 last:border-0",
                                                isFetching && "opacity-60"
                                            )}
                                            onClick={() => setViewingUser(user)}
                                        >
                                            <TableCell className="pl-6 font-medium py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative group/avatar">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-full flex items-center justify-center overflow-hidden border-2 transition-transform duration-300 group-hover/avatar:scale-105 shadow-sm bg-muted",
                                                            getRoleColor(user.role).border
                                                        )}>
                                                            {user.profile_image ? (
                                                                <img
                                                                    src={getImageUrl(user.profile_image)}
                                                                    alt={user.username}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className={cn("h-full w-full flex items-center justify-center font-bold text-sm", getRoleColor(user.role).avatar)}>
                                                                    {user.username?.[0]?.toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isVerifiedRole(user.role) && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-zinc-950 rounded-full p-[1px] shadow-sm z-10">
                                                                <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-slate-700 dark:text-zinc-200">
                                                        {activeTab === 'SCHOOL'
                                                            ? (user.school_name || user.username)
                                                            : user.username}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            {activeTab === 'SCHOOL' && (
                                                <>
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
                                                    <TableCell>{user.place || <span className="text-muted-foreground italic text-sm">-</span>}</TableCell>
                                                    <TableCell>{user.district || <span className="text-muted-foreground italic text-sm">-</span>}</TableCell>
                                                    <TableCell className="hidden lg:table-cell">{user.state || <span className="text-muted-foreground italic text-sm">-</span>}</TableCell>
                                                    <TableCell className="hidden lg:table-cell">{user.country || <span className="text-muted-foreground italic text-sm">-</span>}</TableCell>
                                                </>
                                            )}
                                            {['STUDENT', 'TEACHER', 'PARENT'].includes(activeTab) && (
                                                <TableCell>
                                                    {user.school_name || <span className="text-muted-foreground italic text-sm">-</span>}
                                                </TableCell>
                                            )}
                                            {activeTab === 'STUDENT' && (
                                                <TableCell>
                                                    {user.teacher_name || <span className="text-muted-foreground italic text-sm">-</span>}
                                                </TableCell>
                                            )}
                                            {['EDITORIAL', 'TEACHER', 'PARENT'].includes(activeTab) && (
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
                                                {!user.is_active ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200/50">
                                                        Blocked
                                                    </span>
                                                ) : user.is_onboarded ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
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

                    {/* Pagination Controls */}
                    {!isLoading && results.length > 0 && (
                        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-muted-foreground bg-white dark:bg-card/50 px-4 sm:px-6 py-4 sm:py-3 rounded-[2rem] sm:rounded-full border border-border/40 shadow-sm w-full md:w-auto">
                                <div className="font-medium text-center sm:text-left">
                                    Total: <span className="text-foreground font-bold">{totalCount}</span> {activeTab.toLowerCase()}s
                                </div>
                                <div className="hidden sm:block w-px h-4 bg-border/60" />
                                <div className="flex items-center gap-3 sm:gap-2">
                                    <span className="text-xs sm:text-sm">Rows per page:</span>
                                    <Select
                                        value={pageSize.toString()}
                                        onValueChange={(val) => {
                                            setPageSize(parseInt(val));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-9 sm:h-8 w-20 rounded-xl sm:rounded-lg border-border/40 bg-transparent font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[10, 20, 50, 100].map(size => (
                                                <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Pagination className="mx-0 w-auto">
                                <PaginationContent className="bg-white dark:bg-card/50 p-1.5 rounded-full border border-border/40 shadow-sm gap-1">
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className={cn(
                                                "h-9 w-10 sm:w-auto px-0 sm:px-4 rounded-full cursor-pointer",
                                                currentPage === 1 && "pointer-events-none opacity-50"
                                            )}
                                        />
                                    </PaginationItem>

                                    <div className="flex items-center px-3 sm:px-4 py-1.5 bg-muted/40 rounded-full text-[10px] sm:text-sm font-bold min-w-[70px] sm:min-w-[100px] justify-center">
                                        <span className="sm:inline hidden mr-1">Page</span> {currentPage} <span className="mx-1">/</span> {totalPages || 1}
                                    </div>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className={cn(
                                                "h-9 w-10 sm:w-auto px-0 sm:px-4 rounded-full cursor-pointer",
                                                currentPage >= totalPages && "pointer-events-none opacity-50"
                                            )}
                                        />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage >= totalPages}
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </Tabs>
            </main>

            <Footer />

            <Dialog open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
                <DialogContent
                    noContentWrapper
                    aria-describedby={undefined}
                    className="max-w-[1100px] w-[95vw] md:w-[95vw] h-[92vh] md:h-[80vh] p-0 border dark:border-white/10 rounded-[2.5rem] bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row transition-all duration-500 z-[100] outline-none scrollbar-modal"
                >
                    <DialogTitle className="sr-only">Account Management</DialogTitle>
                    {/* Left Sidebar: Context Branding - Responsive Stacking */}
                    <div className="w-full md:w-[320px] bg-slate-50 dark:bg-zinc-900/50 p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-border/40 min-h-[220px] md:min-h-0">
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-primary/10 rounded-[2rem] rotate-12 blur-2xl" />
                            <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 bg-indigo-500/10 rounded-[3rem] -rotate-6 blur-2xl" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center py-6">
                            <div className="bg-white/20 backdrop-blur-md rounded-[2.5rem] p-8 shadow-sm border border-white/20 mb-6 bg-gradient-hero">
                                {activeTab === 'SCHOOL' && <School className="h-16 w-16 text-white" />}
                                {activeTab === 'EDITORIAL' && <BookOpen className="h-16 w-16 text-white" />}
                                {activeTab === 'STUDENT' && <GraduationCap className="h-16 w-16 text-white" />}
                                {activeTab === 'TEACHER' && <UsersIcon className="h-16 w-16 text-white" />}
                                {activeTab === 'PARENT' && <Baby className="h-16 w-16 text-white" />}
                            </div>
                            <h2 className="text-2xl font-display font-bold text-center mb-1">
                                {editingUser ? 'Update Records' : 'System Access'}
                            </h2>
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border/40">
                                Institutional {activeTab}
                            </p>
                        </div>
                    </div>

                    {/* Right Pane: Form Content */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 min-h-0 overflow-hidden">
                        <div className="p-6 md:p-8 pb-4 shrink-0">
                            <div>
                                <DialogTitle className="text-xl md:text-2xl font-display font-bold tracking-tight">
                                    {editingUser ? `Edit ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}` : `Add ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`}
                                </DialogTitle>
                                <DialogDescription className="text-xs md:text-sm font-medium">Configure credentials and profile details</DialogDescription>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 md:px-8 py-4 space-y-6 scrollbar-modal">
                            <form id="user-form" onSubmit={handleSubmit} className="space-y-6 pr-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['SCHOOL', 'STUDENT', 'TEACHER', 'PARENT'].includes(activeTab) && (
                                        <div className="md:col-span-2 space-y-6 bg-slate-50/50 dark:bg-zinc-900/30 p-6 rounded-[2rem] border border-border/40 mb-2">
                                            <div className="flex items-center justify-between px-1">
                                                <div className="flex items-center gap-2">
                                                    <School className="w-4 h-4 text-primary" />
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Institutional Identity</Label>
                                                </div>
                                                {activeTab === 'SCHOOL' ? (
                                                    <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20 font-bold">Partner Only</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsManualSchoolMode(!isManualSchoolMode)}
                                                        className="text-[10px] font-black uppercase tracking-tighter text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
                                                    >
                                                        {isManualSchoolMode ? (
                                                            <><GraduationCap className="w-3 h-3" /> Partner Network</>
                                                        ) : (
                                                            <><PenLine className="w-3 h-3" /> Type Manually</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {activeTab === 'SCHOOL' || isManualSchoolMode ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="school_name_manual" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">School Name</Label>
                                                        <div className="relative">
                                                            <School className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="school_name_manual"
                                                                name="school_name"
                                                                placeholder="Enter school name"
                                                                className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-primary/20"
                                                                value={formData.school_name}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="school_code_manual" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">
                                                            Institution Code {activeTab === 'SCHOOL' && <span className="text-primary">*</span>}
                                                        </Label>
                                                        <div className="relative">
                                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input
                                                                id="school_code_manual"
                                                                name="school_code"
                                                                placeholder={activeTab === 'SCHOOL' ? "e.g. ZQC26/186" : "e.g. SCH-001"}
                                                                className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                                                value={formData.school_code}
                                                                onChange={handleInputChange}
                                                                required={activeTab === 'SCHOOL'}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 overflow-visible">
                                                    <Label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground italic">Syncing Verified Network Institution</Label>
                                                    <SchoolSelector
                                                        value={formData.school_code}
                                                        onChange={handleSchoolSelect}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab !== 'SCHOOL' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Account Name</Label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="username"
                                                    name="username"
                                                    placeholder="Enter full name"
                                                    className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 focus:ring-primary/20"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="email@example.com"
                                                className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {['EDITORIAL', 'PARENT'].includes(activeTab) && (
                                        <div className="space-y-2">
                                            <Label htmlFor="phone_number" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Secure Contact</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone_number"
                                                    name="phone_number"
                                                    placeholder="Phone Number"
                                                    className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50"
                                                    value={formData.phone_number}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">
                                            {editingUser ? 'Change Password (Optional)' : 'Account Password'}
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder={editingUser ? "Leave empty to keep current" : "••••••••"}
                                                className="h-12 rounded-2xl pr-12 border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required={!editingUser}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Personal Portfolio</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="website"
                                                name="website"
                                                placeholder="https://..."
                                                className="pl-11 h-12 rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Regional Details */}
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/50 dark:bg-zinc-900/30 p-6 rounded-[2rem] border border-border/40">
                                        <div className="md:col-span-2 lg:col-span-4 flex items-center gap-2 mb-2">
                                            <Globe className="w-4 h-4 text-primary" />
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location & Regional Details</Label>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="place" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Place / City</Label>
                                            <Input
                                                id="place"
                                                name="place"
                                                placeholder="e.g. Koduvally"
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4"
                                                value={formData.place}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="district" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">District</Label>
                                            <Input
                                                id="district"
                                                name="district"
                                                placeholder="e.g. Kozhikode"
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="state" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">State</Label>
                                            <Input
                                                id="state"
                                                name="state"
                                                placeholder="e.g. Kerala"
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="country" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Country</Label>
                                            <Input
                                                id="country"
                                                name="country"
                                                placeholder="e.g. India"
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">User Bio / Narrative</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            placeholder="Tell the community about this user..."
                                            className="min-h-[100px] rounded-2xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 p-4"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-zinc-900/30 border-t border-border/40 flex flex-col md:flex-row items-center justify-end gap-3 md:gap-4 shrink-0">
                            <Button variant="ghost" type="button" onClick={closeSheet} className="w-full md:w-auto h-12 px-8 rounded-2xl font-bold order-2 md:order-1">
                                Close Window
                            </Button>
                            <Button
                                type="submit"
                                form="user-form"
                                disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                onClick={(e) => {
                                    // Ensure submit works when the footer button sits outside the scrollable form
                                    const form = document.getElementById('user-form') as HTMLFormElement | null;
                                    if (!form) return;
                                    if (!form.checkValidity()) {
                                        e.preventDefault();
                                        form.reportValidity();
                                    }
                                }}
                                className="w-full md:w-auto h-12 px-10 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 order-1 md:order-2"
                            >
                                {(createUserMutation.isPending || updateUserMutation.isPending) && (
                                    <Skeleton className="mr-2 h-4 w-4 rounded-full bg-white/30" />
                                )}
                                {editingUser ? 'Save Changes' : 'Create Account'}
                            </Button>
                        </div>
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
            <AlertDialog open={!!blockingUser} onOpenChange={(open) => !open && setBlockingUser(null)}>
                <AlertDialogContent className="w-[95vw] md:w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] border-0 shadow-2xl bg-white dark:bg-zinc-950 p-6 md:p-8">
                    <AlertDialogHeader className="space-y-4">
                        <div className={cn(
                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-2 mx-auto",
                            blockingUser?.is_active ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600" : "bg-green-100 dark:bg-green-500/10 text-green-600"
                        )}>
                            {blockingUser?.is_active ? <ShieldOff className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                        </div>
                        <AlertDialogTitle className="text-2xl font-display font-bold text-center">
                            {blockingUser?.is_active ? 'Suspend Account Access?' : 'Restore Account Access?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
                            {blockingUser?.is_active
                                ? `Suspending ${blockingUser?.username} will immediately revoke their ability to login or interact with the platform. This is reversible.`
                                : `Restoring access will allow ${blockingUser?.username} to regain full platform privileges immediately.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 sm:justify-center gap-3">
                        <AlertDialogCancel className="w-full md:w-auto h-12 px-8 rounded-2xl font-bold border-slate-200 dark:border-zinc-800">
                            Dismiss
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => blockingUser && toggleUserStatusMutation.mutate({ id: blockingUser.id, is_active: !blockingUser.is_active })}
                            className={cn(
                                "w-full md:w-auto h-12 px-8 rounded-2xl font-bold shadow-lg transition-all active:scale-95",
                                blockingUser?.is_active
                                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
                                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20"
                            )}
                        >
                            {blockingUser?.is_active ? 'Suspend Now' : 'Restore Now'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View User Dialog (Premium Design - Standardized Dimensions) */}
            <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
                <DialogContent
                    noContentWrapper
                    aria-describedby={undefined}
                    className="max-w-[1100px] w-[95vw] md:w-[95vw] h-[92vh] md:h-[80vh] p-0 border dark:border-white/10 rounded-[2.5rem] bg-white dark:bg-zinc-950 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row transition-all duration-500 z-[250] outline-none scrollbar-modal"
                >
                    <DialogTitle className="sr-only">User Profile Details</DialogTitle>
                    {/* Left Sidebar: Identity & Branding - Responsive height */}
                    <div className="w-full md:w-[320px] bg-slate-50 dark:bg-zinc-900/50 p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-border/40 min-h-[280px] md:min-h-0">
                        {/* Decorative Background Patterns */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-primary/10 rounded-[2rem] rotate-12 blur-2xl" />
                            <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 bg-indigo-500/10 rounded-[3rem] -rotate-6 blur-2xl" />
                            <div className="absolute top-1/4 right-4 w-12 h-12 bg-white dark:bg-white/5 rounded-xl rotate-45 shadow-sm opacity-20" />
                            <div className="absolute bottom-1/4 left-8 w-16 h-16 bg-white dark:bg-white/5 rounded-2xl -rotate-12 shadow-sm opacity-20" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative mb-6">
                                {/* Colorful Border Container */}
                                <div className={cn("p-1.5 rounded-3xl bg-gradient-to-br shadow-2xl", getRoleColor(viewingUser?.role).bg)}>
                                    <div className="bg-white dark:bg-zinc-950 p-1 rounded-[1.3rem]">
                                        <div className="h-32 w-32 rounded-2xl bg-muted flex items-center justify-center text-4xl font-display font-bold text-primary overflow-hidden shadow-inner ring-1 ring-black/5">
                                            {viewingUser?.profile_image ? (
                                                <img src={getImageUrl(viewingUser.profile_image)} alt={viewingUser?.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{viewingUser?.username?.[0]?.toUpperCase()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isVerifiedRole(viewingUser?.role || '') && (
                                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-900 rounded-full p-1.5 shadow-xl border border-border/20 translate-y-1 scale-110">
                                        <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500" />
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-foreground mb-2 text-center font-display tracking-tight px-4">{viewingUser?.username}</h2>
                            <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-white/20", getRoleColor(viewingUser?.role || '').badge)}>
                                {viewingUser?.role}
                            </div>

                            <div className="hidden md:flex mt-8 flex-col gap-3 w-full px-6">
                                {!viewingUser?.is_active ? (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 backdrop-blur-md rounded-2xl border border-rose-500/20 shadow-sm animate-pulse-subtle">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                        <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 whitespace-nowrap">Access Suspended</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-background/50 backdrop-blur-md rounded-2xl border border-white dark:border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                        <div className={cn("w-2 h-2 rounded-full", viewingUser?.is_onboarded ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-amber-500")} />
                                        <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                                            {viewingUser?.is_onboarded ? "Account Active" : "Pending Activation"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="hidden md:flex mt-8 w-full border-t border-border/40 pt-8 justify-around">
                                <div className="text-center">
                                    <p className="text-xl font-display font-black text-foreground">{viewingUser?.followers_count || 0}</p>
                                    <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Followers</p>
                                </div>
                                <div className="w-px h-8 bg-border/40" />
                                <div className="text-center">
                                    <p className="text-xl font-display font-black text-foreground">{viewingUser?.following_count || 0}</p>
                                    <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Following</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Details & Actions */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 min-h-0 overflow-hidden">
                        <div className="p-6 md:p-8 pb-4 shrink-0 flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-xl md:text-2xl font-display font-bold tracking-tight">Full Account Details</DialogTitle>
                                <DialogDescription className="text-xs md:text-sm font-medium">Platform institutional summary</DialogDescription>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 md:px-8 pb-8 space-y-8 scrollbar-modal pr-2">
                            {/* Section: Basic Info */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    Identity Profile
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    <DetailItem label="Primary Email" value={viewingUser?.email} icon={Mail} />
                                    <DetailItem label="Registration Date" value={viewingUser?.date_joined ? format(new Date(viewingUser.date_joined), 'MMMM d, yyyy') : 'N/A'} icon={Calendar} />
                                </div>
                            </div>

                            {/* Section: Permissions & Connections */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    Permissions & Connections
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    {viewingUser?.role === 'SCHOOL' ? (
                                        <DetailItem label="Unique Institutional Code" value={viewingUser?.school_code} icon={Hash} />
                                    ) : (
                                        <DetailItem label="Organization" value={viewingUser?.school_name || 'Pending Onboarding'} icon={School} />
                                    )}

                                    {viewingUser?.role === 'STUDENT' && (
                                        <DetailItem label="Primary Faculty" value={viewingUser?.teacher_name} icon={UserIcon} />
                                    )}

                                    {['EDITORIAL', 'TEACHER', 'PARENT'].includes(viewingUser?.role as any) && (
                                        <DetailItem label="Secure Contact" value={viewingUser?.phone_number} icon={Phone} />
                                    )}
                                </div>
                            </div>

                            {/* Section: Regional & Location Details */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-500 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    Regional & Location Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    <DetailItem label="Place / City" value={viewingUser?.place} icon={Globe} />
                                    <DetailItem label="District" value={viewingUser?.district} icon={Globe} />
                                    <DetailItem label="State" value={viewingUser?.state} icon={Globe} />
                                    <DetailItem label="Country" value={viewingUser?.country} icon={Globe} />
                                </div>
                            </div>

                            {/* Section: Public Profile (Premium Aesthetic) */}
                            {(viewingUser?.website || viewingUser?.bio) && (
                                <div className="space-y-6">
                                    {viewingUser?.website && (
                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-[0.25em] ml-1">Personal Website / Portfolio</Label>
                                            <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-[2rem] shadow-sm transition-all hover:border-primary/30 group">
                                                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-primary shadow-sm border border-slate-100 dark:border-zinc-700">
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <a
                                                    href={viewingUser.website.startsWith('http') ? viewingUser.website : `https://${viewingUser.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-bold text-slate-700 dark:text-zinc-200 hover:text-primary truncate"
                                                >
                                                    {viewingUser.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {viewingUser?.bio && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between px-1">
                                                <Label className="text-[10px] uppercase text-muted-foreground font-black tracking-[0.25em]">Bio / Narrative</Label>
                                                <span className="text-[10px] font-bold text-primary opacity-40 uppercase tracking-widest">{viewingUser.bio.length} characters</span>
                                            </div>
                                            <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-medium text-slate-600 dark:text-zinc-300 leading-relaxed shadow-sm min-h-[100px] relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/30 via-transparent to-transparent" />
                                                {viewingUser.bio}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section: Platform Engagement Stats */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                    Community Engagement
                                </h4>
                                <div className="p-6 rounded-2xl bg-amber-50/30 dark:bg-amber-500/5 border border-amber-200/20 grid grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                            <Zap className="h-4 w-4" />
                                            <span className="text-2xl font-display font-black">{viewingUser?.followers_count || 0}</span>
                                        </div>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-6">Network Reach</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                                            <UsersIcon className="h-4 w-4" />
                                            <span className="text-2xl font-display font-black">{viewingUser?.following_count || 0}</span>
                                        </div>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground ml-6">Connections Made</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* High-Fidelity Action Bar - Stacked on mobile */}
                        <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-zinc-900/30 border-t border-border/40 flex flex-col md:flex-row items-center gap-3 md:gap-4 shrink-0 px-6 md:px-8">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full md:flex-1 h-12 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border",
                                    viewingUser?.is_active
                                        ? "bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 border-amber-100/50 dark:border-amber-500/10"
                                        : "bg-green-50 dark:bg-green-500/5 text-green-600 dark:text-green-400 hover:bg-green-100 border-green-100/50 dark:border-green-500/10"
                                )}
                                onClick={(e) => {
                                    if (viewingUser) {
                                        setBlockingUser(viewingUser);
                                        setViewingUser(null);
                                    }
                                }}
                            >
                                {viewingUser?.is_active ? (
                                    <>
                                        <ShieldOff className="w-4 h-4 mr-2" /> Suspend Account
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-4 h-4 mr-2" /> Restore Account
                                    </>
                                )}
                            </Button>
                            <Button
                                className="flex-1 h-12 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all transform active:scale-95"
                                onClick={(e) => {
                                    if (viewingUser) {
                                        openEditSheet(e, viewingUser);
                                        setViewingUser(null);
                                    }
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" /> Edit Account
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
