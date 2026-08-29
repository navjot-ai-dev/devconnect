
import { db } from "@/db";
import { follows, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function FollowingPage({
  params,
}: Props) {
  const { username } = await params;

  // =========================
  // FIND PROFILE
  // =========================

  const [profile] = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
    })
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (!profile) {
    notFound();
  }

  // =========================
  // GET FOLLOWING
  // =========================

  const following = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      bio: user.bio,
    })
    .from(follows)
    .innerJoin(
      user,
      eq(follows.followingId, user.id)
    )
    .where(
      eq(follows.followerId, profile.id)
    );

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">

        {/* BACK */}

        <Link
          href={`/profile/${profile.username}`}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to Profile
        </Link>

        {/* TITLE */}

        <h1 className="mt-6 text-3xl font-bold">
          {profile.name}'s Following
        </h1>

        {/* FOLLOWING LIST */}

        <div className="mt-6 space-y-3">

          {following.length === 0 ? (
            <div className="rounded-xl border p-8 text-center">
              <p className="text-gray-500">
                Not following anyone yet.
              </p>
            </div>
          ) : (
            following.map((person) => (
              <Link
                key={person.id}
                href={
                  person.username
                    ? `/profile/${person.username}`
                    : "#"
                }
                className="block rounded-xl border p-4 transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">

                  {/* IMAGE */}

                  {person.image ? (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">
                      {person.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {/* USER INFO */}

                  <div>
                    <p className="font-bold">
                      {person.name}
                    </p>

                    {person.username && (
                      <p className="text-sm text-gray-500">
                        @{person.username}
                      </p>
                    )}

                    {person.bio && (
                      <p className="mt-1 text-sm text-gray-600">
                        {person.bio}
                      </p>
                    )}
                  </div>

                </div>
              </Link>
            ))
          )}

        </div>
      </div>
    </main>
  );
}

