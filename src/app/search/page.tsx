"use client";

import { useState } from "react";
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

  async function searchUsers(value: string) {
    setQuery(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/search/users?q=${encodeURIComponent(value)}`
      );

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("SEARCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-3xl font-bold">
          🔎 Search Users
        </h1>

        <input
          value={query}
          onChange={(e) =>
            searchUsers(e.target.value)
          }
          placeholder="Search by name or username..."
          className="mt-6 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2"
        />

        {loading && (
          <p className="mt-4 text-gray-500">
            Searching...
          </p>
        )}

        <div className="mt-6 space-y-4">

          {!loading &&
            query &&
            users.length === 0 && (
              <p className="text-gray-500">
                No users found.
              </p>
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

                <div>
                  <p className="font-bold">
                    {user.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {user.username
                      ? `@${user.username}`
                      : "Username not set"}
                  </p>

                  {user.bio && (
                    <p className="mt-1 text-sm">
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