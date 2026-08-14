"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

const TOGGLE_FIELDS = [
  { key: "email_notifications", label: "Email notifications" },
  { key: "seo_alert_notifications", label: "SEO alerts" },
  { key: "content_alert_notifications", label: "Content alerts" },
];

export default function SettingsForm() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProfile(json.data);
      });
  }, []);

  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: profile.full_name,
        defaultCountry: profile.default_country,
        defaultLanguage: profile.default_language,
        brandVoice: profile.brand_voice,
        aiTone: profile.ai_tone,
        aiDefaultLength: profile.ai_default_length,
        emailNotifications: profile.email_notifications,
        seoAlertNotifications: profile.seo_alert_notifications,
        contentAlertNotifications: profile.content_alert_notifications,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.success) setSaved(true);
  }

  if (!profile) {
    return <p className="text-sm text-ash-400">Loading...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-base font-semibold text-ink">Profile</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full name">
              <input
                type="text"
                value={profile.full_name ?? ""}
                onChange={(e) => update("full_name", e.target.value)}
                className="input"
              />
            </FormField>
            <FormField label="Default country">
              <input
                type="text"
                value={profile.default_country ?? ""}
                onChange={(e) => update("default_country", e.target.value)}
                className="input"
                placeholder="Cameroon"
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-base font-semibold text-ink">AI preferences</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Writing tone">
              <select
                value={profile.ai_tone ?? "professional"}
                onChange={(e) => update("ai_tone", e.target.value)}
                className="input"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="casual">Casual</option>
              </select>
            </FormField>
            <FormField label="Default content length (words)">
              <input
                type="number"
                min={200}
                max={5000}
                value={profile.ai_default_length ?? 1000}
                onChange={(e) => update("ai_default_length", Number(e.target.value))}
                className="input"
              />
            </FormField>
            <FormField label="Brand voice notes">
              <input
                type="text"
                value={profile.brand_voice ?? ""}
                onChange={(e) => update("brand_voice", e.target.value)}
                className="input"
                placeholder="e.g. clear, direct, no jargon"
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-base font-semibold text-ink">Notifications</h2>
          <div className="mt-4 divide-y divide-ash-100">
            {TOGGLE_FIELDS.map((t) => (
              <div key={t.key} className="flex items-center justify-between py-3">
                <span className="text-sm text-ink">{t.label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={profile[t.key]}
                  onClick={() => update(t.key, !profile[t.key])}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    profile[t.key] ? "bg-signal-teal" : "bg-ash-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      profile[t.key] ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          {saved ? <span className="text-sm text-signal-teal">Saved</span> : null}
        </div>
      </form>
    </div>
  );
}
