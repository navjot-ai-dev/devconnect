import { auth } from "@/lib/auth";
import { db } from "@/db";
import { likes, posts } from "@/db/schema";
import { jsonError, jsonSuccess } from "@/lib/http";
import {
  createNotification,
  deleteLikeNotification,
} from "@/lib/notifications";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id: postId } = await params;

    const [post] = await db
      .select({
        id: posts.id,
        userId: posts.userId,
      })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return jsonError("Post not found", 404);
    }

    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.postId, postId),
          eq(likes.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingLike.length > 0) {
      await db
        .delete(likes)
        .where(
          and(
            eq(likes.postId, postId),
            eq(likes.userId, session.user.id)
          )
        );

      await deleteLikeNotification({
        actorId: session.user.id,
        postId,
      });

      return jsonSuccess({
        liked: false,
        message: "Post unliked",
      });
    }

    await db.insert(likes).values({
      postId,
      userId: session.user.id,
    });

    await createNotification({
      recipientId: post.userId,
      actorId: session.user.id,
      type: "like",
      postId,
    });

    return jsonSuccess({
      liked: true,
      message: "Post liked",
    });
  } catch (error) {
    console.error("LIKE_POST_ERROR:", error);

    return jsonError("Failed to like/unlike post", 500);
  }
}
