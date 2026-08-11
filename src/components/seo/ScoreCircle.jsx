const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColor(score) {
  if (score >= 85) return "#1FCBA0"; // signal.teal
  if (score >= 60) return "#F5A524"; // signal.amber
  return "#F2545B"; // signal.red
}

/**
 * Animated radial score gauge. Pass `score` 0-100.
 * `size` controls the rendered px dimensions; the viewBox stays fixed
 * so stroke width scales predictably.
 */
export default function ScoreCircle({ score = 0, size = 96, label, sublabel }) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  const color = scoreColor(clamped);

  return (
    <div className="inline-flex flex-col items-center gap-2" style={{ "--score-offset": offset }}>
      <div style={{ width: size, height: size }} className="relative">
        <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke="#EEF0F4"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            className="animate-dash"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-2xl font-semibold tabular-nums text-ink">
            {clamped}
          </span>
        </div>
      </div>
      {label ? (
        <div className="text-center">
          <p className="text-sm font-medium text-ink">{label}</p>
          {sublabel ? <p className="text-xs text-ash-500">{sublabel}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
