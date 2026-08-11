"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/ui/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { sendPasswordReset } from "@/lib/auth/authActions";
import { validateEmail } from "@/lib/validation/schemas";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    await sendPasswordReset(email);
    setLoading(false);
    // Always show success, whether or not the email exists — avoids
    // leaking which addresses have accounts.
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your email" subtitle={`If an account exists for ${email}, a reset link is on its way.`}>
        <Link href="/login" className="text-sm font-medium text-ink hover:underline">
          Back to login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="We'll send you a link to reset it."
      footer={
        <Link href="/login" className="font-medium text-ink hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Email" error={error}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" autoComplete="email" />
        </FormField>
        <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
