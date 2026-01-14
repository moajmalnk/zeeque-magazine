export type Category = 'stories' | 'poems' | 'drawings' | 'news';

export type PostStatus = 'pending' | 'published' | 'rejected';

export interface Post {
  id: string;
  authorName: string;
  title: string;
  category: Category;
  content: string;
  imageUrl?: string;
  status: PostStatus;
  createdAt: Date;
  publishedAt?: Date;
}

export const categoryLabels: Record<Category, string> = {
  stories: 'Stories',
  poems: 'Poems',
  drawings: 'Drawings',
  news: 'Classroom News',
};

export const categoryIcons: Record<Category, string> = {
  stories: '📖',
  poems: '✨',
  drawings: '🎨',
  news: '📣',
};
