"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from "react-icons/hi";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15; // ~1 minute of polling before we stop and let the user refresh manually

export default function BillingStatusBanner() {
  const router = useRouter();
  const [pending, setPending] = useState(null); // { trans_id, plan, status } | null | undefined(loading)
  const [pollCount, setPollCount] = useState(0);

  const checkPending = useCallback(async () => {
    const res = await fetch("/api/billing/pending");
    const json = await res.json();
    if (json.success) setPending(json.data);
  }, []);

  useEffect(() => {
    checkPending();
  }, [checkPending]);

  useEffect(() => {
    if (!pending || pending.status !== "CREATED" || pollCount >= MAX_POLLS) return;

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/billing/status/${pending.trans_id}`);
      const json = await res.json();
      if (json.success) {
        setPending(json.data);
        if (json.data.status === "SUCCESSFUL") {
          router.refresh(); // re-fetch the server-rendered plan/usage below
        }
      }
      setPollCount((c) => c + 1);
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [pending, pollCount, router]);

  if (!pending) return null;

  if (pending.status === "CREATED") {
    return (
      <Banner
        icon={<HiOutlineClock className="text-signal-amber" size={18} />}
        tone="amber"
        message="Waiting for your Mobile Money confirmation — this updates automatically once you approve it on your phone."
      />
    );
  }

  if (pending.status === "SUCCESSFUL") {
    return (
      <Banner
        icon={<HiOutlineCheckCircle className="text-signal-teal" size={18} />}
        tone="teal"
        message="Payment confirmed — your plan has been upgraded."
      />
    );
  }

  if (pending.status === "FAILED" || pending.status === "EXPIRED") {
    return (
      <Banner
        icon={<HiOutlineXCircle className="text-signal-red" size={18} />}
        tone="red"
        message={
          pending.status === "EXPIRED"
            ? "That payment link expired before completion. Try again below."
            : "That payment attempt failed. Try again below."
        }
      />
    );
  }

  return null;
}

const TONE_CLASSES = {
  amber: "bg-amber-50 border-amber-200",
  teal: "bg-signal-teal-soft border-signal-teal/30",
  red: "bg-red-50 border-red-200",
};

function Banner({ icon, tone, message }) {
  return (
    <div className={`mb-6 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm text-ink ${TONE_CLASSES[tone]}`}>
      {icon}
      {message}
    </div>
  );
}
