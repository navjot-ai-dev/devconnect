import { auth } from "@/lib/auth";
import { db } from "@/db";
import { follows, user } from "@/db/schema";
import { jsonError, jsonSuccess } from "@/lib/http";
import { createNotification } from "@/lib/notifications";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function getFollowCounts(userId: string) {
  const [followersResult] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(follows)
    .where(eq(follows.followingId, userId));

  const [followingResult] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(follows)
    .where(eq(follows.followerId, userId));

  return {
    followersCount: followersResult?.count ?? 0,
    followingCount: followingResult?.count ?? 0,
  };
}

export async function POST(
  request: Request,
  { params }: Props
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id: targetUserId } = await params;

    if (session.user.id === targetUserId) {
      return jsonError("You cannot follow yourself", 400);
    }

    const [targetUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      return jsonError("User not found", 404);
    }

    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, session.user.id),
          eq(follows.followingId, targetUserId)
        )
      )
      .limit(1);

    if (existingFollow) {
      await db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, session.user.id),
            eq(follows.followingId, targetUserId)
          )
        );

      const counts = await getFollowCounts(targetUserId);

      return jsonSuccess({
        following: false,
        message: "User unfollowed",
        ...counts,
      });
    }

    await db.insert(follows).values({
      followerId: session.user.id,
      followingId: targetUserId,
    });

    await createNotification({
      recipientId: targetUserId,
      actorId: session.user.id,
      type: "follow",
    });

    const counts = await getFollowCounts(targetUserId);

    return jsonSuccess({
      following: true,
      message: "User followed",
      ...counts,
    });
  } catch (error) {
    console.error("FOLLOW_ERROR:", error);

    return jsonError("Failed to follow user", 500);
  }
}
