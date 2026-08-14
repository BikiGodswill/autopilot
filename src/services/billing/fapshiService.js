import { initiatePay, getPaymentStatus, FapshiError } from "@/lib/payments/fapshiClient";
import { createNotification } from "@/services/notifications/notificationService";
import { PLANS } from "@/constants";

const PAYABLE_PLAN_IDS = new Set(["starter", "professional", "agency"]);

/**
 * Creates a Fapshi checkout link for a plan upgrade and records a
 * CREATED transaction locally. The transaction row is the source of
 * truth for "is this transId actually ours" — Fapshi's API has no
 * concept of our user accounts, so every later status check is scoped
 * through this row, not trusted from a bare transId alone.
 */
export async function createCheckoutSession(supabase, user, planId) {
  if (!PAYABLE_PLAN_IDS.has(planId)) {
    throw new FapshiError("Not a payable plan.");
  }
  const plan = PLANS[planId];

  const externalId = `sub-${user.id.slice(0, 8)}-${Date.now()}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await initiatePay({
    amount: plan.priceXAF,
    email: user.email,
    redirectUrl: `${appUrl}/dashboard/billing`,
    userId: user.id,
    externalId,
    message: `SEO Autopilot — ${plan.name} plan`,
  });

  const { data: transaction, error } = await supabase
    .from("payment_transactions")
    .insert({
      owner_id: user.id,
      trans_id: result.transId,
      plan: planId,
      amount: plan.priceXAF,
      status: "CREATED",
      external_id: externalId,
      payment_link: result.link,
    })
    .select()
    .single();

  if (error) throw error;

  return { link: result.link, transId: result.transId, transaction };
}

/**
 * Authoritatively resolves a transaction's status and, if it just
 * became SUCCESSFUL, applies the plan upgrade exactly once.
 *
 * `trustedStatusPayload` is only passed by the webhook route, after it
 * has already verified the x-wh-secret header — using it there avoids
 * a redundant round-trip to Fapshi. Every other caller (the billing
 * page polling after redirect) omits it, so this function fetches the
 * live status from Fapshi itself rather than trusting anything the
 * client claims.
 */
export async function confirmTransaction(supabase, transId, { trustedStatusPayload } = {}) {
  const { data: transaction, error: fetchError } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("trans_id", transId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!transaction) throw new FapshiError("Unknown transaction.");
  if (transaction.applied) return transaction; // already processed — idempotent no-op

  const status = trustedStatusPayload ?? (await getPaymentStatus(transId));

  const { data: updated, error: updateError } = await supabase
    .from("payment_transactions")
    .update({
      status: status.status,
      medium: status.medium ?? null,
      date_confirmed: status.dateConfirmed ?? null,
    })
    .eq("trans_id", transId)
    .select()
    .single();

  if (updateError) throw updateError;

  if (status.status === "SUCCESSFUL") {
    await applyPlanUpgrade(supabase, updated);
    return { ...updated, applied: true };
  }

  return updated;
}

async function applyPlanUpgrade(supabase, transaction) {
  const plan = PLANS[transaction.plan];
  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + 30);

  await supabase.from("profiles").update({ plan: transaction.plan }).eq("id", transaction.owner_id);

  await supabase.from("subscriptions").upsert(
    {
      owner_id: transaction.owner_id,
      plan: transaction.plan,
      status: "active",
      renewal_date: renewalDate.toISOString(),
      provider_subscription_id: transaction.trans_id,
    },
    { onConflict: "owner_id" }
  );

  await supabase.from("payment_transactions").update({ applied: true }).eq("trans_id", transaction.trans_id);

  await createNotification(supabase, {
    ownerId: transaction.owner_id,
    type: "plan_upgraded",
    title: `Upgraded to ${plan.name}`,
    body: `Your payment via ${transaction.medium || "Mobile Money"} was confirmed. Plan limits are updated immediately.`,
  });
}
