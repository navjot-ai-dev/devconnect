import { auth } from "@/lib/auth";
import { db } from "@/db";
import { comments, user } from "@/db/schema";
import { jsonError, jsonSuccess, readJson } from "@/lib/http";
import {
  commentContentSchema,
  formatZodError,
} from "@/lib/validations";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const postComments = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        postId: comments.postId,
        content: comments.content,
        createdAt: comments.createdAt,
        name: user.name,
        username: user.username,
        image: user.image,
      })
      .from(comments)
      .innerJoin(user, eq(comments.userId, user.id))
      .where(eq(comments.postId, id))
      .orderBy(desc(comments.createdAt));

    return jsonSuccess({
      comments: postComments,
    });
  } catch (error) {
    console.error("GET_COMMENTS_ERROR:", error);

    return jsonError("Failed to get comments", 500);
  }
}

export async function PATCH(
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

    const { id } = await params;
    const parsed = await readJson<{ content?: string }>(request);

    if (!parsed.ok) {
      return parsed.response;
    }

    const parsedContent = commentContentSchema.safeParse(parsed.data);

    if (!parsedContent.success) {
      return jsonError(formatZodError(parsedContent.error), 400);
    }

    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (!comment) {
      return jsonError("Comment not found", 404);
    }

    if (comment.userId !== session.user.id) {
      return jsonError("You can only edit your own comment", 403);
    }

    const [updated] = await db
      .update(comments)
      .set({
        content: parsedContent.data.content,
      })
      .where(eq(comments.id, id))
      .returning();

    return jsonSuccess({
      comment: updated,
      message: "Comment updated",
    });
  } catch (error) {
    console.error("UPDATE_COMMENT_ERROR:", error);

    return jsonError("Failed to update comment", 500);
  }
}

export async function DELETE(
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

    const { id } = await params;

    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (!comment) {
      return jsonError("Comment not found", 404);
    }

    if (comment.userId !== session.user.id) {
      return jsonError(
        "You can only delete your own comment",
        403
      );
    }

    await db.delete(comments).where(eq(comments.id, id));

    return jsonSuccess({
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("DELETE_COMMENT_ERROR:", error);

    return jsonError("Failed to delete comment", 500);
  }
}
