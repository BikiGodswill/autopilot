import Card from "@/components/ui/Card";

export default function ComingSoon({ title, description }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      <Card className="mt-6 flex flex-col items-center gap-2 p-12 text-center">
        <p className="text-sm font-medium text-ink">Coming in a later build phase</p>
        <p className="max-w-sm text-sm text-ash-500">{description}</p>
      </Card>
    </div>
  );
}
