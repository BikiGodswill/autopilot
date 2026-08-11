"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlinePlus, HiOutlineExternalLink } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import ScoreCircle from "@/components/seo/ScoreCircle";
import Badge from "@/components/ui/Badge";

export default function WebsitesList() {
  const [websites, setWebsites] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", url: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadWebsites() {
    const res = await fetch("/api/websites");
    const json = await res.json();
    if (json.success) setWebsites(json.data);
  }

  useEffect(() => {
    loadWebsites();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!json.success) {
      setError(json.error?.message || "Couldn't add that website.");
      return;
    }

    setForm({ name: "", url: "" });
    setShowForm(false);
    loadWebsites();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Websites</h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          <HiOutlinePlus size={16} />
          Add website
        </Button>
      </div>

      {showForm ? (
        <Card className="mt-5 p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <FormField label="Website name">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
                placeholder="My Business"
              />
            </FormField>
            <FormField label="URL">
              <input
                type="text"
                required
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="input"
                placeholder="https://example.com"
              />
            </FormField>
            <Button type="submit" variant="primary" size="md" disabled={submitting}>
              {submitting ? "Adding..." : "Add"}
            </Button>
          </form>
          {error ? <p className="mt-3 text-sm text-signal-red">{error}</p> : null}
        </Card>
      ) : null}

      {websites === null ? (
        <p className="mt-8 text-sm text-ash-400">Loading...</p>
      ) : websites.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center gap-2 p-12 text-center">
          <p className="font-medium text-ink">No websites yet</p>
          <p className="text-sm text-ash-500">Add your first website to run an SEO audit.</p>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {websites.map((site) => (
            <Link key={site.id} href={`/dashboard/websites/${site.id}`}>
              <Card hover className="flex items-center gap-4 p-5">
                <ScoreCircle score={site.seo_score ?? 0} size={60} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{site.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-ash-400">
                    {site.url} <HiOutlineExternalLink size={12} />
                  </p>
                  <Badge tone={site.status === "active" ? "teal" : "neutral"} className="mt-2">
                    {site.status}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
