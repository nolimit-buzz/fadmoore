import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import UploadSection from '@/components/upload/upload-section';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-5xl mx-auto">
          <section className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Business Agreement <span className="text-primary">Analyzer</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your business agreements and get valuable insights about client relationships and retention likelihood.
            </p>
          </section>
          
          <UploadSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}