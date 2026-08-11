"use client";

import { useState } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { validateEmail, validateRequiredString } from "@/lib/validation/schemas";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | sent

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    const nameCheck = validateRequiredString(form.name, "Name");
    if (!nameCheck.valid) next.name = nameCheck.reason;
    if (!validateEmail(form.email)) next.email = "Enter a valid email address.";
    const messageCheck = validateRequiredString(form.message, "Message", { max: 2000 });
    if (!messageCheck.valid) next.message = messageCheck.reason;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    // Wired to a real endpoint once contact-notification service exists.
    await new Promise((r) => setTimeout(r, 700));
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-ash-200 bg-white p-8 text-center shadow-card">
        <HiOutlineCheckCircle className="text-signal-teal" size={32} />
        <p className="font-medium text-ink">Message sent</p>
        <p className="text-sm text-ash-500">We&rsquo;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField label="Name" error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="input"
        />
      </FormField>

      <FormField label="Email" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="input"
        />
      </FormField>

      <FormField label="Message" error={errors.message}>
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="input resize-none"
        />
      </FormField>

      <Button type="submit" variant="primary" size="md" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
