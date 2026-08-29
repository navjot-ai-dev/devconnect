import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { jsonError, jsonSuccess, readJson } from "@/lib/http";
import {
  formatZodError,
  postContentSchema,
} from "@/lib/validations";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ id: string }>;
};

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

    const parsedContent = postContentSchema.safeParse(parsed.data);

    if (!parsedContent.success) {
      return jsonError(formatZodError(parsedContent.error), 400);
    }

    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return jsonError("Post not found", 404);
    }

    if (post.userId !== session.user.id) {
      return jsonError("You can only edit your own post", 403);
    }

    const [updated] = await db
      .update(posts)
      .set({
        content: parsedContent.data.content,
      })
      .where(
        and(eq(posts.id, id), eq(posts.userId, session.user.id))
      )
      .returning();

    return jsonSuccess({
      post: updated,
      message: "Post updated",
    });
  } catch (error) {
    console.error("UPDATE_POST_ERROR:", error);

    return jsonError("Failed to update post", 500);
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

    const deletedPost = await db
      .delete(posts)
      .where(
        and(eq(posts.id, id), eq(posts.userId, session.user.id))
      )
      .returning();

    if (deletedPost.length === 0) {
      return jsonError(
        "Post not found or you are not allowed to delete it",
        404
      );
    }

    return jsonSuccess({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_POST_ERROR:", error);

    return jsonError("Failed to delete post", 500);
  }
}
