import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import AiContent from "@/components/marketing/AiContent";
import ScoreShowcase from "@/components/marketing/ScoreShowcase";
import SectionHeading from "@/components/marketing/SectionHeading";

export const metadata = { title: "Features — SEO Autopilot" };

export default function FeaturesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Product"
          title="Everything you need to grow organic traffic"
          description="Audits, content, fixes, and monitoring — designed to work together instead of as five disconnected tools."
        />
      </div>
      <div className="mt-8">
        <Features />
        <HowItWorks />
        <AiContent />
        <ScoreShowcase />
      </div>
    </div>
  );
}
