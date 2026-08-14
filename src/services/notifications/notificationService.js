export async function listNotifications(supabase, ownerId, { unreadOnly = false } = {}) {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (unreadOnly) query = query.eq("read", false);
  return query;
}

export async function markNotificationRead(supabase, id) {
  return supabase.from("notifications").update({ read: true }).eq("id", id).select().single();
}

export async function markAllNotificationsRead(supabase, ownerId) {
  return supabase.from("notifications").update({ read: true }).eq("owner_id", ownerId).eq("read", false);
}

export async function createNotification(supabase, { ownerId, websiteId, type, title, body }) {
  return supabase
    .from("notifications")
    .insert({ owner_id: ownerId, website_id: websiteId ?? null, type, title, body: body ?? null })
    .select()
    .single();
}
