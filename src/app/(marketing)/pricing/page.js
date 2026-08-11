import SectionHeading from "@/components/marketing/SectionHeading";
import PricingCards from "@/components/marketing/PricingCards";
import Faq from "@/components/marketing/Faq";

export const metadata = { title: "Pricing — SEO Autopilot" };

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans, real SEO work"
          description="Every plan includes AI audits, content generation, and monitoring — limits scale with your needs."
        />
        <div className="mt-14">
          <PricingCards />
        </div>
      </div>
      <div className="mt-16">
        <Faq />
      </div>
    </div>
  );
}
