import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How can students submit their work?',
    answer: 'Students can submit their creative work by clicking the "Share Your Work" button in the hero section or navigating to the Submit page. They\'ll need to provide their name, teacher name, school name, select a category (stories, poems, drawings, news, video, or other), add a title, and include their content. For video submissions, they can include a video URL.',
  },
  {
    question: 'What types of content can be submitted?',
    answer: 'We welcome various types of creative content including stories, poems, drawings, classroom news, videos, and other creative works. Each category has its own unique style and showcase on the magazine.',
  },
  {
    question: 'How long does it take for submissions to be published?',
    answer: 'All submissions go through an editorial review process. Once submitted, your work will be reviewed by our editorial team. If approved, it will be published and visible to all readers. The review process typically takes a few days.',
  },
  {
    question: 'Can I edit my submission after it\'s been submitted?',
    answer: 'Once your submission is under review or published, you\'ll need to contact the editorial team if you need to make changes. However, if your submission is still pending, you may be able to edit it through the editorial dashboard.',
  },
  {
    question: 'Who can view the published content?',
    answer: 'All published content is visible to everyone who visits the magazine. This includes students, teachers, parents, and the wider community. We celebrate and share the amazing creativity of our young creators!',
  },
  {
    question: 'What should I do if my submission was rejected?',
    answer: 'If your submission was rejected, don\'t worry! You can always submit new work. The rejection might be due to content guidelines or formatting issues. Feel free to review the submission guidelines and try again with a new piece of creative work.',
  },
  {
    question: 'Can teachers submit content on behalf of students?',
    answer: 'Yes! Teachers can submit content on behalf of their students. When submitting, make sure to include the student\'s name as the author name, along with your name as the teacher and your school name.',
  },
  {
    question: 'Is there a limit to how many submissions I can make?',
    answer: 'There\'s no strict limit on the number of submissions. We encourage students to share their creativity! However, we do ask that each submission is original and represents your best work.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative py-20 md:py-24 lg:py-28 bg-muted/30">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:32px_32px] opacity-15" />
      
      <div className="container max-w-4xl relative z-10">
        {/* Professional Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-20 md:w-32 bg-gradient-to-r from-transparent via-border to-border/50" />
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground px-5 py-1.5">
              Frequently Asked
            </span>
            <div className="h-px w-20 md:w-32 bg-gradient-to-l from-transparent via-border to-border/50" />
          </div>
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.02em]">
              Questions & <span className="text-gradient-hero bg-clip-text text-transparent">Answers</span>
            </h2>
          </div>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            Find answers to common questions about submitting and viewing creative work
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-card p-6 md:p-8 lg:p-10">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/60 rounded-xl px-4 md:px-6 py-2 hover:border-primary/30 transition-colors duration-200 bg-background/50"
              >
                <AccordionTrigger className="text-left font-semibold text-base md:text-lg py-4 hover:no-underline group">
                  <span className="flex items-start gap-3">
                    <span className="text-primary mt-1 shrink-0">Q{index + 1}:</span>
                    <span className="group-hover:text-primary transition-colors duration-200">
                      {faq.question}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4 px-7">
                  <div className="flex items-start gap-3">
                    <span className="text-primary/60 mt-1 shrink-0 font-semibold">A:</span>
                    <p className="text-sm md:text-base">{faq.answer}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional Help CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="#latest"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors duration-200 group"
          >
            <span>Explore our magazine</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
