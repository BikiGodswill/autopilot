const SEGMENTS = [
  "Startups",
  "Agencies",
  "Creators",
  "E-commerce",
  "SaaS teams",
  "Local businesses",
];

export default function SocialProof() {
  return (
    <section className="border-y border-ash-200 bg-white py-10">
      <div className="container-page">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-ash-800">
          Built for growing businesses, creators, agencies, and startups
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {SEGMENTS.map((segment) => (
            <span
              key={segment}
              className="font-display text-sm font-medium text-ash-800 bg-ink/10 px-3 py-1 rounded-md"
            >
              {segment}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
