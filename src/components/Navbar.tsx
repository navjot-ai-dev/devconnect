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
        className="nav-link-3d"
        onClick={() => setMenuOpen(false)}
      >
        🏠 Home
      </Link>
      <Link
        href="/search"
        className="nav-link-3d"
        onClick={() => setMenuOpen(false)}
      >
        🔍 Search
      </Link>
      <Link
        href="/notifications"
        className="nav-link-3d relative"
        onClick={() => setMenuOpen(false)}
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span className="badge-3d ml-1.5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
      <Link
        href="/profile"
        className="nav-link-3d"
        onClick={() => setMenuOpen(false)}
      >
        👤 Profile
      </Link>
    </>
  );

  return (
    <nav className="navbar-3d">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/home" className="logo-3d text-xl sm:text-2xl">
          ⟨/⟩ DevConnect
        </Link>

        <div className="hidden items-center gap-1 md:flex">{links}</div>

        <button
          type="button"
          className="btn-3d-ghost md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕ Close" : "☰ Menu"}
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            background: "linear-gradient(180deg, oklch(0.11 0.025 265 / 95%), oklch(0.09 0.02 265 / 98%))",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid oklch(0.25 0.04 265 / 50%)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
          className="md:hidden"
        >
          {links}
        </div>
      )}
    </nav>
  );
}
