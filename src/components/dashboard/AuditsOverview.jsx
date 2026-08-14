"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { HiOutlinePlay, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import WebsiteSelect from "@/components/dashboard/WebsiteSelect";

const STATUS_CONFIG = {
  completed: { icon: HiOutlineCheckCircle, tone: "teal", label: "Completed" },
  running: { icon: HiOutlineClock, tone: "amber", label: "Running" },
  queued: { icon: HiOutlineClock, tone: "amber", label: "Queued" },
  failed: { icon: HiOutlineXCircle, tone: "red", label: "Failed" },
};

export default function AuditsOverview() {
  const [websiteId, setWebsiteId] = useState(null);
  const [audits, setAudits] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (id) => {
    if (!id) return;
    const res = await fetch(`/api/websites/${id}/audits`);
    const json = await res.json();
    if (json.success) setAudits(json.data);
  }, []);

  useEffect(() => {
    load(websiteId);
  }, [websiteId, load]);

  async function handleRunAudit() {
    if (!websiteId) return;
    setRunning(true);
    setError("");
    const res = await fetch(`/api/websites/${websiteId}/audit`, { method: "POST" });
    const json = await res.json();
    setRunning(false);

    if (!json.success) {
      setError(json.error?.message || "Audit failed.");
      return;
    }
    load(websiteId);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">SEO Audits</h1>
        <div className="flex items-center gap-3">
          <WebsiteSelect value={websiteId} onChange={setWebsiteId} />
          <Button variant="primary" size="sm" onClick={handleRunAudit} disabled={!websiteId || running}>
            <HiOutlinePlay size={15} />
            {running ? "Running..." : "Run Audit"}
          </Button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-signal-red">{error}</p> : null}

      {!websiteId ? null : audits.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-sm text-ash-500">
          No audits yet for this website — click &ldquo;Run Audit&rdquo; to analyze it.
        </Card>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ash-200 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-ash-200 bg-ash-50 text-left text-xs uppercase tracking-wide text-ash-400">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Technical</th>
                <th className="px-4 py-3 font-medium">On-Page</th>
                <th className="px-4 py-3 font-medium">Content</th>
                <th className="px-4 py-3 font-medium">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash-100">
              {audits.map((audit) => {
                const config = STATUS_CONFIG[audit.status] ?? STATUS_CONFIG.queued;
                const Icon = config.icon;
                return (
                  <tr key={audit.id}>
                    <td className="px-4 py-3 text-ash-600">
                      {new Date(audit.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={config.tone}>
                        <Icon size={12} />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-ink">
                      {audit.overall_score ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-ash-500">{audit.technical_score ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-ash-500">{audit.on_page_score ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-ash-500">{audit.content_score ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-ash-500">{audit.performance_score ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {websiteId ? (
        <p className="mt-4 text-sm text-ash-500">
          <Link href={`/dashboard/websites/${websiteId}`} className="font-medium text-ink hover:underline">
            View full issue list for this website →
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-sm text-ash-500">Select a website above to see its audit history.</p>
      )}
    </div>
  );
}
