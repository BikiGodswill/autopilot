"use client";

import { useEffect, useState, useCallback } from "react";
import { HiOutlineDocumentReport, HiOutlinePlus } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import WebsiteSelect from "@/components/dashboard/WebsiteSelect";

export default function ReportsList() {
  const [websiteId, setWebsiteId] = useState(null);
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async (id) => {
    if (!id) return;
    const res = await fetch(`/api/reports?websiteId=${id}`);
    const json = await res.json();
    if (json.success) setReports(json.data);
  }, []);

  useEffect(() => {
    load(websiteId);
  }, [websiteId, load]);

  async function handleGenerate() {
    if (!websiteId) return;
    setGenerating(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId }),
    });
    const json = await res.json();
    setGenerating(false);
    if (json.success) load(websiteId);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
        <div className="flex items-center gap-3">
          <WebsiteSelect value={websiteId} onChange={setWebsiteId} />
          <Button variant="primary" size="sm" onClick={handleGenerate} disabled={!websiteId || generating}>
            <HiOutlinePlus size={15} />
            {generating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-sm text-ash-500">
          No reports yet — generate one from the latest audit.
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal-teal-soft">
                <HiOutlineDocumentReport className="text-signal-teal" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{report.title}</p>
                <p className="text-xs text-ash-400">
                  {report.summary?.openIssueCount ?? 0} open issues ·{" "}
                  {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
