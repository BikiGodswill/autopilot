"use client";

import Link from "next/link";
import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { MARKETING_NAV } from "@/constants";
import Button from "@/components/ui/Button";
import Logo from "@/components/marketing/Logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ash-200/70 bg-canvas/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ash-600 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            href="/login"
            variant="ghost"
            size="sm"
            className="hover:bg-ink hover:text-white border border-ink"
          >
            Log in
          </Button>
          <Button href="/signup" variant="primary" size="sm">
            Start Free
          </Button>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-ink hover:bg-ash-100 md:hidden"
        >
          {open ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-ash-200 bg-canvas px-6 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {MARKETING_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ash-600 hover:bg-ash-100 hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              href="/login"
              variant="outline"
              size="md"
              className="w-full"
            >
              Log in
            </Button>
            <Button
              href="/signup"
              variant="primary"
              size="md"
              className="w-full"
            >
              Start Free
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
