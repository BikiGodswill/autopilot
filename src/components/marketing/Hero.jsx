import WebsiteAnalyzer from "@/components/marketing/WebsiteAnalyzer";
import Badge from "@/components/ui/Badge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(31,203,160,0.08),transparent)]" />

      <div className="container-page flex flex-col items-center text-center">
        <Badge tone="indigo" className="animate-fadeUp">
          AI SEO employee, working continuously
        </Badge>

        <h1 className="animate-fadeUp mt-6 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink [animation-delay:80ms] [animation-fill-mode:backwards] md:text-6xl">
          Put Your Website&rsquo;s SEO on Autopilot.
        </h1>

        <p className="animate-fadeUp mt-5 max-w-xl text-balance text-base leading-relaxed text-ash-500 [animation-delay:160ms] [animation-fill-mode:backwards] md:text-lg">
          Analyze your website, fix technical SEO issues, create high-ranking
          content, and continuously improve your search visibility with AI.
        </p>

        <div className="animate-fadeUp mt-10 flex justify-center [animation-delay:240ms] [animation-fill-mode:backwards]">
          <WebsiteAnalyzer />
        </div>
      </div>
    </section>
  );
}
