import { Category } from '@/types/post';

export interface CategoryStyle {
    bg: string;
    text: string;
    border: string;
    indicator: string;
    icon: string;
}

export const getCategoryStyle = (category: string): CategoryStyle => {
    const cat = category?.toLowerCase() as Category;

    switch (cat) {
        case 'stories':
            return {
                bg: 'bg-blue-50 dark:bg-blue-500/10',
                text: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-100 dark:border-blue-500/20',
                indicator: 'bg-blue-500',
                icon: '📖'
            };
        case 'poems':
            return {
                bg: 'bg-rose-50 dark:bg-rose-500/10',
                text: 'text-rose-600 dark:text-rose-400',
                border: 'border-rose-100 dark:border-rose-500/20',
                indicator: 'bg-rose-500',
                icon: '✨'
            };
        case 'drawings':
            return {
                bg: 'bg-amber-50 dark:bg-amber-500/10',
                text: 'text-amber-600 dark:text-amber-400',
                border: 'border-amber-100 dark:border-amber-500/20',
                indicator: 'bg-amber-500',
                icon: '🎨'
            };
        case 'news':
            return {
                bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                text: 'text-emerald-600 dark:text-emerald-400',
                border: 'border-emerald-100 dark:border-emerald-500/20',
                indicator: 'bg-emerald-500',
                icon: '📣'
            };
        case 'video':
            return {
                bg: 'bg-purple-50 dark:bg-purple-500/10',
                text: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-100 dark:border-purple-500/20',
                indicator: 'bg-purple-500',
                icon: '🎥'
            };
        default:
            return {
                bg: 'bg-slate-50 dark:bg-slate-500/10',
                text: 'text-slate-600 dark:text-slate-400',
                border: 'border-slate-100 dark:border-slate-500/20',
                indicator: 'bg-slate-500',
                icon: '📌'
            };
    }
};
