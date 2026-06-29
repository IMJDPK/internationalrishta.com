import BureauBenefits from "@/components/BureauBenefits";
import BureauDirectory, {
  BureauDirectoryFallback,
} from "@/components/bureau/BureauDirectory";
import BureauLandingHero from "@/components/bureau/BureauLandingHero";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Suspense } from "react";

export default function BureauPage() {
  return (
    <main className="bg-white">
      <Navigation />

      <BureauLandingHero />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <BureauBenefits />
          <Suspense fallback={<BureauDirectoryFallback />}>
            <BureauDirectory />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  );
}
