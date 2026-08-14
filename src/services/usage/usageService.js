/**
 * Meters usage against the monthly limits defined per plan
 * (src/constants/index.js PLANS.<plan>.limits) using the usage_records
 * table. One row per (owner, calendar month).
 */

function currentPeriodStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

async function getOrCreateUsageRecord(supabase, ownerId) {
  const periodStart = currentPeriodStart();

  const { data: existing, error: readError } = await supabase
    .from("usage_records")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("period_start", periodStart)
    .maybeSingle();

  if (readError) return { error: readError };
  if (existing) return { data: existing };

  const { data: created, error: createError } = await supabase
    .from("usage_records")
    .insert({ owner_id: ownerId, period_start: periodStart })
    .select()
    .single();

  return { data: created, error: createError };
}

/**
 * Read-only accessor for the current period's usage — for display
 * (billing page), not metering. Returns zeros for a period with no
 * activity yet rather than creating a row, since a page view
 * shouldn't have the side effect of writing to the database.
 */
export async function getUsageSummary(supabase, ownerId) {
  const periodStart = currentPeriodStart();

  const { data, error } = await supabase
    .from("usage_records")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("period_start", periodStart)
    .maybeSingle();

  if (error) return { error };
  return { data: data ?? { monthly_audits: 0, ai_words: 0, tracked_keywords: 0 } };
}

/**
 * Checks whether `amount` more usage of `field` would exceed the
 * plan's limit. Does NOT increment — call recordUsage after the
 * metered action actually succeeds, so a failed AI call or crawl
 * doesn't consume the user's quota.
 */
export async function checkLimit(supabase, ownerId, plan, field, limitKey, amount = 1) {
  const { data: usage, error } = await getOrCreateUsageRecord(supabase, ownerId);
  if (error) return { error };

  const limit = plan.limits[limitKey];
  const projected = (usage[field] ?? 0) + amount;

  if (projected > limit) {
    return {
      limitExceeded: true,
      message: `Your ${plan.name} plan's ${limitKey} limit (${limit}) would be exceeded. Upgrade to continue.`,
    };
  }

  return { usage };
}

export async function recordUsage(supabase, ownerId, field, amount = 1) {
  const { data: usage, error } = await getOrCreateUsageRecord(supabase, ownerId);
  if (error) return { error };

  return supabase
    .from("usage_records")
    .update({ [field]: (usage[field] ?? 0) + amount })
    .eq("id", usage.id)
    .select()
    .single();
}
