import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoryFilter } from '@/components/CategoryFilter';
import { usePosts } from '@/hooks/usePosts';
import { Category, categoryLabels, categoryIcons } from '@/types/post';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Grid3x3 } from 'lucide-react';
import { format } from 'date-fns';

function getVideoEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop()?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop();
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  } catch {
    return null;
  }
}

const categoryStyles: Record<Category, string> = {
  stories: 'bg-gradient-stories',
  poems: 'bg-gradient-poems',
  drawings: 'bg-gradient-drawings',
  news: 'bg-gradient-news',
  video: 'bg-gradient-video',
  other: 'bg-gradient-other',
};

export default function AllCreatives() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { publishedPosts } = usePosts();

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') {
      return publishedPosts;
    }
    return publishedPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory, publishedPosts]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 lg:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
          
          <div className="container max-w-7xl relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Button
                  asChild
                  variant="ghost"
                  className="mb-4"
                >
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-[-0.02em]">
                  All <span className="text-gradient-hero bg-clip-text text-transparent">Creatives</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Explore all the amazing creative works from our talented students
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                <Grid3x3 className="w-5 h-5" />
                <span className="text-sm font-medium">{filteredPosts.length} Posts</span>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                posts={publishedPosts}
              />
            </div>
          </div>
        </section>

        {/* Masonry Grid Section */}
        <section className="py-8 pb-20 md:pb-24 lg:pb-28">
          <div className="container max-w-7xl">
            {filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 md:py-24 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                  <Grid3x3 className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                  No posts found
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {selectedCategory === 'all'
                    ? "No posts yet! Be the first to share something wonderful."
                    : `No ${categoryLabels[selectedCategory]} yet!`}
                </p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
                {filteredPosts.map((post) => {
                      const formattedDate = post.publishedAt
                        ? format(post.publishedAt, 'MMM d, yyyy')
                        : '';

                      return (
                        <Card
                          key={post.id}
                          className="group overflow-hidden border border-border/60 shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-card cursor-pointer break-inside-avoid mb-4 md:mb-6"
                        >
                          {/* Image/Video Section */}
                          {post.videoUrl ? (() => {
                            const embedUrl = getVideoEmbedUrl(post.videoUrl);
                            return embedUrl ? (
                              <div className="relative w-full aspect-video bg-black/5 overflow-hidden">
                                <iframe
                                  src={embedUrl}
                                  title={post.title}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <a
                                href={post.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-8 bg-gradient-video text-white text-center font-semibold hover:opacity-90"
                              >
                                Watch Video 🎥
                              </a>
                            );
                          })() : post.imageUrl ? (
                            <div className="relative w-full overflow-hidden bg-muted">
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          ) : null}

                          <CardContent className="p-4 md:p-5">
                            {/* Category Badge */}
                            <div className="mb-3">
                              <Badge className={`${categoryStyles[post.category]} text-white border-0 text-xs`}>
                                {categoryIcons[post.category]} {categoryLabels[post.category]}
                              </Badge>
                            </div>

                            {/* Title */}
                            <h3 className="font-display font-bold text-lg md:text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>

                            {/* Author & Date */}
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                              <span className="font-medium">by {post.authorName}</span>
                              {formattedDate && <span>{formattedDate}</span>}
                            </div>

                            {/* Teacher & School */}
                            {(post.teacherName || post.schoolName) && (
                              <div className="text-xs text-muted-foreground mb-3 space-y-1">
                                {post.teacherName && (
                                  <p>Teacher: <span className="font-medium">{post.teacherName}</span></p>
                                )}
                                {post.schoolName && (
                                  <p>School: <span className="font-medium">{post.schoolName}</span></p>
                                )}
                              </div>
                            )}

                            {/* Content Preview */}
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                              {post.content}
                            </p>

                            {/* Featured Badge */}
                            {post.featured && (
                              <div className="mt-3 pt-3 border-t border-border/60">
                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                  ⭐ Featured
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
