import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SubmitForm } from '@/components/SubmitForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Submit = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          {/* Back link */}
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Magazine
            </Link>
          </Button>
          
          <SubmitForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Submit;
