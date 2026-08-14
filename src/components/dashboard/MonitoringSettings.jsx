"use client";

import { useEffect, useState, useCallback } from "react";
import Card from "@/components/ui/Card";
import WebsiteSelect from "@/components/dashboard/WebsiteSelect";

const TOGGLES = [
  { key: "autoAudits", dbKey: "auto_audits", label: "Automatic SEO audits" },
  { key: "autoRecommendations", dbKey: "auto_recommendations", label: "Automatic recommendations" },
  { key: "aiContentSuggestions", dbKey: "ai_content_suggestions", label: "AI content suggestions" },
  { key: "metadataOptimization", dbKey: "metadata_optimization", label: "Metadata optimization" },
  { key: "automaticPublishing", dbKey: "automatic_publishing", label: "Automatic publishing" },
  { key: "keywordMonitoring", dbKey: "keyword_monitoring", label: "Keyword monitoring" },
  { key: "weeklyReports", dbKey: "weekly_reports", label: "Weekly reports" },
];

const DEFAULT_SETTINGS = {
  frequency: "weekly",
  auto_audits: true,
  auto_recommendations: true,
  ai_content_suggestions: true,
  metadata_optimization: false,
  automatic_publishing: false,
  keyword_monitoring: true,
  weekly_reports: true,
};

export default function MonitoringSettings() {
  const [websiteId, setWebsiteId] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (id) => {
    if (!id) return;
    const res = await fetch(`/api/monitoring?websiteId=${id}`);
    const json = await res.json();
    if (json.success) setSettings(json.data ?? DEFAULT_SETTINGS);
  }, []);

  useEffect(() => {
    load(websiteId);
  }, [websiteId, load]);

  async function save(next) {
    setSettings(next);
    setSaving(true);
    await fetch("/api/monitoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        websiteId,
        frequency: next.frequency,
        autoAudits: next.auto_audits,
        autoRecommendations: next.auto_recommendations,
        aiContentSuggestions: next.ai_content_suggestions,
        metadataOptimization: next.metadata_optimization,
        automaticPublishing: next.automatic_publishing,
        keywordMonitoring: next.keyword_monitoring,
        weeklyReports: next.weekly_reports,
      }),
    });
    setSaving(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Monitoring</h1>
        <WebsiteSelect value={websiteId} onChange={setWebsiteId} />
      </div>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between border-b border-ash-100 pb-4">
          <div>
            <p className="text-sm font-medium text-ink">Check frequency</p>
            <p className="text-xs text-ash-500">How often SEO Autopilot re-audits this website.</p>
          </div>
          <select
            value={settings.frequency}
            onChange={(e) => save({ ...settings, frequency: e.target.value })}
            className="input w-auto"
            disabled={!websiteId}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="mt-4 divide-y divide-ash-100">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between py-3.5">
              <span className="text-sm text-ink">{t.label}</span>
              <button
                role="switch"
                aria-checked={settings[t.dbKey]}
                disabled={!websiteId || saving}
                onClick={() => save({ ...settings, [t.dbKey]: !settings[t.dbKey] })}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  settings[t.dbKey] ? "bg-signal-teal" : "bg-ash-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings[t.dbKey] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
