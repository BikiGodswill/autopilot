"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSearch, HiOutlineCheckCircle } from "react-icons/hi";
import ScoreCircle from "@/components/seo/ScoreCircle";
import Button from "@/components/ui/Button";

const SCAN_STEPS = [
  "Checking website...",
  "Crawling pages...",
  "Checking metadata...",
  "Checking headings & links...",
  "Calculating SEO score...",
];

export default function WebsiteAnalyzer() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | scanning | done | error
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("scanning");
    setError("");
    setResult(null);
    setStepIndex(0);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, SCAN_STEPS.length - 1));
    }, 500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();

      // Keep the scan animation feeling substantial even on a fast response.
      await new Promise((r) => setTimeout(r, 1800));

      if (!json.success) {
        setError(json.error?.message || "Couldn't analyze that URL.");
        setStatus("error");
      } else {
        setResult(json.data);
        setStatus("done");
      }
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("error");
    } finally {
      clearInterval(stepTimer);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={handleAnalyze}
        className="flex flex-col gap-3 rounded-2xl border border-ash-200 bg-white p-2.5 shadow-card sm:flex-row"
      >
        <div className="flex flex-1 items-center gap-2.5 px-3">
          <HiOutlineSearch className="shrink-0 text-ash-400" size={18} />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ash-400 focus:outline-none"
            aria-label="Website URL"
          />
        </div>
        <Button
          type="submit"
          variant="accent"
          size="md"
          disabled={status === "scanning"}
          className="shrink-0"
        >
          {status === "scanning" ? "Analyzing..." : "Analyze Website"}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {status === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative mt-4 overflow-hidden rounded-2xl border border-ash-200 bg-white p-6 shadow-card"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-signal-teal/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px animate-scanline bg-gradient-to-r from-transparent via-signal-teal to-transparent" />
            <ul className="space-y-2.5">
              {SCAN_STEPS.map((step, i) => (
                <li
                  key={step}
                  className={`flex items-center gap-2.5 text-sm transition-colors ${
                    i <= stepIndex ? "text-ink" : "text-ash-300"
                  }`}
                >
                  <HiOutlineCheckCircle
                    className={i <= stepIndex ? "text-signal-teal" : "text-ash-300"}
                    size={16}
                  />
                  {step}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {status === "error" && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-signal-red"
          >
            {error}
          </motion.p>
        )}

        {status === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-5 rounded-2xl border border-ash-200 bg-white p-6 shadow-card"
          >
            <ScoreCircle score={result.overallScore} size={88} />
            <div>
              <p className="text-sm text-ash-500">
                {result.counts.total} issues found ·{" "}
                <span className="text-signal-red">{result.counts.high} high</span>,{" "}
                <span className="text-signal-amber">{result.counts.medium} medium</span>
              </p>
              <p className="mt-1 text-xs text-ash-400">Demo analysis · illustrative data</p>
              <Button href="/signup" variant="primary" size="sm" className="mt-3">
                Fix My SEO
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
