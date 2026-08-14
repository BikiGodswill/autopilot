"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-ash-500">
        An unexpected error occurred loading this page.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset} variant="primary" size="md">
          Try again
        </Button>
        <a href="/" className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-ash-500 hover:text-ink">
          Back home
        </a>
      </div>
    </div>
  );
}
