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
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Check if we need to send FormData (for file uploads)
      const hasFiles =
        (data.image_url && data.image_url instanceof Blob) ||
        (data.video_file && data.video_file instanceof Blob);

      if (hasFiles) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          const value = data[key];
          if (value !== undefined && value !== null) {
            if ((key === 'image_url' || key === 'video_file') && value instanceof Blob) {
              const ext = value.type.split('/')[1] || 'bin';
              formData.append(key, value, `upload.${ext}`);
            } else {
              formData.append(key, value);
            }
          }
        });
        const response = await api.patch(`/posts/${id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }

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
      // Relaxed check: if these keys exist, we assume they are files and must use FormData.
      // This avoids issues where 'instanceof Blob' fails for some reason.
      const hasFiles = !!newPost.image_url || !!newPost.video_file;

      if (hasFiles) {
        const formData = new FormData();
        Object.keys(newPost).forEach(key => {
          const value = newPost[key];
          if (value !== undefined && value !== null) {
            if ((key === 'image_url' || key === 'video_file') && value instanceof Blob) {
              // Append with a default filename to ensure backend treats it as a file
              const ext = value.type.split('/')[1] || 'bin';
              // Backend Serializer expects 'image_url', so we keep the key as is.
              formData.append(key, value, `upload.${ext}`);
            } else {
              formData.append(key, value);
            }
          }
        });
        const response = await api.post('/posts/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
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

  const updatePost = (postId: string, updates: any) => {
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
