import { useState, useCallback, useMemo } from 'react';
import { Post, PostStatus } from '@/types/post';
import { mockPosts as initialMockPosts } from '@/data/mockPosts';

// Simple state management for posts - can be replaced with backend later
const STORAGE_KEY = 'zeeque_posts';

function getStoredPosts(): Post[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
      }));
    }
  } catch (e) {
    console.error('Error reading posts from storage:', e);
  }
  return initialMockPosts;
}

function storePosts(posts: Post[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Error storing posts:', e);
  }
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(getStoredPosts);

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(currentPosts => {
      const newPosts = currentPosts.map(post =>
        post.id === postId ? { ...post, ...updates } : post
      );
      storePosts(newPosts);
      return newPosts;
    });
  }, []);

  const approvePost = useCallback((postId: string) => {
    updatePost(postId, {
      status: 'published',
      publishedAt: new Date(),
    });
  }, [updatePost]);

  const rejectPost = useCallback((postId: string) => {
    updatePost(postId, {
      status: 'rejected',
    });
  }, [updatePost]);

  const deletePost = useCallback((postId: string) => {
    setPosts(currentPosts => {
      const newPosts = currentPosts.filter(post => post.id !== postId);
      storePosts(newPosts);
      return newPosts;
    });
  }, []);

  const restorePost = useCallback((postId: string) => {
    updatePost(postId, {
      status: 'pending',
      publishedAt: undefined,
    });
  }, [updatePost]);

  const addPost = useCallback((post: Omit<Post, 'id' | 'createdAt' | 'status'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending',
    };
    setPosts(currentPosts => {
      const newPosts = [...currentPosts, newPost];
      storePosts(newPosts);
      return newPosts;
    });
    return newPost;
  }, []);

  const pendingPosts = useMemo(
    () => posts.filter(post => post.status === 'pending'),
    [posts]
  );

  const publishedPosts = useMemo(
    () => posts.filter(post => post.status === 'published'),
    [posts]
  );

  const rejectedPosts = useMemo(
    () => posts.filter(post => post.status === 'rejected'),
    [posts]
  );

  return {
    posts,
    pendingPosts,
    publishedPosts,
    rejectedPosts,
    approvePost,
    rejectPost,
    deletePost,
    restorePost,
    addPost,
    updatePost,
  };
}
