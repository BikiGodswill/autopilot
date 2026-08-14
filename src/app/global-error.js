"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Logo from "@/components/marketing/Logo";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // In production, wire this to your error-tracking service
    // (Sentry, etc) instead of console.error.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
          <Logo className="mb-10" />
          <h1 className="font-display text-2xl font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-sm text-ash-500">
            An unexpected error occurred. Try again, or head back to the homepage.
          </p>
          <div className="mt-8 flex gap-3">
            <Button onClick={reset} variant="primary" size="md">
              Try again
            </Button>
            <a
              href="/"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-ash-500 hover:text-ink"
            >
              Back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
