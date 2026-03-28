import type { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';

export function goToAuthorProfile(
  navigate: NavigateFunction,
  options: {
    isLoggedIn: boolean;
    authorId?: string | null;
    authorName?: string;
  },
): boolean {
  if (!options.isLoggedIn) {
    toast.info('Please log in to view profiles.', {
      action: { label: 'Log In', onClick: () => navigate('/login') },
    });
    return false;
  }
  const id = options.authorId?.trim();
  if (!id) {
    toast.info('Profile unavailable', {
      description: 'This content is not linked to a public member profile yet.',
    });
    return false;
  }
  navigate(`/profile/${id}`);
  return true;
}

export function authorProfileCardKeyDown(
  e: React.KeyboardEvent,
  navigate: NavigateFunction,
  options: { isLoggedIn: boolean; authorId?: string | null; authorName?: string },
  onNavigateSuccess?: () => void,
): void {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  e.stopPropagation();
  if (goToAuthorProfile(navigate, options)) {
    onNavigateSuccess?.();
  }
}
