import ScoreCircle from "@/components/seo/ScoreCircle";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/marketing/SectionHeading";

const CATEGORIES = [
  { label: "Technical SEO", value: 94 },
  { label: "On-Page SEO", value: 89 },
  { label: "Content", value: 82 },
  { label: "Performance", value: 81 },
  { label: "Accessibility", value: 91 },
];

export default function ScoreShowcase() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="SEO Score"
          title="One score. Every ranking factor."
          description="A single, explainable number pulled from technical, on-page, content, performance, and accessibility signals."
        />

        <Card className="mt-14 grid grid-cols-1 items-center gap-10 p-8 md:grid-cols-[auto_1fr] md:p-10">
          <ScoreCircle score={87} size={140} label="SEO Score" sublabel="87 / 100" />

          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ash-600">{cat.label}</span>
                  <span className="font-mono text-ink">{cat.value}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ash-100">
                  <div
                    className="h-full rounded-full bg-signal-teal"
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
