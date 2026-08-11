"use client";

import { useEffect, useState, useCallback } from "react";
import { HiOutlinePlay, HiOutlineExternalLink } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ScoreCircle from "@/components/seo/ScoreCircle";
import { SEVERITY } from "@/constants";

const SEVERITY_TONE = { critical: "red", high: "red", medium: "amber", low: "neutral", info: "neutral" };

export default function WebsiteDetail({ websiteId }) {
  const [website, setWebsite] = useState(null);
  const [issues, setIssues] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [siteRes, issuesRes] = await Promise.all([
      fetch(`/api/websites/${websiteId}`),
      fetch(`/api/websites/${websiteId}/issues`),
    ]);
    const siteJson = await siteRes.json();
    const issuesJson = await issuesRes.json();
    if (siteJson.success) setWebsite(siteJson.data);
    if (issuesJson.success) setIssues(issuesJson.data);
  }, [websiteId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRunAudit() {
    setRunning(true);
    setError("");
    const res = await fetch(`/api/websites/${websiteId}/audit`, { method: "POST" });
    const json = await res.json();
    setRunning(false);

    if (!json.success) {
      setError(json.error?.message || "Audit failed.");
      return;
    }
    load();
  }

  if (!website) {
    return <p className="text-sm text-ash-400">Loading...</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{website.name}</h1>
          <a
            href={website.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center gap-1 text-sm text-ash-500 hover:text-ink"
          >
            {website.url} <HiOutlineExternalLink size={14} />
          </a>
        </div>
        <Button variant="primary" size="md" onClick={handleRunAudit} disabled={running}>
          <HiOutlinePlay size={16} />
          {running ? "Running audit..." : "Run Audit"}
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-signal-red">{error}</p> : null}

      <Card className="mt-6 flex items-center gap-6 p-6">
        <ScoreCircle score={website.seo_score ?? 0} size={96} label="SEO Score" />
        <div className="text-sm text-ash-500">
          {website.last_audit_at ? (
            <p>Last audited {new Date(website.last_audit_at).toLocaleString()}</p>
          ) : (
            <p>No audits run yet — click &ldquo;Run Audit&rdquo; to get a score.</p>
          )}
        </div>
      </Card>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">Issues</h2>
      {issues.length === 0 ? (
        <Card className="mt-4 p-8 text-center text-sm text-ash-500">
          No issues recorded yet.
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {issues.map((issue) => (
            <Card key={issue.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={SEVERITY_TONE[issue.severity]}>{SEVERITY[issue.severity]?.label ?? issue.severity}</Badge>
                  <span className="text-xs uppercase tracking-wide text-ash-400">{issue.category}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-ink">{issue.title}</p>
                {issue.impact ? <p className="mt-0.5 text-xs text-ash-500">{issue.impact}</p> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
