import SectionHeading from "@/components/marketing/SectionHeading";
import Card from "@/components/ui/Card";

export const metadata = { title: "About — SEO Autopilot" };

const VALUES = [
  { title: "No guaranteed rankings", description: "We tell you what we can actually influence — technical health, content quality, and on-page signals — never a promise no tool can keep." },
  { title: "You approve every change", description: "AI drafts fixes and content. Nothing publishes to your live site without your review." },
  { title: "Built to be replaced", description: "Every AI and data integration is built behind a clean abstraction, so the platform improves without lock-in." },
];

export default function AboutPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="About"
        title="An AI SEO employee for teams without one"
        description="SEO Autopilot exists because most websites don't have a dedicated SEO specialist — but every website competes with businesses that do."
      />

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {VALUES.map((v) => (
          <Card key={v.title} className="p-6">
            <h3 className="font-display text-base font-semibold text-ink">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ash-500">{v.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
