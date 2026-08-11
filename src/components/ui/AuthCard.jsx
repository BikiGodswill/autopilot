import Card from "@/components/ui/Card";

export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <Card className="p-7">
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
      {subtitle ? <p className="mt-1.5 text-sm text-ash-500">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-6 text-center text-sm text-ash-500">{footer}</div> : null}
    </Card>
  );
}
