import Link from "next/link";

export default function Logo({ className = "" }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-ink">
        <span className="h-2 w-2 rounded-full bg-signal-teal" />
        <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
      </span>
      <div>
        <span className="font-display text-[15px] font-semibold tracking-tight  bg-ink text-white rounded-md p-1">
          Auto
        </span>
        <span className="font-display text-[15px] font-semibold tracking-tight  bg-white text-ink rounded-md p-1 border border-ink">
          Pilot
        </span>
      </div>
    </Link>
  );
}
