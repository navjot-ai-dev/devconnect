
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { follows, posts, user } from "@/db/schema";
import {
  and,
  desc,
  eq,
  sql,
} from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
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
  // GET USER
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
  // PROFILE STATS
  // =========================

  const [postCount] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(posts)
    .where(eq(posts.userId, profile.id));

  const [followersCount] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(follows)
    .where(eq(follows.followingId, profile.id));

  const [followingCount] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(follows)
    .where(eq(follows.followerId, profile.id));

  // =========================
  // GET POSTS
  // =========================

  const profilePosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(eq(posts.userId, profile.id))
    .orderBy(desc(posts.createdAt));

  // =========================
  // CURRENT USER
  // =========================

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // =========================
  // CHECK FOLLOW STATUS
  // =========================

  let initialFollowing = false;

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

    initialFollowing = !!existingFollow;
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">

        {/* =========================
            PROFILE CARD
        ========================= */}

        <div className="rounded-xl border p-6">

          {/* IMAGE */}

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

          {/* =========================
              STATS
          ========================= */}

          <div className="mt-6 flex gap-8">

            {/* POSTS */}

            <Link
              href={`/profile/${profile.username}`}
              className="rounded-lg p-2 text-center transition hover:bg-gray-100"
            >
              <p className="font-bold">
                {postCount?.count ?? 0}
              </p>

              <p className="text-sm text-gray-500">
                Posts
              </p>
            </Link>

            {/* FOLLOWERS */}

            <Link
              href={`/profile/${profile.username}/followers`}
              className="rounded-lg p-2 text-center transition hover:bg-gray-100"
            >
              <p className="font-bold">
                {followersCount?.count ?? 0}
              </p>

              <p className="text-sm text-gray-500">
                Followers
              </p>
            </Link>

            {/* FOLLOWING */}

            <Link
              href={`/profile/${profile.username}/following`}
              className="rounded-lg p-2 text-center transition hover:bg-gray-100"
            >
              <p className="font-bold">
                {followingCount?.count ?? 0}
              </p>

              <p className="text-sm text-gray-500">
                Following
              </p>
            </Link>

          </div>

          {/* =========================
              FOLLOW BUTTON
          ========================= */}

          {session &&
            session.user.id !== profile.id && (
              <FollowButton
                userId={profile.id}
                initialFollowing={
                  initialFollowing
                }
              />
            )}

        </div>

        {/* =========================
            POSTS
        ========================= */}

        <section className="mt-8">

          <h2 className="mb-4 text-xl font-bold">
            Posts
          </h2>

          {profilePosts.length === 0 ? (
            <div className="rounded-xl border p-6 text-center">
              <p className="text-gray-500">
                No posts yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {profilePosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block rounded-xl border p-5 transition hover:bg-gray-50"
                >
                  <p className="whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(
                      post.createdAt
                    ).toLocaleString()}
                  </p>
                </Link>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
