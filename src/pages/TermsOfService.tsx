import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollText, ThumbsUp, AlertCircle, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TermsOfService() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                <section className="relative py-20 pb-32 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                    <div className="container max-w-4xl relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-primary/20 px-4 py-2 rounded-full shadow-sm animate-fade-in mb-8">
                            <ScrollText className="w-5 h-5 text-primary" />
                            <span className="font-bold text-primary tracking-wide text-sm">Our Rules</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 tracking-tight text-foreground drop-shadow-sm">
                            Terms of Service
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                            The gentle guidelines that keep our magical community a happy place for everyone.
                        </p>
                    </div>
                </section>

                <section className="py-12 md:py-20 -mt-20">
                    <div className="container max-w-4xl">
                        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] overflow-hidden p-8 md:p-12">
                            <h2 className="flex items-center gap-3 text-2xl font-display font-bold text-slate-800 dark:text-white mb-4">
                                <Heart className="w-8 h-8 text-primary" /> Welcome to ZeeQue
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                                Welcome to our digital playground! By exploring, creating, and sharing on ZeeQue, you agree to follow these simple rules. Think of them like classroom rules—they help everyone have a great time!
                            </p>

                            <h3 className="flex items-center gap-3 text-xl font-display font-bold text-slate-800 dark:text-white mb-4 mt-12">
                                <ThumbsUp className="w-6 h-6 text-secondary" /> Be Kind & Creative
                            </h3>
                            <ul className="space-y-4 text-slate-600 dark:text-slate-300 mb-8 list-none pl-0">
                                <li className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <span className="text-secondary text-xl mt-0.5">🌟</span>
                                    <span className="text-lg">Always share your own original work. We want to see YOUR amazing ideas!</span>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <span className="text-secondary text-xl mt-0.5">🌟</span>
                                    <span className="text-lg">Use kind words. Our platform is a place for encouragement and smiles.</span>
                                </li>
                            </ul>

                            <h3 className="flex items-center gap-3 text-xl font-display font-bold text-slate-800 dark:text-white mb-4 mt-12">
                                <AlertCircle className="w-6 h-6 text-amber-500" /> Keeping Things Awesome
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                                Our teachers and moderators review everything to make sure it's perfect for our preschool friends. We might have to politely decline submissions that are too scary, not original, or share private information. Our goal is to ensure ZeeQue remains a positive space for all students to express their creativity.
                            </p>

                            <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 text-center">
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
