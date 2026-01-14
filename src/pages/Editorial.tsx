import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReviewCard } from '@/components/editorial/ReviewCard';
import { PostsTable } from '@/components/editorial/PostsTable';
import { DashboardStats } from '@/components/editorial/DashboardStats';
import { ViewToggle } from '@/components/editorial/ViewToggle';
import { usePosts } from '@/hooks/usePosts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

type ViewMode = 'grid' | 'list';

const Editorial = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const {
    pendingPosts,
    publishedPosts,
    rejectedPosts,
    approvePost,
    rejectPost,
    deletePost,
    restorePost,
  } = usePosts();

  const handleApprove = (id: string) => {
    approvePost(id);
    toast.success('Post approved and published! 🎉');
  };

  const handleReject = (id: string) => {
    rejectPost(id);
    toast.error('Post has been rejected');
  };

  const handleDelete = (id: string) => {
    deletePost(id);
    toast.success('Post deleted');
  };

  const handleRestore = (id: string) => {
    restorePost(id);
    toast.success('Post moved back to pending');
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-6xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Editorial Dashboard 📝
            </h1>
            <p className="text-muted-foreground">
              Review submissions and manage published content
            </p>
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
                className="flex items-center gap-2 py-3 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Pending</span>
                {pendingPosts.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingPosts.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Published</span>
                <span className="text-xs text-muted-foreground">
                  ({publishedPosts.length})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
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
              {pendingPosts.length === 0 ? (
                <div className="text-center py-16 bg-background rounded-2xl border-2 border-dashed">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    All caught up!
                  </h3>
                  <p className="text-muted-foreground">
                    No pending submissions to review
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingPosts.map(post => (
                    <ReviewCard
                      key={post.id}
                      post={post}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              ) : (
                <PostsTable
                  posts={pendingPosts}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={handleDelete}
                />
              )}
            </TabsContent>

            {/* Published Tab */}
            <TabsContent value="published">
              {publishedPosts.length === 0 ? (
                <div className="text-center py-16 bg-background rounded-2xl border-2 border-dashed">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    No published posts
                  </h3>
                  <p className="text-muted-foreground">
                    Published posts will appear here
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {publishedPosts.map(post => (
                    <ReviewCard
                      key={post.id}
                      post={post}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              ) : (
                <PostsTable
                  posts={publishedPosts}
                  onReject={handleReject}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                />
              )}
            </TabsContent>

            {/* Rejected Tab */}
            <TabsContent value="rejected">
              {rejectedPosts.length === 0 ? (
                <div className="text-center py-16 bg-background rounded-2xl border-2 border-dashed">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    No rejected posts
                  </h3>
                  <p className="text-muted-foreground">
                    Rejected posts will appear here
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {rejectedPosts.map(post => (
                    <ReviewCard
                      key={post.id}
                      post={post}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              ) : (
                <PostsTable
                  posts={rejectedPosts}
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
