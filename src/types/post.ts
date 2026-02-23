export type Category = 'stories' | 'poems' | 'drawings' | 'news' | 'video' | 'other';

export type PostStatus = 'pending' | 'published' | 'rejected';

export interface Post {
  id: string;
  author_name: string;
  author_id?: string;
  author_image?: string;
  author_role?: string; // Add this
  teacher_name: string;
  school_name: string;
  title: string;
  category: Category;
  content: string;
  image_url?: string;
  image?: string;
  video_url?: string;
  video_file?: string;
  status: PostStatus;
  created_at: string; // Django returns ISO string
  published_at?: string;
  is_featured?: boolean;
  share_count?: number;
  comments_count?: number;
  likes_count?: number;
  visibility?: 'public' | 'followers' | 'private';
  is_shared_by_me?: boolean;
  is_liked_by_me?: boolean;
  latest_shared_by?: {
    username: string;
    avatar?: string;
    id: string;
    role: string;
  };
  recent_sharers?: {
    id: string;
    username: string;
    avatar?: string;
    role: string;
  }[];
}

export interface PostShareResponse {
  status: 'shared' | 'unshared';
  share_count: number;
}

export const categoryLabels: Record<Category, string> = {
  stories: 'Stories',
  poems: 'Poems',
  drawings: 'Drawings',
  news: 'Classroom News',
  video: 'Video',
  other: 'Other',
};

export const categoryIcons: Record<Category, string> = {
  stories: '📖',
  poems: '✨',
  drawings: '🎨',
  news: '📣',
  video: '🎥',
  other: '📌',
};
