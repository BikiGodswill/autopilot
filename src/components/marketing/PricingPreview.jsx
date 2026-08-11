import SectionHeading from "@/components/marketing/SectionHeading";
import PricingCards from "@/components/marketing/PricingCards";

export default function PricingPreview() {
  return (
    <section id="pricing" className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="Pricing"
        title="Plans that grow with your website"
        description="Start free. Upgrade when you're ready for automated optimization and more websites."
      />
      <div className="mt-14">
        <PricingCards />
      </div>
    </section>
  );
}
