"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseResponseJson } from "@/lib/http";

type User = {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  async function searchUsers() {
    if (!query.trim()) {
      setUsers([]);
      setError("");
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`,
        {
          credentials: "include",
        }
      );
      const data = await parseResponseJson(response);

      if (!response.ok) {
        setError(data.error || "Failed to search users");
        setUsers([]);
        return;
      }

      setUsers(data.users || []);
      setError("");
    } catch (err) {
      console.error("SEARCH USERS ERROR:", err);
      setError("Failed to search users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold sm:text-3xl">Search developers</h1>
        <p className="mt-2 text-gray-500">
          Find developers on DevConnect.
        </p>

        <div className="mt-6">
          <label htmlFor="search" className="sr-only">
            Search developers
          </label>
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search developers..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>

        {loading && (
          <p className="mt-6 text-gray-500">Searching...</p>
        )}

        {error && !loading && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {!loading &&
            !error &&
            hasSearched &&
            users.length === 0 && (
              <div className="rounded-xl border p-6 text-center">
                <p className="text-gray-500">No developers found.</p>
              </div>
            )}

          {users.map((user) => (
            <Link
              key={user.id}
              href={user.username ? `/profile/${user.username}` : "#"}
              className="block rounded-xl border p-4 transition hover:bg-gray-50"
            >
              <div className="flex items-start gap-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-14 w-14 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-bold">{user.name}</p>
                  {user.username && (
                    <p className="text-sm text-gray-500">
                      @{user.username}
                    </p>
                  )}
                  {user.bio && (
                    <p className="mt-1 text-sm text-gray-600 break-words">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
