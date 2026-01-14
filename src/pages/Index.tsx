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
        
        <section id="latest" className="py-8 md:py-12">
          <div className="container">
            {/* Section Header */}
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Latest Creations
              </h2>
              <p className="text-muted-foreground">
                Explore wonderful works from our talented students
              </p>
            </div>
            
            {/* Category Filter */}
            <div className="mb-8">
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
