import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Lock, Eye, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                <section className="relative py-20 pb-32 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                    <div className="container max-w-4xl relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-primary/20 px-4 py-2 rounded-full shadow-sm animate-fade-in mb-8">
                            <Shield className="w-5 h-5 text-primary" />
                            <span className="font-bold text-primary tracking-wide text-sm">Safe & Secure</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 tracking-tight text-foreground drop-shadow-sm">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                            How we protect your magical creations and keep you safe online.
                        </p>
                    </div>
                </section>

                <section className="py-12 md:py-20 -mt-20">
                    <div className="container max-w-4xl">
                        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] overflow-hidden p-8 md:p-12">
                            <h2 className="flex items-center gap-3 text-2xl font-display font-bold text-slate-800 dark:text-white mb-4">
                                <Shield className="w-8 h-8 text-primary" /> Our Promise
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                                At ZeeQue Preschool, we believe that creating a safe space for your imagination is our most important job. We protect your personal information just like a superhero protects their secret identity!
                            </p>

                            <h3 className="flex items-center gap-3 text-xl font-display font-bold text-slate-800 dark:text-white mb-4 mt-12">
                                <Eye className="w-6 h-6 text-secondary" /> What we see
                            </h3>
                            <ul className="space-y-4 text-slate-600 dark:text-slate-300 mb-8 list-none pl-0">
                                <li className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <span className="text-secondary text-xl mt-0.5">✨</span>
                                    <span className="text-lg">We see the wonderful stories, poems, and art you share.</span>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <span className="text-secondary text-xl mt-0.5">✨</span>
                                    <span className="text-lg">We keep track of basic account details securely with help from your parents or teachers.</span>
                                </li>
                            </ul>

                            <h3 className="flex items-center gap-3 text-xl font-display font-bold text-slate-800 dark:text-white mb-4 mt-12">
                                <Lock className="w-6 h-6 text-amber-500" /> How we protect it
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                                Your masterpieces are stored in our super-secure digital vault. Only approved people can see your work, and we never share your real name or address with strangers. We make sure our digital playground is perfectly safe for you to explore and share.
                            </p>

                            <h3 className="flex items-center gap-3 text-xl font-display font-bold text-slate-800 dark:text-white mb-4 mt-12">
                                <Heart className="w-6 h-6 text-red-500" /> Parent's Corner
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                                Parents and guardians have full control over what is shared on ZeeQue. You can review, edit, or remove your child's content at any time. We strictly adhere to privacy guidelines to ensure the utmost safety for our young creators. Let's make learning fun and secure together!
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
