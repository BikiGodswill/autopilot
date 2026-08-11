export async function getMonitoringSettings(supabase, websiteId) {
  return supabase.from("monitoring_settings").select("*").eq("website_id", websiteId).maybeSingle();
}

export async function upsertMonitoringSettings(supabase, websiteId, settings) {
  return supabase
    .from("monitoring_settings")
    .upsert(
      {
        website_id: websiteId,
        frequency: settings.frequency ?? "weekly",
        auto_audits: settings.autoAudits ?? true,
        auto_recommendations: settings.autoRecommendations ?? true,
        ai_content_suggestions: settings.aiContentSuggestions ?? true,
        metadata_optimization: settings.metadataOptimization ?? false,
        automatic_publishing: settings.automaticPublishing ?? false,
        keyword_monitoring: settings.keywordMonitoring ?? true,
        weekly_reports: settings.weeklyReports ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "website_id" }
    )
    .select()
    .single();
}
