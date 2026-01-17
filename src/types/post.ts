export type Category = 'stories' | 'poems' | 'drawings' | 'news' | 'video' | 'other';

export type PostStatus = 'pending' | 'published' | 'rejected';

export interface Post {
  id: string;
  authorName: string;
  teacherName?: string;
  schoolName?: string;
  title: string;
  category: Category;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  status: PostStatus;
  createdAt: Date;
  publishedAt?: Date;
  featured?: boolean;
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
