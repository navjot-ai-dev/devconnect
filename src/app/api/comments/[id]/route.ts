import { auth } from "@/lib/auth";
import { db } from "@/db";
import { comments, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// =========================
// GET COMMENTS FOR A POST
// =========================

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
      .innerJoin(
        user,
        eq(comments.userId, user.id)
      )
      .where(eq(comments.postId, id))
      .orderBy(desc(comments.createdAt));

    return Response.json({
      success: true,
      comments: postComments,
    });
  } catch (error) {
    console.error(
      "GET_COMMENTS_ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to get comments",
      },
      { status: 500 }
    );
  }
}

// =========================
// DELETE COMMENT
// =========================

export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (!comment) {
      return Response.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return Response.json(
        {
          error:
            "You can only delete your own comment",
        },
        { status: 403 }
      );
    }

    await db
      .delete(comments)
      .where(eq(comments.id, id));

    return Response.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error(
      "DELETE_COMMENT_ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to delete comment",
      },
      { status: 500 }
    );
  }
}