import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PostGrid } from '@/components/PostGrid';
import { FAQSection } from '@/components/FAQSection';
import { usePosts } from '@/hooks/usePosts';
import { Category } from '@/types/post';
import { Button } from '@/components/ui/button';
import { ArrowRight, Grid3x3, X, Heart, MessageCircle, Share2, MoreHorizontal, FileText, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock Data for Shared Posts (Student Work Approved by Admin)
const SHARED_POSTS = [
  {
    id: 8,
    sharedBy: { name: "ZeeQue High School", avatar: "https://ui-avatars.com/api/?name=ZeeQue+High&background=6366f1&color=fff", userId: "school", isVerified: true },
    post: {
      title: "Annual Science Fair: Registrations Open",
      author: "Science Dept.",
      category: "Science",
      image: "https://images.unsplash.com/photo-1564325724739-bae0bd08762c?auto=format&fit=crop&w=600&q=80",
      content: "Calling all innovators! The Annual ZeeQue Science Fair is back. This year's theme is 'Sustainable Solutions'. Prepare your projects, gather your data, and get ready to showcase your scientific brilliance. Registration deadline is next Friday."
    }
  },
  {
    id: 1,
    sharedBy: { name: "Mubashir", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", userId: "mock-1" },
    post: {
      title: "The Future of AI in Learning",
      author: "Aisha Rahman",
      category: "Tech",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
      content: "Artificial Intelligence is transforming how we learn, but it cannot replace the human spark of creativity. In this article, I explore how tools like LLMs can act as partners in education rather than substitutes for critical thinking. We must learn to guide these systems to enhance our potential, not limit it."
    }
  },
  {
    id: 7,
    sharedBy: { name: "ZeeQue Admin", avatar: "https://ui-avatars.com/api/?name=ZeeQue+Admin&background=0D8ABC&color=fff", userId: "admin", isVerified: true },
    post: {
      title: "Platform Update: New Creative Tools!",
      author: "ZeeQue Team",
      category: "Tech",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
      content: "We are excited to announce a suite of new tools for our creative community! From enhanced text editors to new image filters, expressing your ideas has never been easier. Check out the latest changelog to see what's new."
    }
  },
  {
    id: 2,
    sharedBy: { name: "Basith B1", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop", userId: "mock-2" },
    post: {
      title: "Whispers of the Old Library",
      author: "Leo Das",
      category: "Story",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
      content: "They say the books whisper at night. I never believed it until I stayed past closing time to finish my thesis. The silence wasn't empty; it was full of rustling pages and murmured secrets from centuries past. As I walked down the biography aisle, a leather-bound tome fell open, revealing a map to a city that hasn't existed for a thousand years."
    }
  },
  {
    id: 3,
    sharedBy: { name: "Junaid", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop", userId: "mock-3" },
    post: {
      title: "Mars: A New Horizon",
      author: "Sarah Khan",
      category: "Science",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      content: "Exploring the technical and ethical challenges of establishing a permanent human settlement on the Red Planet. From radiation shielding to sustainable agriculture in Martian soil, the hurdles are immense, but the scientific rewards could redefine our understanding of life in the universe."
    }
  },
  {
    id: 4,
    sharedBy: { name: "Shafeequ", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", userId: "mock-4" },
    post: {
      title: "Urban Solitude",
      author: "Michael Chen",
      category: "Photo",
      image: "https://images.unsplash.com/photo-1542038784456-1ea0e93ca64b?auto=format&fit=crop&w=600&q=80",
      content: "A photographic journey through the empty streets at dawn, capturing the quiet moments before the city wakes. This series focuses on the interplay of shadow and early morning light on concrete structures, finding beauty in the stillness of a chaotic metropolis."
    }
  },
  {
    id: 9,
    sharedBy: { name: "ZeeQue Editorial", avatar: "https://ui-avatars.com/api/?name=ZeeQue+Edit&background=10b981&color=fff", userId: "editorial", isVerified: true },
    post: {
      title: "Editor's Pick: The Art of Storytelling",
      author: "Editorial Team",
      category: "Story",
      image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
      content: "What makes a story truly grip the reader? Is it the characters, the plot, or the world-building? In this feature, we analyze top-rated stories from our platform and break down the elements that make them shine. A must-read for aspiring writers."
    }
  },
  {
    id: 5,
    sharedBy: { name: "Abdulla", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", userId: "mock-5" },
    post: {
      title: "The Gradient Sky",
      author: "Fatima Hassan",
      category: "Poem",
      image: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&w=600&q=80",
      content: "Orange bleeds into violet,\nStars pierce the velvet shroud,\nThe day retreats in silence,\nLeaving night to speak aloud.\n\nA canvas painted daily,\nBy hands we cannot see,\nA reminder of the beauty,\nIn wild fleeting mystery."
    }
  },
  {
    id: 6,
    sharedBy: { name: "Rahman", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", userId: "mock-6" },
    post: {
      title: "Sustainable Architecture",
      author: "David Williams",
      category: "Design",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80",
      content: "How modern biomimicry is shaping the skylines of tomorrow. By studying termite mounds for cooling and lotus leaves for water resistance, architects are creating buildings that breathe and adapt to their environment, drastically reducing their carbon footprint."
    }
  }
];

// Helper for category colors (Gradients)
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Tech': return 'bg-gradient-to-br from-blue-600 to-indigo-800';
    case 'Story': return 'bg-gradient-to-br from-amber-600 to-orange-800';
    case 'Science': return 'bg-gradient-to-br from-emerald-600 to-teal-800';
    case 'Photo': return 'bg-gradient-to-br from-rose-600 to-pink-800';
    case 'Poem': return 'bg-gradient-to-br from-violet-600 to-purple-800';
    case 'Design': return 'bg-gradient-to-br from-cyan-600 to-blue-800';
    default: return 'bg-gradient-to-br from-slate-600 to-slate-800';
  }
};

// Component for Individual Shared Post Card
const SharedPostCard = ({ item, onClick }: { item: typeof SHARED_POSTS[0], onClick: () => void }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative flex-shrink-0 w-36 h-56 md:w-48 md:h-72 rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group shadow-md hover:shadow-xl border border-border/10 bg-muted transform-gpu [backface-visibility:hidden] isolation-isolate [mask-image:radial-gradient(white,black)]"
      onClick={onClick}
    >
      {/* Background/Image Layer */}
      {item.post.image && !imgError ? (
        <img
          src={item.post.image}
          alt={item.post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        // Attractive Fallback if Image Fails
        <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-105 transition-transform duration-700 ${getCategoryColor(item.post.category)}`}>
          {/* Abstract Texture Overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          <FileText className="w-8 h-8 md:w-10 md:h-10 text-white/60 mb-3 relative z-10" />
          <h4 className="font-display font-semibold text-white text-xs md:text-sm line-clamp-3 px-1 break-words relative z-10 drop-shadow-sm leading-snug">
            {item.post.title}
          </h4>
        </div>
      )}

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 pointer-events-none" />

      {/* Top: Shared By User Info */}
      <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-20">
        <Link
          to={`/profile/${item.sharedBy.userId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full pl-1 pr-3 py-1 border border-white/10 shadow-sm hover:bg-black/60 transition-colors cursor-pointer"
        >
          <Avatar className="w-5 h-5 md:w-6 md:h-6 border border-white/50">
            <AvatarImage src={item.sharedBy.avatar} />
            <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">{item.sharedBy.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-[10px] md:text-xs font-medium text-white max-w-[80px] truncate">
            {item.sharedBy.name}
          </span>
          {/* @ts-ignore */}
          {item.sharedBy.isVerified && (
            <svg
              className="w-3.5 h-3.5 ml-1 text-blue-500"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.5 12.5C22.5 12.9 22.5 13.3 22.3 13.7C22.1 14.1 21.8 14.5 21.4 14.9L20.5 15.8C20.3 16 20.2 16.3 20.2 16.6V17.9C20.2 18.5 20 19.1 19.6 19.6C19.1 20 18.5 20.2 17.9 20.2H16.6C16.3 20.2 16 20.3 15.8 20.5L14.9 21.4C14.5 21.8 14.1 22.1 13.7 22.3C13.3 22.5 12.9 22.5 12.5 22.5C12.1 22.5 11.7 22.5 11.3 22.3C10.9 22.1 10.5 21.8 10.1 21.4L9.2 20.5C9 20.3 8.7 20.2 8.4 20.2H7.1C6.5 20.2 5.9 20 5.4 19.6C5 19.1 4.8 18.5 4.8 17.9V16.6C4.8 16.3 4.7 16 4.5 15.8L3.6 14.9C3.2 14.5 2.9 14.1 2.7 13.7C2.5 13.3 2.5 12.9 2.5 12.5C2.5 12.1 2.5 11.7 2.7 11.3C2.9 10.9 3.2 10.5 3.6 10.1L4.5 9.2C4.7 9 4.8 8.7 4.8 8.4V7.1C4.8 6.5 5 5.9 5.4 5.4C5.9 5 6.5 4.8 7.1 4.8H8.4C8.7 4.8 9 4.7 9.2 4.5L10.1 3.6C10.5 3.2 10.9 2.9 11.3 2.7C11.7 2.5 12.1 2.5 12.5 2.5C12.9 2.5 13.3 2.5 13.7 2.7C14.1 2.9 14.5 3.2 14.9 3.6L15.8 4.5C16 4.7 16.3 4.8 16.6 4.8H17.9C18.5 4.8 19.1 5 19.6 5.4C20 5.9 20.2 6.5 20.2 7.1V8.4C20.2 8.7 20.3 9 20.5 9.2L21.4 10.1C21.8 10.5 22.1 10.9 22.3 11.3C22.5 11.7 22.5 12.1 22.5 12.5ZM10.4 15.6L16.6 9.4L15.2 8L10.4 12.8L8.4 10.8L7 12.2L10.4 15.6Z"
              />
            </svg>
          )}
        </Link>
      </div>

      {/* Bottom: Post Info */}
      <div className="absolute bottom-4 left-3 right-3 flex flex-col gap-1 z-20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 bg-primary/80 px-1.5 py-0.5 rounded-sm">
            {item.post.category}
          </span>
        </div>
        <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-2 drop-shadow-sm group-hover:text-primary-foreground transition-colors break-words">
          {item.post.title}
        </h3>
        <p className="text-white/70 text-[10px] md:text-xs line-clamp-1 italic">
          by {item.post.author}
        </p>
      </div>
    </div>
  );
};

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedSharedPost, setSelectedSharedPost] = useState<typeof SHARED_POSTS[0] | null>(null);
  const [imageError, setImageError] = useState(false);
  const { publishedPosts } = usePosts();
  const { isAuthenticated, is_onboarded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage as backup for immediate state
    const userDataStr = localStorage.getItem('zeeque_user_data');
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const isOnboarded = is_onboarded || userData?.is_onboarded;
    const isAuth = isAuthenticated || !!localStorage.getItem('zeeque_auth_tokens');

    if (isAuth && !isOnboarded) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, is_onboarded, navigate]);

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
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Professional Ambient Background - Red & Blue Shades */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-rose-500/5 blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1" style={{ marginTop: 0, paddingTop: 0 }}>
          <HeroSection />

          {/* Status / Highlights Section */}
          <div className="relative z-30 mt-0 pt-16 pb-16 md:pb-24 bg-white dark:bg-background">
            <div className="container max-w-7xl px-4 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Trending Now
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight mb-3">
                  Community Spotlight
                </h2>
                <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                  Explore the latest creativity from our amazing students. From stories to art, see what's sparking imagination today! ✨
                </p>
              </div>

              {/* Scroll Container */}
              <div className="flex gap-4 md:gap-5 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pt-2 mask-linear-fade">
                {SHARED_POSTS.map((item) => (
                  <SharedPostCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      setSelectedSharedPost(item);
                      setImageError(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

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

        {/* Shared Post Details Dialog */}
        <Dialog open={!!selectedSharedPost} onOpenChange={(open) => !open && setSelectedSharedPost(null)}>
          <DialogContent
            noContentWrapper
            hideCloseButton
            className="max-w-5xl w-[95vw] md:w-full rounded-2xl p-0 overflow-hidden bg-background text-foreground border-border shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[650px] gap-0 outline-none"
          >

            {/* LEFT: Image Section */}
            <div className="w-full md:w-[40%] bg-black/95 flex items-center justify-center relative h-[40vh] md:h-full flex-shrink-0 border-r border-border/10 overflow-hidden p-6 md:p-12">
              {selectedSharedPost?.post.image && !imageError ? (
                <>
                  {/* Subtle Gradient Backdrop for Depth */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none"
                  />

                  {/* Main Image - Floating Card Style */}
                  <img
                    src={selectedSharedPost.post.image}
                    alt={selectedSharedPost.post.title}
                    className="w-full h-full object-contain relative z-10 rounded-lg shadow-2xl drop-shadow-2xl"
                    onError={() => setImageError(true)}
                  />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center relative overflow-hidden">
                  {/* Abstract Pattern Background */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

                  {/* Large Background Icon */}
                  <FileText className="absolute text-white/5 w-64 h-64 -bottom-12 -right-12 rotate-12" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center max-w-md">
                    <div className="w-16 h-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mb-6" />
                    <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight leading-tight mb-4 line-clamp-3">
                      {selectedSharedPost?.post.title}
                    </h3>
                    <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] border border-white/10 px-3 py-1 rounded-full">
                      {selectedSharedPost?.post.category}
                    </span>
                  </div>
                </div>
              )}
              {/* Mobile Close Button Overlay */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedSharedPost(null)}
                className="absolute top-3 right-3 z-50 text-white/70 hover:bg-white/10 hover:text-white backdrop-blur-md rounded-full md:hidden"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* RIGHT: Content Section */}
            <div className="flex flex-col flex-1 min-w-0 bg-background w-full overflow-hidden">

              {/* 1. Header: User Info & Actions */}
              <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={selectedSharedPost?.sharedBy.avatar} />
                    <AvatarFallback className="bg-muted text-foreground text-xs">{selectedSharedPost?.sharedBy.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-foreground leading-none">
                        {selectedSharedPost?.sharedBy.name}
                      </span>
                      {/* @ts-ignore */}
                      {selectedSharedPost?.sharedBy.isVerified && (
                        <svg
                          className="w-4 h-4 text-blue-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22.5 12.5C22.5 12.9 22.5 13.3 22.3 13.7C22.1 14.1 21.8 14.5 21.4 14.9L20.5 15.8C20.3 16 20.2 16.3 20.2 16.6V17.9C20.2 18.5 20 19.1 19.6 19.6C19.1 20 18.5 20.2 17.9 20.2H16.6C16.3 20.2 16 20.3 15.8 20.5L14.9 21.4C14.5 21.8 14.1 22.1 13.7 22.3C13.3 22.5 12.9 22.5 12.5 22.5C12.1 22.5 11.7 22.5 11.3 22.3C10.9 22.1 10.5 21.8 10.1 21.4L9.2 20.5C9 20.3 8.7 20.2 8.4 20.2H7.1C6.5 20.2 5.9 20 5.4 19.6C5 19.1 4.8 18.5 4.8 17.9V16.6C4.8 16.3 4.7 16 4.5 15.8L3.6 14.9C3.2 14.5 2.9 14.1 2.7 13.7C2.5 13.3 2.5 12.9 2.5 12.5C2.5 12.1 2.5 11.7 2.7 11.3C2.9 10.9 3.2 10.5 3.6 10.1L4.5 9.2C4.7 9 4.8 8.7 4.8 8.4V7.1C4.8 6.5 5 5.9 5.4 5.4C5.9 5 6.5 4.8 7.1 4.8H8.4C8.7 4.8 9 4.7 9.2 4.5L10.1 3.6C10.5 3.2 10.9 2.9 11.3 2.7C11.7 2.5 12.1 2.5 12.5 2.5C12.9 2.5 13.3 2.5 13.7 2.7C14.1 2.9 14.5 3.2 14.9 3.6L15.8 4.5C16 4.7 16.3 4.8 16.6 4.8H17.9C18.5 4.8 19.1 5 19.6 5.4C20 5.9 20.2 6.5 20.2 7.1V8.4C20.2 8.7 20.3 9 20.5 9.2L21.4 10.1C21.8 10.5 22.1 10.9 22.3 11.3C22.5 11.7 22.5 12.1 22.5 12.5ZM10.4 15.6L16.6 9.4L15.2 8L10.4 12.8L8.4 10.8L7 12.2L10.4 15.6Z"
                          />
                        </svg>
                      )}
                    </div>
                    {selectedSharedPost?.post.author !== selectedSharedPost?.sharedBy.name && (
                      <span className="text-[10px] text-muted-foreground mt-0.5">Author: {selectedSharedPost?.post.author}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-transparent">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedSharedPost(null)}
                    className="text-muted-foreground hover:text-foreground hover:bg-transparent hidden md:flex"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* 2. Scrollable Body: Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 custom-scrollbar bg-background">
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-6 leading-tight tracking-tight font-display">
                  {selectedSharedPost?.post.title}
                </h2>

                {/* Body Text */}
                <div className="text-lg md:text-xl leading-loose text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-medium">
                  {/* Drop cap effect */}
                  <span className="float-left text-5xl md:text-6xl font-black text-primary mr-3 mt-1 leading-none transform -rotate-2">
                    {selectedSharedPost?.post.content.charAt(0)}
                  </span>
                  {selectedSharedPost?.post.content.slice(1)}
                </div>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
