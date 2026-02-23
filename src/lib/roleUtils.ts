// Centralized Role Color Definitions
export type UserRole = 'STUDENT' | 'TEACHER' | 'SCHOOL' | 'PARENT' | 'EDITORIAL' | 'ADMIN' | 'ALL';

interface RoleColorConfig {
    bg: string;
    text: string;
    border?: string;
    hover?: string;
    badge?: string; // For badges/chips
    avatar: string; // For avatar fallback
}

export const ROLE_THEME: Record<string, RoleColorConfig> = {
    STUDENT: {
        bg: "bg-pink-500",
        text: "text-pink-500",
        border: "border-pink-500",
        hover: "hover:bg-pink-600",
        badge: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
        avatar: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
    },
    TEACHER: {
        bg: "bg-orange-500",
        text: "text-orange-500",
        border: "border-orange-500",
        hover: "hover:bg-orange-600",
        badge: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
        avatar: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
    },
    SCHOOL: {
        bg: "bg-blue-500",
        text: "text-blue-500",
        border: "border-blue-500",
        hover: "hover:bg-blue-600",
        badge: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
        avatar: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    PARENT: {
        bg: "bg-green-500",
        text: "text-green-500",
        border: "border-green-500",
        hover: "hover:bg-green-600",
        badge: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        avatar: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    },
    EDITORIAL: {
        bg: "bg-yellow-500",
        text: "text-yellow-600", // Darker for readability
        border: "border-yellow-500",
        hover: "hover:bg-yellow-600",
        badge: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
        avatar: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    },
    ADMIN: {
        bg: "bg-violet-600",
        text: "text-violet-600",
        border: "border-violet-600",
        hover: "hover:bg-violet-700",
        badge: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20",
        avatar: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
    },
    ALL: {
        bg: "bg-primary",
        text: "text-primary",
        border: "border-primary",
        hover: "hover:bg-primary/90",
        badge: "bg-primary/10 text-primary",
        avatar: "bg-primary/10 text-primary" // Default fallback
    }
};

// Helper utility to get role color safely
export const getRoleColor = (role: string | undefined | null) => {
    const normalizedRole = role?.toUpperCase() || 'ALL';
    return ROLE_THEME[normalizedRole] || ROLE_THEME['ALL'];
};

// Roles that display a blue verification tick on their avatar
export const VERIFIED_ROLES = new Set(['SCHOOL', 'EDITORIAL', 'ADMIN']);
export const isVerifiedRole = (role: string | undefined | null): boolean => {
    return VERIFIED_ROLES.has(role?.toUpperCase() || '');
};
