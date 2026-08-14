"use client";

import { useState } from "react";
import { HiOutlineCheck } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PLANS } from "@/constants";

function formatXAF(amount) {
  return new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(amount);
}

export default function PlanUpgradeGrid({ currentPlanId }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");

  async function handleUpgrade(planId) {
    setError("");
    setLoadingPlan(planId);

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const json = await res.json();

    if (!json.success) {
      setError(json.error?.message || "Couldn't start checkout.");
      setLoadingPlan(null);
      return;
    }

    // Fapshi's hosted checkout page — MTN MoMo / Orange Money selection
    // and OTP confirmation happen there, then it redirects back here.
    window.location.href = json.data.link;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isFree = plan.id === "free";

          return (
            <Card key={plan.id} className={`flex flex-col p-5 ${isCurrent ? "border-ink ring-1 ring-ink" : ""}`}>
              <p className="font-display text-base font-semibold text-ink">{plan.name}</p>
              <p className="mt-1 font-mono text-xl font-semibold text-ink">
                {isFree ? "Free" : formatXAF(plan.priceXAF)}
                {!isFree ? <span className="text-sm font-normal text-ash-400">/mo</span> : null}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-ash-500">
                    <HiOutlineCheck className="mt-0.5 shrink-0 text-signal-teal" size={13} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? "outline" : "primary"}
                size="sm"
                className="mt-4"
                disabled={isCurrent || isFree || loadingPlan !== null}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isCurrent ? "Current plan" : loadingPlan === plan.id ? "Redirecting..." : "Pay with Mobile Money"}
              </Button>
            </Card>
          );
        })}
      </div>
      {error ? <p className="mt-4 text-sm text-signal-red">{error}</p> : null}
      <p className="mt-4 text-xs text-ash-400">
        Payments are collected via Fapshi (MTN Mobile Money and Orange Money). You&rsquo;ll be redirected to a
        secure Fapshi checkout page to confirm the payment on your phone.
      </p>
    </div>
  );
}
