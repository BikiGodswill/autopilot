"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineBell } from "react-icons/hi";

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  async function load() {
    const res = await fetch("/api/notifications");
    const json = await res.json();
    if (json.success) setNotifications(json.data);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    setOpen((v) => !v);
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    load();
  }

  async function markOneRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-ash-500 hover:bg-ash-100 hover:text-ink"
        aria-label="Notifications"
      >
        <HiOutlineBell size={19} />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-signal-red" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-2xl border border-ash-200 bg-white shadow-card-hover">
          <div className="flex items-center justify-between border-b border-ash-100 px-4 py-3">
            <p className="text-sm font-medium text-ink">Notifications</p>
            {unreadCount > 0 ? (
              <button onClick={markAllRead} className="text-xs font-medium text-ash-400 hover:text-ink">
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ash-400">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markOneRead(n.id)}
                  className={`block w-full border-b border-ash-50 px-4 py-3 text-left last:border-0 hover:bg-ash-50 ${
                    n.read ? "" : "bg-signal-teal-soft/40"
                  }`}
                >
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  {n.body ? <p className="mt-0.5 text-xs text-ash-500">{n.body}</p> : null}
                  <p className="mt-1 text-[11px] text-ash-400">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
