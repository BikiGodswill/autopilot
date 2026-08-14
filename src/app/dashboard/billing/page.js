import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PlanUpgradeGrid from "@/components/dashboard/PlanUpgradeGrid";
import BillingStatusBanner from "@/components/dashboard/BillingStatusBanner";
import { PLANS } from "@/constants";
import { createClient } from "@/lib/supabase/server";
import { countWebsitesForOwner } from "@/services/websites/websiteService";
import { getUsageSummary } from "@/services/usage/usageService";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const currentPlanId = profile?.plan ?? "free";
  const currentPlan = PLANS[currentPlanId];

  const { count: websiteCount } = await countWebsitesForOwner(supabase, user.id);
  const { data: usage } = await getUsageSummary(supabase, user.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Billing</h1>

      <div className="mt-6">
        <BillingStatusBanner />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ash-400">Current plan</p>
            <p className="mt-1 font-display text-xl font-semibold text-ink">{currentPlan.name}</p>
          </div>
          <Badge tone="teal">Active</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-ash-100 pt-5 sm:grid-cols-4">
          <UsageStat label="Websites" used={websiteCount} limit={currentPlan.limits.websites} />
          <UsageStat label="Audits / mo" used={usage.monthly_audits} limit={currentPlan.limits.monthlyAudits} />
          <UsageStat label="AI words / mo" used={usage.ai_words} limit={currentPlan.limits.aiWords} />
          <UsageStat label="Keywords" used={usage.tracked_keywords} limit={currentPlan.limits.trackedKeywords} />
        </div>
      </Card>

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">Change plan</h2>
      <div className="mt-4">
        <PlanUpgradeGrid currentPlanId={currentPlanId} />
      </div>
    </div>
  );
}

function UsageStat({ label, used, limit }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <p className="text-xs text-ash-400">{label}</p>
      <p className="mt-0.5 font-mono text-sm text-ink">
        {used} / {limit}
      </p>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-ash-100">
        <div className="h-full rounded-full bg-signal-teal" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
