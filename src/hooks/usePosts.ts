import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Post, PostStatus } from '@/types/post';
import api from '@/lib/api';

export function usePosts() {
  const queryClient = useQueryClient();

  // Fetch all posts
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await api.get('/posts/');
      return response.data;
    },
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Post> }) => {
      const response = await api.patch(`/posts/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPost: any) => {
      // Check if we need to send FormData (for file uploads)
      const hasFiles = newPost.image_url instanceof File || newPost.video_file instanceof File;

      if (hasFiles) {
        const formData = new FormData();
        Object.keys(newPost).forEach(key => {
          if (newPost[key] !== undefined && newPost[key] !== null) {
            formData.append(key, newPost[key]);
          }
        });
        const response = await api.post('/posts/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }

      const response = await api.post('/posts/', newPost);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/posts/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const updatePost = (postId: string, updates: Partial<Post>) => {
    updateMutation.mutate({ id: postId, data: updates });
  };

  const approvePost = (postId: string, featured: boolean = false) => {
    const post = posts.find(p => p.id === postId);

    updateMutation.mutate({
      id: postId,
      data: {
        status: 'published',
        published_at: new Date().toISOString(),
        is_featured: featured,
      },
    });

    // Valid refetch is triggered automatically, but for undo support we'd need optimistic updates.
    // For now, returning a simplified undo that just reverts status (assuming we could).
    // In a real app with backend, undo implies another mutation.
    return {
      undo: () => {
        updateMutation.mutate({
          id: postId,
          data: {
            status: 'pending',
            published_at: undefined,
            is_featured: false
          }
        });
      },
      postTitle: post?.title || 'Post',
      authorName: post?.author_name || 'Unknown',
    };
  };

  const rejectPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);

    updateMutation.mutate({
      id: postId,
      data: { status: 'rejected' }
    });

    return {
      undo: () => {
        updateMutation.mutate({
          id: postId,
          data: { status: 'pending' }
        });
      },
      postTitle: post?.title || 'Post',
      authorName: post?.author_name || 'Unknown',
    };
  };

  const deletePost = (postId: string) => {
    deleteMutation.mutate(postId);
  };

  const restorePost = (postId: string) => {
    updateMutation.mutate({
      id: postId,
      data: {
        status: 'pending',
        published_at: undefined
      }
    });
  };

  const addPost = async (post: any) => {
    return createMutation.mutateAsync(post);
  };

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
