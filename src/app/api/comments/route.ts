import { auth } from "@/lib/auth";
import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { jsonError, jsonSuccess, readJson } from "@/lib/http";
import { createNotification } from "@/lib/notifications";
import {
  commentContentSchema,
  formatZodError,
} from "@/lib/validations";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const parsed = await readJson<{
      postId?: string;
      content?: string;
    }>(request);

    if (!parsed.ok) {
      return parsed.response;
    }

    const postId = parsed.data.postId;
    const parsedContent = commentContentSchema.safeParse({
      content: parsed.data.content,
    });

    if (!postId) {
      return jsonError("Post ID is required", 400);
    }

    if (!parsedContent.success) {
      return jsonError(formatZodError(parsedContent.error), 400);
    }

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

    const newComment = await db
      .insert(comments)
      .values({
        id: crypto.randomUUID(),
        postId,
        userId: session.user.id,
        content: parsedContent.data.content,
      })
      .returning();

    await createNotification({
      recipientId: post.userId,
      actorId: session.user.id,
      type: "comment",
      postId,
    });

    return jsonSuccess(
      {
        comment: newComment[0],
      },
      201
    );
  } catch (error) {
    console.error("CREATE_COMMENT_ERROR:", error);

    return jsonError("Failed to create comment", 500);
  }
}
