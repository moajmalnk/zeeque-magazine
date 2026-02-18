export type Category = 'stories' | 'poems' | 'drawings' | 'news' | 'video' | 'other';

export type PostStatus = 'pending' | 'published' | 'rejected';

export interface Post {
  id: string;
  author_name: string;
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
