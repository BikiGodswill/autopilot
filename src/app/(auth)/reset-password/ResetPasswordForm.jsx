"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/ui/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { updatePassword } from "@/lib/auth/authActions";
import { validatePassword } from "@/lib/validation/schemas";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    const pwCheck = validatePassword(form.password);
    if (!pwCheck.valid) next.password = pwCheck.reason;
    if (form.confirm !== form.password) next.confirm = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    const { error } = await updatePassword(form.password);
    setLoading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="Redirecting you to login...">
        <div />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="New password" error={errors.password}>
          <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className="input" autoComplete="new-password" />
        </FormField>
        <FormField label="Confirm password" error={errors.confirm}>
          <input type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} className="input" autoComplete="new-password" />
        </FormField>

        {submitError ? <p className="text-sm text-signal-red">{submitError}</p> : null}

        <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full">
          {loading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
