export default function SectionHeading({ eyebrow, title, description, align = "center" }) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col ${alignClass} gap-4`}>
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-wider text-signal-indigo">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-balance text-base leading-relaxed text-ash-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}
