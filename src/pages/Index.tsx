import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PostGrid } from '@/components/PostGrid';
import { FAQSection } from '@/components/FAQSection';
import { usePosts } from '@/hooks/usePosts';
import { Category } from '@/types/post';
import { Button } from '@/components/ui/button';
import { ArrowRight, Grid3x3 } from 'lucide-react';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const { publishedPosts } = usePosts();

  // Show only featured posts on home page (limit to 6)
  const featuredPosts = useMemo(() => {
    return publishedPosts.filter(post => post.is_featured).slice(0, 8);
  }, [publishedPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') {
      return featuredPosts;
    }
    return featuredPosts.filter(post => post.category === selectedCategory);
  }, [selectedCategory, featuredPosts]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1" style={{ marginTop: 0, paddingTop: 0 }}>
        <HeroSection />

        <section id="latest" className="relative pt-12 md:pt-16 lg:pt-20 pb-20 md:pb-24 lg:pb-28 bg-background">
          {/* Minimal background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

          <div className="container max-w-7xl relative z-10">
            {/* Playful Section Header */}
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-block animate-bounce-gentle mb-4">
                <span className="text-4xl">🌟</span>
              </div>

              <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground relative inline-block">
                Latest <span className="text-primary italic">Creations</span>
                {/* Underline Scribble */}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent z-[-1]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                Peek into the magical world of our young artists and writers!
              </p>
            </div>

            {/* Category Filter with refined styling */}
            <div className="mb-12 md:mb-16">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                posts={featuredPosts}
              />
            </div>

            {/* Posts Grid */}
            <PostGrid
              posts={filteredPosts}
              emptyMessage={
                selectedCategory === 'all'
                  ? "No featured posts yet!"
                  : `No featured ${selectedCategory} yet!`
              }
            />

            {/* Show Full Creatives Button */}
            {publishedPosts.length > 0 && (
              <div className="mt-12 md:mt-16 text-center">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base font-semibold border-2 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <Link to="/all-creatives" className="flex items-center gap-2">
                    <Grid3x3 className="w-5 h-5" />
                    <span>Show Full Creatives</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  View all {publishedPosts.length} creative works in our gallery
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
