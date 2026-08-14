"use client";

import { useEffect, useState, useCallback } from "react";
import { HiOutlineCode, HiOutlineGlobeAlt, HiOutlinePencilAlt, HiOutlineX } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import WebsiteSelect from "@/components/dashboard/WebsiteSelect";

const PROVIDERS = [
  {
    id: "github",
    icon: HiOutlineCode,
    title: "GitHub",
    description: "SEO Autopilot opens a pull request for every fix — nothing merges without your review.",
  },
  {
    id: "wordpress",
    icon: HiOutlineGlobeAlt,
    title: "WordPress",
    description: "Update metadata directly via the WordPress REST API and your SEO plugin.",
  },
  {
    id: "manual",
    icon: HiOutlinePencilAlt,
    title: "Manual",
    description: "No connection — get ready-to-copy fixes for platforms without an integration.",
  },
];

export default function IntegrationsPanel() {
  const [websiteId, setWebsiteId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectingId, setConnectingId] = useState(null);

  const load = useCallback(async (id) => {
    if (!id) return;
    const res = await fetch(`/api/integrations?websiteId=${id}`);
    const json = await res.json();
    if (json.success) setConnections(json.data);
  }, []);

  useEffect(() => {
    load(websiteId);
  }, [websiteId, load]);

  async function handleConnect(provider) {
    setConnectingId(provider);
    await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteId, provider }),
    });
    setConnectingId(null);
    load(websiteId);
  }

  async function handleDisconnect(id) {
    await fetch(`/api/integrations/${id}`, { method: "DELETE" });
    load(websiteId);
  }

  function activeFor(provider) {
    return connections.find((c) => c.provider === provider && c.status === "connected");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Integrations</h1>
        <WebsiteSelect value={websiteId} onChange={setWebsiteId} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PROVIDERS.map(({ id, icon: Icon, title, description }) => {
          const active = activeFor(id);
          return (
            <Card key={id} className="flex flex-col p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-indigo-soft">
                <Icon className="text-signal-indigo" size={20} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ash-500">{description}</p>

              {active ? (
                <div className="mt-4 flex items-center justify-between">
                  <Badge tone="teal">Connected</Badge>
                  <button
                    onClick={() => handleDisconnect(active.id)}
                    className="flex items-center gap-1 text-xs font-medium text-ash-400 hover:text-signal-red"
                  >
                    <HiOutlineX size={13} />
                    Disconnect
                  </button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  disabled={!websiteId || connectingId === id}
                  onClick={() => handleConnect(id)}
                >
                  {connectingId === id ? "Connecting..." : "Connect"}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
