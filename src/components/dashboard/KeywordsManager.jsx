"use client";

import { useEffect, useState, useCallback } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import WebsiteSelect from "@/components/dashboard/WebsiteSelect";

const INTENT_TONE = { commercial: "teal", transactional: "teal", informational: "indigo", navigational: "neutral" };

export default function KeywordsManager() {
  const [websiteId, setWebsiteId] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async (id) => {
    if (!id) return;
    const res = await fetch(`/api/keywords?websiteId=${id}`);
    const json = await res.json();
    if (json.success) setKeywords(json.data);
  }, []);

  useEffect(() => {
    load(websiteId);
  }, [websiteId, load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newKeyword.trim() || !websiteId) return;
    setAdding(true);
    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId, keyword: newKeyword.trim() }),
    });
    const json = await res.json();
    setAdding(false);
    if (json.success) {
      setNewKeyword("");
      load(websiteId);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Keywords</h1>
        <WebsiteSelect value={websiteId} onChange={setWebsiteId} />
      </div>

      <Card className="mt-6 p-4">
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add a keyword to track..."
            className="input flex-1"
          />
          <Button type="submit" variant="primary" size="md" disabled={adding || !websiteId}>
            <HiOutlinePlus size={16} />
            Add
          </Button>
        </form>
      </Card>

      {keywords.length === 0 ? (
        <Card className="mt-4 p-8 text-center text-sm text-ash-500">
          No keywords tracked yet.
        </Card>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-ash-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-ash-200 bg-ash-50 text-left text-xs uppercase tracking-wide text-ash-400">
              <tr>
                <th className="px-4 py-3 font-medium">Keyword</th>
                <th className="px-4 py-3 font-medium">Intent</th>
                <th className="px-4 py-3 font-medium">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash-100">
              {keywords.map((kw) => (
                <tr key={kw.id}>
                  <td className="px-4 py-3 text-ink">{kw.keyword}</td>
                  <td className="px-4 py-3">
                    {kw.intent ? <Badge tone={INTENT_TONE[kw.intent] ?? "neutral"}>{kw.intent}</Badge> : <span className="text-ash-300">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-ash-500">
                    {kw.search_volume ?? "—"}
                    {kw.volume_is_estimated ? <span className="ml-1 text-xs text-ash-400">(est.)</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
