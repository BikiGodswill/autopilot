import Link from "next/link";
import Button from "@/components/ui/Button";
import Logo from "@/components/marketing/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo className="mb-10" />
      <p className="font-mono text-sm text-ash-400">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ash-500">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/" variant="primary" size="md">
          Back home
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-ash-500 hover:text-ink"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
