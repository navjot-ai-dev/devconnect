import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user,
  posts,
  follows,
} from "@/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
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
  // GET POST COUNT
  // =========================

  const [postCount] = await db
    .select({
      count: count(),
    })
    .from(posts)
    .where(eq(posts.userId, profile.id));

  // =========================
  // GET FOLLOWER COUNT
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
  // GET FOLLOWING COUNT
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
  // CURRENT SESSION
  // =========================

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // =========================
  // CHECK FOLLOWING
  // =========================

  let isFollowing = false;

  if (session && session.user.id !== profile.id) {
    const [follow] = await db
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

    isFollowing = !!follow;
  }

  // =========================
  // GET USER POSTS
  // =========================

  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, profile.id))
    .orderBy(desc(posts.createdAt));

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">

        {/* =========================
            PROFILE
        ========================= */}

        <div className="rounded-xl border p-6">

          {/* Profile Image */}

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

          {/* Name */}

          <h1 className="mt-4 text-3xl font-bold">
            {profile.name}
          </h1>

          {/* Username */}

          <p className="text-gray-500">
            @{profile.username}
          </p>

          {/* Bio */}

          <p className="mt-4">
            {profile.bio || "No bio yet."}
          </p>

          {/* =========================
              STATS
          ========================= */}

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

          {/* =========================
              FOLLOW BUTTON
          ========================= */}

          {session &&
            session.user.id !== profile.id && (
              <FollowButton
                userId={profile.id}
                initialFollowing={isFollowing}
              />
            )}

        </div>

        {/* =========================
            POSTS
        ========================= */}

        <section className="mt-8">

          <h2 className="mb-4 text-2xl font-bold">
            Posts
          </h2>

          {userPosts.length === 0 ? (
            <div className="rounded-xl border p-6 text-center text-gray-500">
              No posts yet.
            </div>
          ) : (
            <div className="space-y-4">

              {userPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-xl border p-5 shadow-sm"
                >
                  <p>
                    {post.content}
                  </p>

                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(
                      post.createdAt
                    ).toLocaleString()}
                  </p>
                </article>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}