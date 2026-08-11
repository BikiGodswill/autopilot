"use client";

import { useRouter } from "next/navigation";
import { HiOutlineMenu, HiOutlineBell, HiOutlineLogout } from "react-icons/hi";
import { signOut } from "@/lib/auth/authActions";

export default function Topbar({ onMenuClick, userEmail }) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ash-200 bg-white/90 px-5 backdrop-blur-md">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink hover:bg-ash-100 lg:hidden"
        aria-label="Open menu"
      >
        <HiOutlineMenu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-ash-500 hover:bg-ash-100 hover:text-ink" aria-label="Notifications">
          <HiOutlineBell size={19} />
        </button>
        {userEmail ? (
          <span className="hidden text-sm text-ash-500 sm:inline">{userEmail}</span>
        ) : null}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ash-500 hover:bg-ash-100 hover:text-ink"
        >
          <HiOutlineLogout size={16} />
          Log out
        </button>
      </div>
    </header>
  );
}
