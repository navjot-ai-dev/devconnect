"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CurrentUser = {
  name: string;
  username: string | null;
  image: string | null;
};

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const response = await fetch("/api/profile");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        if (data.success) {
          setUser(data.profile);
        }
      } catch (error) {
        console.error("NAVBAR USER ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    getCurrentUser();
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });

      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("SIGN OUT ERROR:", error);
    }
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}

        <Link
          href="/home"
          className="text-xl font-bold"
        >
          🚀 DevConnect
        </Link>

        {/* Navigation */}

        <div className="flex items-center gap-4">

          <Link
            href="/home"
            className="rounded-lg px-3 py-2 hover:bg-gray-100"
          >
            🏠 Home
          </Link>

          <Link
            href="/search"
            className="rounded-lg px-3 py-2 hover:bg-gray-100"
          >
            🔎 Search
          </Link>

          {!loading && user && (
            <Link
              href={
                user.username
                  ? `/profile/${user.username}`
                  : "/profile"
              }
              className="rounded-lg px-3 py-2 hover:bg-gray-100"
            >
              👤 Profile
            </Link>
          )}

          {!loading && user && (
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-80"
            >
              Sign Out
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}