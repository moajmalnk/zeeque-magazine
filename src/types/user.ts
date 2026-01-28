export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
    id: string;
    email: string;
    username: string; // Django auth default, but we mostly use email
    role: UserRole;
    school_name?: string;
    phone_number?: string;
    date_joined: string;
    is_active: boolean;
}
