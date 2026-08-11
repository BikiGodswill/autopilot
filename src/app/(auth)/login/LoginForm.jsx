"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/ui/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { signInWithPassword } from "@/lib/auth/authActions";
import { validateEmail } from "@/lib/validation/schemas";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const justCreated = params.get("created") === "1";
  const next = params.get("next") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!validateEmail(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    const { error } = await signInWithPassword(form);
    setLoading(false);

    if (error) {
      setSubmitError("Incorrect email or password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your SEO Autopilot dashboard."
      footer={
        <>
          Don&rsquo;t have an account?{" "}
          <Link href="/signup" className="font-medium text-ink hover:underline">
            Start free
          </Link>
        </>
      }
    >
      {justCreated ? (
        <p className="mb-4 rounded-lg bg-signal-teal-soft px-3.5 py-2.5 text-sm text-signal-teal">
          Account created — log in to continue.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" autoComplete="email" />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className="input" autoComplete="current-password" />
        </FormField>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-medium text-ash-500 hover:text-ink">
            Forgot password?
          </Link>
        </div>

        {submitError ? <p className="text-sm text-signal-red">{submitError}</p> : null}

        <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}
