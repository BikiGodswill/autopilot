import { HiOutlineCheck } from "react-icons/hi";
import { PLANS } from "@/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function formatXAF(amount) {
  return new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(amount);
}

export default function PricingCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Object.values(PLANS).map((plan) => (
        <Card
          key={plan.id}
          className={`flex flex-col p-6 ${
            plan.highlighted ? "border-ink ring-1 ring-ink" : ""
          }`}
        >
          {plan.highlighted ? (
            <span className="mb-3 w-fit rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-white">
              Most popular
            </span>
          ) : null}

          <h3 className="font-display text-lg font-semibold text-ink">{plan.name}</h3>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-semibold text-ink">
              {plan.priceXAF === 0 ? "Free" : formatXAF(plan.priceXAF)}
            </span>
            {plan.priceXAF > 0 ? <span className="text-sm text-ash-400">/mo</span> : null}
          </p>

          <ul className="mt-6 flex-1 space-y-2.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-ash-600">
                <HiOutlineCheck className="mt-0.5 shrink-0 text-signal-teal" size={16} />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            href="/signup"
            variant={plan.highlighted ? "primary" : "outline"}
            size="md"
            className="mt-6 w-full"
          >
            {plan.priceXAF === 0 ? "Start Free" : "Choose " + plan.name}
          </Button>
        </Card>
      ))}
    </div>
  );
}
