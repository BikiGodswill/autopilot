"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineCheckCircle } from "react-icons/hi";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Logo from "@/components/marketing/Logo";

const BUSINESS_TYPES = ["SaaS", "E-commerce", "Blog", "Agency", "Local business", "Portfolio", "Education", "Other"];

const SCAN_STEPS = ["Connecting...", "Crawling...", "Analyzing pages...", "Checking metadata...", "Generating recommendations..."];

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ website: "", businessType: "SaaS", goals: "" });
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [websiteId, setWebsiteId] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFinish() {
    setStep(5);
    setError("");

    const createRes = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.website, url: form.website, industry: form.businessType }),
    });
    const createJson = await createRes.json();

    if (!createJson.success) {
      setError(createJson.error?.message || "Couldn't set up your website.");
      setStep(2);
      return;
    }

    setWebsiteId(createJson.data.id);

    const stepTimer = setInterval(() => {
      setScanStepIndex((i) => Math.min(i + 1, SCAN_STEPS.length - 1));
    }, 500);

    await fetch(`/api/websites/${createJson.data.id}/audit`, { method: "POST" });
    await new Promise((r) => setTimeout(r, SCAN_STEPS.length * 500 + 300));
    clearInterval(stepTimer);

    router.push(`/dashboard/websites/${createJson.data.id}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-canvas px-6 py-12">
      <Logo className="mb-10" />
      <div className="w-full max-w-md">
        <StepIndicator step={step} />

        <Card className="mt-6 p-7">
          {step === 1 ? (
            <StepShell title="What's your website?" subtitle="We'll run your first SEO analysis on it.">
              <FormField label="Website URL">
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  className="input"
                  placeholder="https://example.com"
                />
              </FormField>
              <Button variant="primary" size="md" className="mt-6 w-full" onClick={() => setStep(2)} disabled={!form.website.trim()}>
                Continue
              </Button>
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell title="What best describes your business?">
              <div className="grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => update("businessType", type)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      form.businessType === type ? "border-ink bg-ash-100 text-ink" : "border-ash-200 text-ash-600 hover:border-ash-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {error ? <p className="mt-3 text-sm text-signal-red">{error}</p> : null}
              <Button variant="primary" size="md" className="mt-6 w-full" onClick={() => setStep(3)}>
                Continue
              </Button>
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell title="What are your SEO goals?" subtitle="Optional — helps tailor recommendations.">
              <FormField label="Goals">
                <textarea
                  rows={4}
                  value={form.goals}
                  onChange={(e) => update("goals", e.target.value)}
                  className="input resize-none"
                  placeholder="e.g. rank for local search terms, grow blog traffic..."
                />
              </FormField>
              <Button variant="primary" size="md" className="mt-6 w-full" onClick={() => setStep(4)}>
                Continue
              </Button>
            </StepShell>
          ) : null}

          {step === 4 ? (
            <StepShell title="Ready to analyze your website" subtitle={form.website}>
              <p className="text-sm text-ash-500">
                We&rsquo;ll run a full SEO audit and set up your dashboard.
              </p>
              <Button variant="accent" size="md" className="mt-6 w-full" onClick={handleFinish}>
                Start first audit
              </Button>
            </StepShell>
          ) : null}

          {step === 5 ? (
            <StepShell title="Analyzing your website">
              <ul className="space-y-2.5">
                {SCAN_STEPS.map((label, i) => (
                  <li key={label} className={`flex items-center gap-2.5 text-sm ${i <= scanStepIndex ? "text-ink" : "text-ash-300"}`}>
                    <HiOutlineCheckCircle className={i <= scanStepIndex ? "text-signal-teal" : "text-ash-300"} size={16} />
                    {label}
                  </li>
                ))}
              </ul>
              {error ? <p className="mt-3 text-sm text-signal-red">{error}</p> : null}
            </StepShell>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div>
      <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-ash-500">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function StepIndicator({ step }) {
  return (
    <div className="flex justify-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-1.5 w-8 rounded-full ${n <= step ? "bg-ink" : "bg-ash-200"}`} />
      ))}
    </div>
  );
}
