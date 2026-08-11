const TONES = {
  neutral: "bg-ash-100 text-ash-600",
  teal: "bg-signal-teal-soft text-signal-teal",
  indigo: "bg-signal-indigo-soft text-signal-indigo",
  amber: "bg-amber-50 text-signal-amber",
  red: "bg-red-50 text-signal-red",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
