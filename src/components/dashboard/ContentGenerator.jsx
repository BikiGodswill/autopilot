"use client";

import { useEffect, useState, useCallback } from "react";
import { HiOutlineSparkles, HiOutlineSave } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Badge from "@/components/ui/Badge";
import WebsiteSelect from "@/components/dashboard/WebsiteSelect";

const CONTENT_TYPES = ["blog_post", "landing_page", "product_description", "faq"];
const INTENTS = ["informational", "navigational", "commercial", "transactional"];

export default function ContentGenerator() {
  const [websiteId, setWebsiteId] = useState(null);
  const [form, setForm] = useState({ targetKeyword: "", contentType: "blog_post", searchIntent: "commercial", tone: "professional", wordCount: 1200 });
  const [generated, setGenerated] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDrafts = useCallback(async (id) => {
    if (!id) return;
    const res = await fetch(`/api/content/projects?websiteId=${id}`);
    const json = await res.json();
    if (json.success) setDrafts(json.data);
  }, []);

  useEffect(() => {
    loadDrafts(websiteId);
  }, [websiteId, loadDrafts]);

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setGenerating(true);
    const res = await fetch("/api/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setGenerating(false);

    if (!json.success) {
      setError(json.error?.message || "Generation failed.");
      return;
    }
    setGenerated({ ...json.data, targetKeyword: form.targetKeyword });
  }

  async function handleSaveDraft() {
    if (!generated || !websiteId) return;
    setSaving(true);
    const res = await fetch("/api/content/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId, generated }),
    });
    const json = await res.json();
    setSaving(false);

    if (json.success) {
      setGenerated(null);
      loadDrafts(websiteId);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">AI Content</h1>
        <WebsiteSelect value={websiteId} onChange={setWebsiteId} />
      </div>

      <Card className="mt-6 p-6">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Target keyword">
            <input
              type="text"
              required
              value={form.targetKeyword}
              onChange={(e) => setForm((f) => ({ ...f, targetKeyword: e.target.value }))}
              className="input"
              placeholder="web development company in Cameroon"
            />
          </FormField>
          <FormField label="Content type">
            <select
              value={form.contentType}
              onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))}
              className="input"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace("_", " ")}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Search intent">
            <select
              value={form.searchIntent}
              onChange={(e) => setForm((f) => ({ ...f, searchIntent: e.target.value }))}
              className="input"
            >
              {INTENTS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Target length (words)">
            <input
              type="number"
              min={200}
              max={5000}
              value={form.wordCount}
              onChange={(e) => setForm((f) => ({ ...f, wordCount: Number(e.target.value) }))}
              className="input"
            />
          </FormField>
          <Button type="submit" variant="accent" size="md" disabled={generating} className="md:col-span-2">
            <HiOutlineSparkles size={16} />
            {generating ? "Generating..." : "Generate Content"}
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm text-signal-red">{error}</p> : null}
      </Card>

      {generated ? (
        <Card className="mt-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone="amber">Demo output</Badge>
              <h2 className="mt-2 font-display text-lg font-semibold text-ink">{generated.h1}</h2>
              <p className="mt-1 text-sm text-ash-500">{generated.metaDescription}</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleSaveDraft} disabled={saving || !websiteId}>
              <HiOutlineSave size={15} />
              {saving ? "Saving..." : "Save Draft"}
            </Button>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ash-600">{generated.introduction}</p>
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ash-400">Outline</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ash-600">
              {generated.outline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Card>
      ) : null}

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">Drafts</h2>
      {drafts.length === 0 ? (
        <Card className="mt-4 p-8 text-center text-sm text-ash-500">No drafts saved yet.</Card>
      ) : (
        <div className="mt-4 space-y-3">
          {drafts.map((draft) => (
            <Card key={draft.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-ink">{draft.name}</p>
                <p className="text-xs text-ash-400">{draft.content_type} · {draft.status}</p>
              </div>
              <Badge tone="neutral">{draft.content_documents?.[0]?.word_count ?? 0} words</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
