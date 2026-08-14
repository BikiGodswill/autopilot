import { HiOutlineLink, HiOutlineSearch, HiOutlineAdjustments, HiOutlineTrendingUp } from "react-icons/hi";
import SectionHeading from "@/components/marketing/SectionHeading";

const STEPS = [
  { icon: HiOutlineLink, title: "Connect Your Website", description: "Enter your URL or connect your website." },
  { icon: HiOutlineSearch, title: "Analyze", description: "SEO Autopilot crawls and analyzes your website." },
  { icon: HiOutlineAdjustments, title: "Optimize", description: "AI generates recommendations, content, and fixes." },
  { icon: HiOutlineTrendingUp, title: "Grow", description: "Continuously monitor and improve SEO performance." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="How It Works" title="From audit to growth in four steps" />

        <div className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-ash-200 lg:block" />
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="relative flex flex-col items-start">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-ash-200 bg-white shadow-card">
                <Icon className="text-signal-indigo" size={20} />
              </div>
              <span className="mt-4 font-mono text-xs text-ash-400">Step {i + 1}</span>
              <h3 className="mt-1 font-display text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ash-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
