import Hero from "@/components/marketing/Hero";
import SocialProof from "@/components/marketing/SocialProof";
import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import AiContent from "@/components/marketing/AiContent";
import ScoreShowcase from "@/components/marketing/ScoreShowcase";
import PricingPreview from "@/components/marketing/PricingPreview";
import Faq from "@/components/marketing/Faq";
import FinalCta from "@/components/marketing/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <AiContent />
      <ScoreShowcase />
      <PricingPreview />
      <Faq />
      <FinalCta />
    </>
  );
}
