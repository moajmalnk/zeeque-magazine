export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'SCHOOL' | 'EDITORIAL';

export interface User {
    id: string;
    email: string;
    username: string; // Django auth default, but we mostly use email
    role: UserRole;
    school_name?: string;
    school_code?: string;
    phone_number?: string;
    date_joined: string;
    is_onboarded: boolean;
    is_active: boolean;
    teacher_name?: string;
    place?: string;
    district?: string;
    state?: string;
    country?: string;
    profile_image?: string;
    bio?: string;
    website?: string;
    followers_count?: number;
    following_count?: number;
}
