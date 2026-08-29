
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  async function searchUsers() {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(
          query
        )}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        setUsers([]);
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error("SEARCH USERS ERROR:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-3xl font-bold">
          🔎 Search Developers
        </h1>

        <p className="mt-2 text-gray-500">
          Find developers on DevConnect.
        </p>

        {/* SEARCH */}

        <div className="mt-6">
          <input
            type="text"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by name or username..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
          />
        </div>

        {/* LOADING */}

        {loading && (
          <p className="mt-6 text-gray-500">
            Searching...
          </p>
        )}

        {/* RESULTS */}

        <div className="mt-6 space-y-3">

          {!loading &&
            query &&
            users.length === 0 && (
              <div className="rounded-xl border p-6 text-center">
                <p className="text-gray-500">
                  No developers found.
                </p>
              </div>
            )}

          {users.map((user) => (
            <Link
              key={user.id}
              href={
                user.username
                  ? `/profile/${user.username}`
                  : "#"
              }
              className="block rounded-xl border p-4 transition hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">

                {/* IMAGE */}

                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {/* USER INFO */}

                <div>
                  <p className="font-bold">
                    {user.name}
                  </p>

                  {user.username && (
                    <p className="text-sm text-gray-500">
                      @{user.username}
                    </p>
                  )}

                  {user.bio && (
                    <p className="mt-1 text-sm text-gray-600">
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

