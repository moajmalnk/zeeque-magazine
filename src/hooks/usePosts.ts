import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Post, PostStatus } from '@/types/post';
import api from '@/lib/api';

export function usePosts() {
  const queryClient = useQueryClient();
  const [spotlightSort, setSpotlightSort] = useState<'trending' | 'latest' | 'following'>('trending');

  // Fetch all posts
  const { data: postsData } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await api.get('/posts/');
      return response.data;
    },
  });

  const posts = useMemo(() => {
    if (!postsData) return [];
    return Array.isArray(postsData) ? postsData : (postsData.results || []);
  }, [postsData]);

  // Fetch spotlight posts (trending) - Infinite Query for pagination
  const {
    data: spotlightData,
    isLoading: isSpotlightLoading,
    fetchNextPage: fetchNextSpotlightPage,
    hasNextPage: hasNextSpotlightPage,
    isFetchingNextPage: isSpotlightFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['posts', 'spotlight', spotlightSort],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`/posts/spotlight/?sort=${spotlightSort}&page=${pageParam}`);
      return response.data;
    },
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      // Spotlight currently returns a direct array of 10 items
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const spotlightPosts = useMemo(() => {
    return spotlightData?.pages.flatMap((page: any) => Array.isArray(page) ? page : (page.results || [])) || [];
  }, [spotlightData]);

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
          if (value !== undefined) {
            if (value === null) {
              // Send empty string to clear the field (common convention for clearing files in multipart/form-data)
              formData.append(key, '');
            } else if ((key === 'image_url' || key === 'video_file') && value instanceof Blob) {
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

  const shareMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/posts/${id}/share/`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both main posts list and spotlight to update counts/status
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

  const toggleShare = (postId: string) => {
    return shareMutation.mutateAsync(postId);
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
    spotlightPosts,
    isSpotlightLoading,
    fetchNextSpotlightPage,
    hasNextSpotlightPage,
    isSpotlightFetchingNextPage,
    pendingPosts,
    publishedPosts,
    rejectedPosts,
    approvePost,
    rejectPost,
    deletePost,
    restorePost,
    addPost,
    updatePost,
    toggleShare,
    spotlightSort,
    setSpotlightSort,
  };
}
