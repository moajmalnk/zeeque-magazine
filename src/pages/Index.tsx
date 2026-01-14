import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PostGrid } from '@/components/PostGrid';
import { usePosts } from '@/hooks/usePosts';
import { Category } from '@/types/post';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { publishedPosts } = usePosts();

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') {
      return publishedPosts;
    }
    return publishedPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory, publishedPosts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        <section id="latest" className="py-12 md:py-16 lg:py-20">
          <div className="container max-w-7xl">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Featured Content
                </span>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                Latest Creations
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Discover the imaginative works crafted by our talented young creators
              </p>
            </div>
            
            {/* Category Filter */}
            <div className="mb-10 md:mb-12">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            
            {/* Posts Grid */}
            <PostGrid
              posts={filteredPosts}
              emptyMessage={
                selectedCategory === 'all'
                  ? "No posts yet!"
                  : `No ${selectedCategory} yet!`
              }
            />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
