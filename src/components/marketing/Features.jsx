import {
  HiOutlineDocumentSearch,
  HiOutlineSparkles,
  HiOutlineCog,
  HiOutlineLightningBolt,
  HiOutlineTag,
  HiOutlineChartBar,
  HiOutlineLightBulb,
  HiOutlineDocumentReport,
} from "react-icons/hi";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/marketing/SectionHeading";

const FEATURES = [
  {
    icon: HiOutlineDocumentSearch,
    title: "AI SEO Audit",
    description: "Analyze your entire website automatically.",
  },
  {
    icon: HiOutlineSparkles,
    title: "AI Content Engine",
    description:
      "Generate SEO-optimized content based on keywords and search intent.",
  },
  {
    icon: HiOutlineCog,
    title: "Technical SEO",
    description: "Detect technical problems and recommend fixes.",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "Auto Optimization",
    description: "Automatically apply approved SEO improvements.",
  },
  {
    icon: HiOutlineTag,
    title: "Keyword Intelligence",
    description: "Discover valuable keyword opportunities.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Continuous Monitoring",
    description: "Monitor SEO health continuously.",
  },
  {
    icon: HiOutlineLightBulb,
    title: "AI Recommendations",
    description: "Receive actionable recommendations.",
  },
  {
    icon: HiOutlineDocumentReport,
    title: "SEO Reports",
    description: "Generate professional SEO reports.",
  },
];

export default function Features() {
  return (
    <section id="features" className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="Features"
        title="Everything your SEO needs, run by AI"
        description="One platform to analyze, fix, write, and monitor — instead of stitching together five tools."
      />

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} hover className="p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-teal-soft">
              <Icon className="text-signal-teal" size={20} />
            </div>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ash-500">
              {description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
