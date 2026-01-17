import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SubmitForm } from '@/components/SubmitForm';

const Submit = () => {
  return (
    <div className="min-h-screen flex flex-col">
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
