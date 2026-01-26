import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SubmitForm } from '@/components/SubmitForm';

const Submit = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Professional Background Effect */}
      <div className="absolute inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] opacity-50 dark:opacity-20" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] opacity-50 dark:opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
      </div>

      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-full px-4 sm:px-6 lg:px-8">
          <SubmitForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Submit;
