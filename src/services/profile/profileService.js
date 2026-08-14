export async function getProfile(supabase, userId) {
  return supabase.from("profiles").select("*").eq("id", userId).single();
}

export async function updateProfile(supabase, userId, updates) {
  const allowed = {
    full_name: updates.fullName,
    default_country: updates.defaultCountry,
    default_language: updates.defaultLanguage,
    brand_voice: updates.brandVoice,
    ai_tone: updates.aiTone,
    ai_default_length: updates.aiDefaultLength,
    email_notifications: updates.emailNotifications,
    seo_alert_notifications: updates.seoAlertNotifications,
    content_alert_notifications: updates.contentAlertNotifications,
  };
  // Drop undefined keys so a partial update doesn't null out other fields.
  Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);

  return supabase.from("profiles").update(allowed).eq("id", userId).select().single();
}
