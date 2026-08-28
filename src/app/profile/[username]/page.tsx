import { auth } from "@/lib/auth";
import { db } from "@/db";
import { follows, posts, user } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import FollowButton from "@/components/FollowButton";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: Props) {
  const { username } = await params;

  // =========================
  // GET PROFILE
  // =========================

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (!profile) {
    notFound();
  }

  // =========================
  // CURRENT SESSION
  // =========================

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // =========================
  // POST COUNT
  // =========================

  const [postCount] = await db
    .select({
      count: count(),
    })
    .from(posts)
    .where(eq(posts.userId, profile.id));

  // =========================
  // FOLLOWER COUNT
  // =========================

  const [followerCount] = await db
    .select({
      count: count(),
    })
    .from(follows)
    .where(
      eq(follows.followingId, profile.id)
    );

  // =========================
  // FOLLOWING COUNT
  // =========================

  const [followingCount] = await db
    .select({
      count: count(),
    })
    .from(follows)
    .where(
      eq(follows.followerId, profile.id)
    );

  // =========================
  // IS CURRENT USER FOLLOWING?
  // =========================

  let isFollowing = false;

  if (
    session &&
    session.user.id !== profile.id
  ) {
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(
            follows.followerId,
            session.user.id
          ),
          eq(
            follows.followingId,
            profile.id
          )
        )
      )
      .limit(1);

    isFollowing = !!existingFollow;
  }

  // =========================
  // PAGE
  // =========================

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">

        <div className="rounded-xl border p-6">

          {/* PROFILE IMAGE */}

          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold">
              {profile.name
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          {/* NAME */}

          <h1 className="mt-4 text-3xl font-bold">
            {profile.name}
          </h1>

          {/* USERNAME */}

          <p className="text-gray-500">
            @{profile.username}
          </p>

          {/* BIO */}

          <p className="mt-4">
            {profile.bio || "No bio yet."}
          </p>

          {/* STATS */}

          <div className="mt-6 flex gap-8">

            <div>
              <p className="font-bold">
                {postCount.count}
              </p>

              <p className="text-sm text-gray-500">
                Posts
              </p>
            </div>

            <div>
              <p className="font-bold">
                {followerCount.count}
              </p>

              <p className="text-sm text-gray-500">
                Followers
              </p>
            </div>

            <div>
              <p className="font-bold">
                {followingCount.count}
              </p>

              <p className="text-sm text-gray-500">
                Following
              </p>
            </div>

          </div>

          {/* FOLLOW BUTTON */}

          {session &&
            session.user.id !== profile.id && (
              <FollowButton
                userId={profile.id}
                initialFollowing={isFollowing}
              />
            )}

        </div>

      </div>
    </main>
  );
}