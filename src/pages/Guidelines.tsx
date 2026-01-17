import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Image, 
  Video, 
  Type, 
  BookOpen,
  Users,
  Award,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const guidelines = [
  {
    icon: Type,
    title: 'Stories',
    description: 'Creative narratives and imaginative tales',
    requirements: [
      'Must be original work created by the student',
      'Appropriate content for all ages',
      'Minimum 50 words, maximum 1000 words',
      'Can include illustrations or drawings',
    ],
    tips: [
      'Be creative and use your imagination',
      'Include a clear beginning, middle, and end',
      'Use descriptive words to paint a picture',
      'Have fun with your story!',
    ],
  },
  {
    icon: Sparkles,
    title: 'Poems',
    description: 'Rhyming verses and free-form poetry',
    requirements: [
      'Original poetry written by the student',
      'Can be rhyming or free verse',
      'Appropriate for all readers',
      'Minimum 4 lines, maximum 50 lines',
    ],
    tips: [
      'Play with words and sounds',
      'Express your feelings and thoughts',
      'Try different poem styles',
      'Read it aloud to hear how it sounds',
    ],
  },
  {
    icon: Image,
    title: 'Drawings',
    description: 'Artwork, sketches, and illustrations',
    requirements: [
      'Original artwork created by the student',
      'Clear, well-lit photo of the drawing',
      'Appropriate content for all ages',
      'Can be digital or traditional art',
    ],
    tips: [
      'Use bright colors and clear lines',
      'Take a good photo in natural light',
      'Make sure the drawing is complete',
      'Be proud of your artwork!',
    ],
  },
  {
    icon: Video,
    title: 'Videos',
    description: 'Short videos and creative content',
    requirements: [
      'Original video content',
      'Maximum 5 minutes in length',
      'Appropriate for all audiences',
      'Must be hosted on YouTube or Vimeo',
    ],
    tips: [
      'Keep it short and engaging',
      'Use good lighting and clear audio',
      'Be creative and have fun',
      'Make sure it\'s appropriate for everyone',
    ],
  },
  {
    icon: BookOpen,
    title: 'Classroom News',
    description: 'Updates and announcements from teachers',
    requirements: [
      'Submitted by teachers or staff',
      'Relevant to the school community',
      'Appropriate and informative content',
      'Can include photos or images',
    ],
    tips: [
      'Keep it informative and engaging',
      'Include relevant details',
      'Add photos when possible',
      'Share exciting news and updates',
    ],
  },
];

const generalGuidelines = [
  {
    icon: CheckCircle,
    title: 'What We Accept',
    items: [
      'Original work created by students',
      'Appropriate content for all ages',
      'Creative and imaginative submissions',
      'Work that celebrates learning and creativity',
      'Content that is respectful and positive',
    ],
  },
  {
    icon: XCircle,
    title: 'What We Don\'t Accept',
    items: [
      'Content that is inappropriate or offensive',
      'Work that is not original',
      'Submissions with personal information (addresses, phone numbers)',
      'Content that promotes violence or harmful behavior',
      'Spam or irrelevant submissions',
    ],
  },
];

export default function Guidelines() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
          
          <div className="container max-w-5xl relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-20 md:w-32 bg-gradient-to-r from-transparent via-border to-border/50" />
                <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground px-5 py-1.5">
                  Submission Guide
                </span>
                <div className="h-px w-20 md:w-32 bg-gradient-to-l from-transparent via-border to-border/50" />
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-[-0.02em]">
                Submission <span className="text-gradient-hero bg-clip-text text-transparent">Guidelines</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Everything you need to know about sharing your creative work with our magazine
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/submit">
                  Submit Your Work
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Magazine
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container max-w-5xl">
            {/* General Guidelines */}
            <div className="mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
                General Guidelines
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {generalGuidelines.map((section, index) => (
                  <Card key={index} className="border-2 border-border/60 shadow-card">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          section.icon === CheckCircle 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <section.icon className={`w-6 h-6 ${
                            section.icon === CheckCircle 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        <CardTitle className="font-display text-xl">{section.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3">
                            <span className={`mt-1 shrink-0 ${
                              section.icon === CheckCircle 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {section.icon === CheckCircle ? '✓' : '✗'}
                            </span>
                            <span className="text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Category-Specific Guidelines */}
            <div className="mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
                Category Guidelines
              </h2>
              <div className="space-y-6">
                {guidelines.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Card key={index} className="border-2 border-border/60 shadow-card hover:shadow-hover transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="font-display text-2xl mb-2">{category.title}</CardTitle>
                            <p className="text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Requirements
                          </h3>
                          <ul className="space-y-2">
                            {category.requirements.map((req, reqIndex) => (
                              <li key={reqIndex} className="flex items-start gap-3 text-muted-foreground">
                                <span className="text-primary mt-1.5 shrink-0">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-accent" />
                            Tips for Success
                          </h3>
                          <ul className="space-y-2">
                            {category.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-3 text-muted-foreground">
                                <span className="text-accent mt-1.5 shrink-0">💡</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Review Process */}
            <Card className="border-2 border-border/60 shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  Review Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary text-primary-foreground shrink-0 mt-1">1</Badge>
                    <div>
                      <p className="font-semibold mb-1">Submission</p>
                      <p className="text-sm text-muted-foreground">
                        Submit your work through our submission form. Make sure to include all required information.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-amber-500 text-white shrink-0 mt-1">2</Badge>
                    <div>
                      <p className="font-semibold mb-1">Review</p>
                      <p className="text-sm text-muted-foreground">
                        Our editorial team reviews each submission to ensure it meets our guidelines and standards.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-500 text-white shrink-0 mt-1">3</Badge>
                    <div>
                      <p className="font-semibold mb-1">Publication</p>
                      <p className="text-sm text-muted-foreground">
                        Approved submissions are published and featured in our magazine for everyone to enjoy!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/60">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> The review process typically takes a few days. You'll be notified once your submission has been reviewed.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Final CTA */}
            <div className="mt-16 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Ready to Share Your Work?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Follow these guidelines and submit your creative work to be featured in our magazine!
              </p>
              <Button asChild size="lg" className="rounded-full px-10">
                <Link to="/submit">
                  Start Your Submission
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
