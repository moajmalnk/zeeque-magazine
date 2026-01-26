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

// ... (imports remain the same)

export default function Guidelines() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Updated Playful Hero Section */}
        <section className="relative py-20 pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

          <div className="container max-w-5xl relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-primary/20 px-4 py-2 rounded-full shadow-sm animate-fade-in mb-8">
              <span className="text-xl">📚</span>
              <span className="font-bold text-primary tracking-wide text-sm">Submission Guide</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight text-foreground drop-shadow-sm">
              How to be a <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent inline-block animate-wiggle">
                Star Creator
              </span> ⭐
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about sharing your magical creations with the world!
            </p>

            <div className="flex justify-center gap-4 mt-8">
              <Button asChild size="lg" className="rounded-full px-8 h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Link to="/submit">Submit Your Work 🚀</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-2 hover:bg-secondary/50">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-20 -mt-20">
          <div className="container max-w-5xl">

            {/* General Guidelines Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-20">
              {generalGuidelines.map((section, index) => (
                <Card key={index} className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`p-3 rounded-2xl ${section.icon === CheckCircle ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        <section.icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="font-display text-2xl font-bold dark:text-white">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-2">
                    <ul className="space-y-4">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`mt-1 font-bold ${section.icon === CheckCircle ? 'text-green-500' : 'text-red-500'}`}>
                            {section.icon === CheckCircle ? '✓' : '✖'}
                          </span>
                          <span className="text-lg text-slate-600 dark:text-slate-300 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Category Guidelines */}
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-12 text-center text-slate-800 dark:text-white">
              Category Rules
            </h2>
            <div className="space-y-8">
              {guidelines.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="group border-2 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] bg-white dark:bg-slate-900/50 hover:-translate-y-1">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                      {/* Icon Side */}
                      <div className="p-8 md:p-12 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/80 md:w-1/3 text-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 rounded-t-[2.5rem] md:rounded-l-[2.5rem] md:rounded-tr-none">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="font-display text-3xl font-bold text-slate-800 dark:text-white mb-2">{category.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{category.description}</p>
                      </div>

                      {/* Content Side */}
                      <div className="p-8 md:p-12 flex-1 grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Requirements
                          </h4>
                          <ul className="space-y-3">
                            {category.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm md:text-base">
                                <span className="text-primary mt-1">•</span> {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" /> Pro Tips
                          </h4>
                          <ul className="space-y-3">
                            {category.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm md:text-base">
                                <span className="text-amber-500 mt-1">💡</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
