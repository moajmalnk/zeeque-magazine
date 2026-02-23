import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReviewCard } from '@/components/editorial/ReviewCard';
import { PostsTable } from '@/components/editorial/PostsTable';
import { DashboardStats } from '@/components/editorial/DashboardStats';
import { ViewToggle } from '@/components/editorial/ViewToggle';
import { usePosts } from '@/hooks/usePosts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Category, Post } from '@/types/post';
import { CategoryFilter } from '@/components/CategoryFilter';

type ViewMode = 'grid' | 'list';

const Editorial = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const {
    pendingPosts,
    publishedPosts,
    rejectedPosts,
    approvePost,
    rejectPost,
    deletePost,
    restorePost,
    updatePost,
  } = usePosts();

  const handleApprove = (id: string, featured: boolean = false) => {
    const result = approvePost(id, featured);
    // Return result so components can handle their own toast notifications
    return result;
  };

  const handleReject = (id: string) => {
    const result = rejectPost(id);
    // Return result so components can handle their own toast notifications
    return result;
  };

  const handleDelete = (id: string) => {
    deletePost(id);
    toast.success('Post deleted');
  };

  const handleRestore = (id: string) => {
    restorePost(id);
    toast.success('Post moved back to pending');
  };

  const handleUnpublish = (id: string) => {
    restorePost(id); // Sets status back to 'pending'
  };

  const handleEdit = (id: string, updates: Partial<Post>) => {
    updatePost(id, updates);
  };

  const handleToggleFeature = (id: string, currentFeatured: boolean) => {
    updatePost(id, { is_featured: !currentFeatured });
    toast.success(
      currentFeatured
        ? 'Post removed from featured list'
        : 'Post featured on home page! 🌟',
      { duration: 2000 }
    );
  };

  const filterPosts = (posts: Post[]) => {
    if (selectedCategory === 'all') return posts;
    return posts.filter(post => post.category === selectedCategory);
  };

  const filteredPending = filterPosts(pendingPosts);
  const filteredPublished = filterPosts(publishedPosts);
  const filteredRejected = filterPosts(rejectedPosts);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-[95%] xl:max-w-full px-4 md:px-8">
          {/* Page Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Editorial Dashboard 📝
              </h1>
              <p className="text-muted-foreground">
                Review submissions and manage published content
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <DashboardStats
              pendingCount={pendingPosts.length}
              publishedCount={publishedPosts.length}
              rejectedCount={rejectedPosts.length}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-background border">
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-950/30 dark:data-[state=active]:text-amber-400"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Pending</span>
                  {pendingPosts.length > 0 && (
                    <span className="bg-amber-500 dark:bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingPosts.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="published"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-950/30 dark:data-[state=active]:text-green-400"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Published</span>
                  <span className="text-xs text-muted-foreground">
                    ({publishedPosts.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-red-50 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-950/30 dark:data-[state=active]:text-red-400"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Rejected</span>
                  <span className="text-xs text-muted-foreground">
                    ({rejectedPosts.length})
                  </span>
                </TabsTrigger>
              </TabsList>
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>

            {/* Pending Tab */}
            <TabsContent value="pending" className="space-y-4">
              <div className="mb-6">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  posts={pendingPosts}
                />
              </div>

              {filteredPending.length === 0 ? (
                <div className="text-center py-16 bg-background rounded-2xl border-2 border-dashed">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {selectedCategory === 'all'
                      ? 'All caught up!'
                      : `No pending ${selectedCategory}`}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === 'all'
                      ? 'No pending submissions to review'
                      : 'Try selecting a different category'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
                  {filteredPending.map(post => (
                    <ReviewCard
                      key={post.id}
                      post={post}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              ) : (
                <PostsTable
                  posts={filteredPending}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              )}
            </TabsContent>

            {/* Published Tab */}
            <TabsContent value="published" className="space-y-4">
              <div className="mb-6">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  posts={publishedPosts}
                />
              </div>

              {filteredPublished.length === 0 ? (
                <div className="text-center py-16 bg-background rounded-2xl border-2 border-dashed">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {selectedCategory === 'all'
                      ? 'No published posts'
                      : `No published ${selectedCategory}`}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === 'all'
                      ? 'Published posts will appear here'
                      : 'Try selecting a different category'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
                  {filteredPublished.map(post => (
                    <ReviewCard
                      key={post.id}
                      post={post}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onUnpublish={handleUnpublish}
                      onRestore={handleRestore}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      onToggleFeature={handleToggleFeature}
                    />
                  ))}
                </div>
              ) : (
                <PostsTable
                  posts={filteredPublished}
                  onReject={handleReject}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              )}
            </TabsContent>

            {/* Rejected Tab */}
            <TabsContent value="rejected" className="space-y-4">
              <div className="mb-6">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  posts={rejectedPosts}
                />
              </div>

              {filteredRejected.length === 0 ? (
                <div className="text-center py-16 bg-background rounded-2xl border-2 border-dashed">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {selectedCategory === 'all'
                      ? 'No rejected posts'
                      : `No rejected ${selectedCategory}`}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === 'all'
                      ? 'Rejected posts will appear here'
                      : 'Try selecting a different category'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
                  {filteredRejected.map(post => (
                    <ReviewCard
                      key={post.id}
                      post={post}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onRestore={handleRestore}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <PostsTable
                  posts={filteredRejected}
                  onApprove={handleApprove}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Editorial;
