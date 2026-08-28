import { auth } from "@/lib/auth";
import { db } from "@/db";
import { follows, user } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Get target user ID
    const { id: targetUserId } = await params;

    // 3. Prevent following yourself
    if (session.user.id === targetUserId) {
      return Response.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // 4. Check whether target user exists
    const targetUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (targetUser.length === 0) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 5. Check existing follow
    const existingFollow = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, session.user.id),
          eq(follows.followingId, targetUserId)
        )
      )
      .limit(1);

    // 6. Already following → UNFOLLOW
    if (existingFollow.length > 0) {
      await db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, session.user.id),
            eq(follows.followingId, targetUserId)
          )
        );

      return Response.json({
        success: true,
        following: false,
        message: "User unfollowed",
      });
    }

    // 7. Not following → FOLLOW
    await db.insert(follows).values({
      followerId: session.user.id,
      followingId: targetUserId,
    });

    return Response.json({
      success: true,
      following: true,
      message: "User followed",
    });
  } catch (error) {
    console.error("FOLLOW_ERROR:", error);

    return Response.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}