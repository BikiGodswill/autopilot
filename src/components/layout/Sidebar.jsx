"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineViewGrid,
  HiOutlineGlobeAlt,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineLightBulb,
  HiOutlineChartBar,
  HiOutlineDocumentReport,
  HiOutlinePuzzle,
  HiOutlineCog,
  HiOutlineCreditCard,
} from "react-icons/hi";
import { DASHBOARD_NAV, DASHBOARD_NAV_BOTTOM } from "@/constants";
import Logo from "@/components/marketing/Logo";

const ICONS = {
  grid: HiOutlineViewGrid,
  globe: HiOutlineGlobeAlt,
  search: HiOutlineSearch,
  sparkles: HiOutlineSparkles,
  target: HiOutlineTag,
  lightbulb: HiOutlineLightBulb,
  activity: HiOutlineChartBar,
  file: HiOutlineDocumentReport,
  plug: HiOutlinePuzzle,
  settings: HiOutlineCog,
  card: HiOutlineCreditCard,
};

function NavLink({ item }) {
  const pathname = usePathname();
  const Icon = ICONS[item.icon];
  const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active ? "bg-ash-100 text-ink" : "text-ash-500 hover:bg-ash-50 hover:text-ink"
      }`}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-ink/20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ash-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {DASHBOARD_NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="space-y-1 border-t border-ash-200 px-3 py-3">
          {DASHBOARD_NAV_BOTTOM.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </aside>
    </>
  );
}
