import Navigation from '@/components/Navigation';
import VideoHero from '@/components/VideoHero';
import HowItWorks from '@/components/HowItWorks';
import TrustSection from '@/components/TrustSection';
import PricingPreview from '@/components/PricingPreview';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Navigation />
      <VideoHero />
      <HowItWorks />
      <TrustSection />
      <PricingPreview />
      <Footer />
    </main>
  );
}
