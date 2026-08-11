import Link from "next/link";
import Logo from "@/components/marketing/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "How It Works", href: "/#how-it-works" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/resources" },
      { label: "Guides", href: "/resources" },
      { label: "Changelog", href: "/resources" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ash-200 bg-white">
      <div className="container-page grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
        <div className="col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash-500">
            AI-powered SEO analysis, content, optimization, and monitoring —
            all in one place.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-medium text-ink">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ash-500 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ash-200 py-6">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-xs text-ash-400 md:flex-row">
          <p>© {new Date().getFullYear()} SEO Autopilot. All rights reserved.</p>
          <p>Built for websites that want to be found.</p>
        </div>
      </div>
    </footer>
  );
}
