import { HiOutlineSparkles } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/marketing/SectionHeading";

const CAPABILITIES = [
  "Research topics",
  "Generate articles",
  "Improve existing content",
  "Generate metadata",
  "Generate FAQs",
  "Generate outlines",
  "Suggest internal links",
  "Generate schema markup",
];

export default function AiContent() {
  return (
    <section id="ai-content" className="container-page py-20 md:py-28">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="AI Content"
            title="Your AI Content Team"
            description="SEO Autopilot researches, writes, and structures content around what your audience is actually searching for."
          />
          <ul className="mt-8 grid grid-cols-2 gap-3">
            {CAPABILITIES.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ash-600">
                <HiOutlineSparkles className="shrink-0 text-signal-teal" size={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Card className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ash-400">
            Content generator
          </p>
          <div className="mt-4 space-y-3.5">
            <Field label="Target keyword" value="web development company in Cameroon" />
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Content type" value="Blog article" />
              <Field label="Search intent" value="Commercial" />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="Target length" value="2,000 words" />
              <Field label="Tone" value="Professional" />
            </div>
          </div>
          <Button variant="accent" size="md" className="mt-5 w-full">
            <HiOutlineSparkles size={16} />
            Generate Content
          </Button>
        </Card>
      </div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg border border-ash-200 bg-ash-50 px-3.5 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ash-400">{label}</p>
      <p className="mt-0.5 truncate text-sm text-ink">{value}</p>
    </div>
  );
}
