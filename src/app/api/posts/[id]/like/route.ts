import { auth } from "@/lib/auth";
import { db } from "@/db";
import { likes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

// LIKE / UNLIKE POST
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check logged-in user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: postId } = await params;

    // Check if user already liked this post
    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, session.user.id)
        )
      );

    // If already liked → UNLIKE
    if (existingLike.length > 0) {
      await db
        .delete(likes)
        .where(
          and(
            eq(likes.postId, postId),
            eq(likes.userId, session.user.id)
          )
        );

      return Response.json({
        success: true,
        liked: false,
        message: "Post unliked",
      });
    }

    // Otherwise → LIKE
    await db.insert(likes).values({
      postId,
      userId: session.user.id,
    });

    return Response.json({
      success: true,
      liked: true,
      message: "Post liked",
    });
  } catch (error) {
    console.error("LIKE_POST_ERROR:", error);

    return Response.json(
      { error: "Failed to like/unlike post" },
      { status: 500 }
    );
  }
}