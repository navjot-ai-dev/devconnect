import { auth } from "@/lib/auth";
import { db } from "@/db";
import { comments, posts, user } from "@/db/schema";
import { jsonError, jsonSuccess, readJson } from "@/lib/http";
import { createNotification } from "@/lib/notifications";
import {
  commentContentSchema,
  formatZodError,
} from "@/lib/validations";
import { asc, eq } from "drizzle-orm";
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
    const parsed = await readJson<{ content?: string }>(request);

    if (!parsed.ok) {
      return parsed.response;
    }

    const parsedContent = commentContentSchema.safeParse(parsed.data);

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const allComments = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        username: user.username,
        name: user.name,
        image: user.image,
      })
      .from(comments)
      .leftJoin(user, eq(comments.userId, user.id))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));

    return jsonSuccess({
      comments: allComments,
    });
  } catch (error) {
    console.error("GET_COMMENTS_ERROR:", error);

    return jsonError("Failed to get comments", 500);
  }
}
