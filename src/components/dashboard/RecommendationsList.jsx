"use client";

import { useEffect, useState, useCallback } from "react";
import { HiOutlineCheck } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import WebsiteSelect from "@/components/dashboard/WebsiteSelect";

const IMPACT_TONE = { high: "teal", medium: "amber", low: "neutral" };

export default function RecommendationsList() {
  const [websiteId, setWebsiteId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applyingId, setApplyingId] = useState(null);

  const load = useCallback(async (id) => {
    if (!id) return;
    const res = await fetch(`/api/recommendations?websiteId=${id}`);
    const json = await res.json();
    if (json.success) setRecommendations(json.data);
  }, []);

  useEffect(() => {
    load(websiteId);
  }, [websiteId, load]);

  async function handleApply(id) {
    setApplyingId(id);
    const res = await fetch(`/api/recommendations/${id}/apply`, { method: "POST" });
    const json = await res.json();
    setApplyingId(null);
    if (json.success) load(websiteId);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Recommendations</h1>
        <WebsiteSelect value={websiteId} onChange={setWebsiteId} />
      </div>

      {recommendations.length === 0 ? (
        <Card className="mt-6 p-8 text-center text-sm text-ash-500">
          No recommendations yet — run an audit on this website to generate some.
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="flex items-start justify-between gap-4 p-5">
              <div>
                <div className="flex items-center gap-2">
                  {rec.impact ? <Badge tone={IMPACT_TONE[rec.impact]}>{rec.impact} impact</Badge> : null}
                  {rec.effort ? <span className="text-xs text-ash-400">{rec.effort} effort</span> : null}
                  {rec.status === "applied" ? <Badge tone="teal">Applied</Badge> : null}
                </div>
                <p className="mt-1.5 text-sm font-medium text-ink">{rec.title}</p>
                {rec.description ? <p className="mt-0.5 text-xs text-ash-500">{rec.description}</p> : null}
              </div>
              {rec.status !== "applied" ? (
                <Button variant="outline" size="sm" onClick={() => handleApply(rec.id)} disabled={applyingId === rec.id}>
                  <HiOutlineCheck size={15} />
                  {applyingId === rec.id ? "Applying..." : "Apply"}
                </Button>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
