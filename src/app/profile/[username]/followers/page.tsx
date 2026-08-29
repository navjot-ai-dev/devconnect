
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

export default async function FollowersPage({
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
  // GET FOLLOWERS
  // =========================

  const followers = await db
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
      eq(follows.followerId, user.id)
    )
    .where(
      eq(follows.followingId, profile.id)
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
          {profile.name}'s Followers
        </h1>

        {/* FOLLOWERS */}

        <div className="mt-6 space-y-3">

          {followers.length === 0 ? (
            <div className="rounded-xl border p-8 text-center">
              <p className="text-gray-500">
                No followers yet.
              </p>
            </div>
          ) : (
            followers.map((follower) => (
              <Link
                key={follower.id}
                href={
                  follower.username
                    ? `/profile/${follower.username}`
                    : "#"
                }
                className="block rounded-xl border p-4 transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">

                  {/* IMAGE */}

                  {follower.image ? (
                    <img
                      src={follower.image}
                      alt={follower.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">
                      {follower.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {/* USER */}

                  <div>
                    <p className="font-bold">
                      {follower.name}
                    </p>

                    {follower.username && (
                      <p className="text-sm text-gray-500">
                        @{follower.username}
                      </p>
                    )}

                    {follower.bio && (
                      <p className="mt-1 text-sm text-gray-600">
                        {follower.bio}
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

