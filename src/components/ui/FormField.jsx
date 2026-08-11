export default function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs text-signal-red">{error}</p> : null}
    </label>
  );
}
