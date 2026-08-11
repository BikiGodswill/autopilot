"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/ui/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { signUpWithPassword } from "@/lib/auth/authActions";
import { validateEmail, validatePassword, validateRequiredString } from "@/lib/validation/schemas";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    const nameCheck = validateRequiredString(form.name, "Name", { max: 120 });
    if (!nameCheck.valid) next.name = nameCheck.reason;
    if (!validateEmail(form.email)) next.email = "Enter a valid email address.";
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
    const { error } = await signUpWithPassword({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }
    router.push("/login?created=1");
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start free — no credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Name" error={errors.name}>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className="input" autoComplete="name" />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" autoComplete="email" />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} className="input" autoComplete="new-password" />
        </FormField>
        <FormField label="Confirm password" error={errors.confirm}>
          <input type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} className="input" autoComplete="new-password" />
        </FormField>

        {submitError ? <p className="text-sm text-signal-red">{submitError}</p> : null}

        <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
