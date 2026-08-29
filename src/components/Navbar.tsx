
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchUnreadCount() {
    try {
      const response = await fetch(
        "/api/notifications",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(
        "GET UNREAD COUNT ERROR:",
        error
      );
    }
  }

  useEffect(() => {
    fetchUnreadCount();

    // Refresh notification count every 10 seconds
    const interval = setInterval(
      fetchUnreadCount,
      10000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* LOGO */}

        <Link
          href="/home"
          className="text-xl font-bold"
        >
          🚀 DevConnect
        </Link>

        {/* NAVIGATION */}

        <div className="flex items-center gap-5">

          <Link
            href="/home"
            className="font-medium hover:text-blue-600"
          >
            🏠 Home
          </Link>

          <Link
            href="/search"
            className="font-medium hover:text-blue-600"
          >
            🔎 Search
          </Link>

          {/* NOTIFICATIONS */}

          <Link
            href="/notifications"
            className="relative font-medium hover:text-blue-600"
          >
            🔔 Notifications

            {unreadCount > 0 && (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </Link>

          {/* PROFILE */}

          <Link
            href="/profile"
            className="font-medium hover:text-blue-600"
          >
            👤 Profile
          </Link>

        </div>
      </div>
    </nav>
  );
}

