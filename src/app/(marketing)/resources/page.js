import SectionHeading from "@/components/marketing/SectionHeading";
import Card from "@/components/ui/Card";

export const metadata = { title: "Resources — SEO Autopilot" };

const ARTICLES = [
  { title: "How AI audits your website's SEO", tag: "Guide" },
  { title: "Writing content that matches search intent", tag: "Guide" },
  { title: "Technical SEO checklist for 2026", tag: "Checklist" },
];

export default function ResourcesPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="Resources"
        title="Guides on SEO Autopilot"
        description="More guides and the changelog land here as the product ships."
      />
      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ARTICLES.map((a) => (
          <Card key={a.title} hover className="p-6">
            <span className="text-xs font-medium uppercase tracking-wide text-signal-indigo">
              {a.tag}
            </span>
            <h3 className="mt-3 font-display text-base font-semibold text-ink">{a.title}</h3>
            <p className="mt-2 text-sm text-ash-400">Coming soon</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
