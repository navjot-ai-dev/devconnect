"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { parseResponseJson } from "@/lib/http";

export default function Navbar() {
  const { data: session } = authClient.useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  async function fetchUnreadCount() {
    if (!session) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const data = await parseResponseJson(response);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("GET UNREAD COUNT ERROR:", error);
    }
  }

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [session]);

  const links = (
    <>
      <Link
        href="/home"
        className="font-medium hover:text-blue-600"
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/search"
        className="font-medium hover:text-blue-600"
        onClick={() => setMenuOpen(false)}
      >
        Search
      </Link>
      <Link
        href="/notifications"
        className="relative font-medium hover:text-blue-600"
        onClick={() => setMenuOpen(false)}
      >
        Notifications
        {unreadCount > 0 && (
          <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
      <Link
        href="/profile"
        className="font-medium hover:text-blue-600"
        onClick={() => setMenuOpen(false)}
      >
        Profile
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/home" className="text-lg font-bold sm:text-xl">
          DevConnect
        </Link>

        <div className="hidden items-center gap-5 md:flex">{links}</div>

        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-t px-4 py-4 md:hidden">
          {links}
        </div>
      )}
    </nav>
  );
}
