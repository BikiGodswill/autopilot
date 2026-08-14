"use client";

import { useEffect, useState } from "react";

/**
 * Fetches the user's websites and renders a <select>. Pages that need a
 * websiteId (content, keywords, recommendations, monitoring, reports)
 * all share this instead of duplicating the fetch + dropdown markup.
 */
export default function WebsiteSelect({ value, onChange }) {
  const [websites, setWebsites] = useState(null);

  useEffect(() => {
    fetch("/api/websites")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setWebsites(json.data);
          if (!value && json.data.length > 0) onChange(json.data[0].id);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (websites === null) {
    return <p className="text-sm text-ash-400">Loading websites...</p>;
  }

  if (websites.length === 0) {
    return (
      <p className="text-sm text-ash-500">
        Add a website under{" "}
        <a href="/dashboard/websites" className="font-medium text-ink hover:underline">
          Websites
        </a>{" "}
        first.
      </p>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="input w-auto min-w-[220px]"
    >
      {websites.map((site) => (
        <option key={site.id} value={site.id}>
          {site.name}
        </option>
      ))}
    </select>
  );
}
