import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;

  const apiBase = import.meta.env.VITE_API_URL || '';
  // If apiBase is something like 'https://api.example.com/api', we remove '/api' suffix to point to root
  const rootBase = apiBase.replace(/\/api$/, '').replace(/\/$/, '');

  // Ensure url starts with /
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${rootBase}${path}`;
}
