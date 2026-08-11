import Button from "@/components/ui/Button";

export default function FinalCta() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center md:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(31,203,160,0.18),transparent)]" />
        <h2 className="relative font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Put your SEO on autopilot today.
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-balance text-ash-300">
          Free to start. No credit card required.
        </p>
        <div className="relative mt-8 flex justify-center">
          <Button href="/signup" variant="accent" size="lg">
            Start Free
          </Button>
        </div>
      </div>
    </section>
  );
}
