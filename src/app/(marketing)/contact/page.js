import SectionHeading from "@/components/marketing/SectionHeading";
import ContactForm from "@/components/marketing/ContactForm";

export const metadata = { title: "Contact — SEO Autopilot" };

export default function ContactPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-lg">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to us"
          description="Questions about plans, integrations, or agency accounts — we read every message."
        />
        <div className="mt-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
