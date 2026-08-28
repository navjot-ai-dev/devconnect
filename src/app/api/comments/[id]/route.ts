import { auth } from "@/lib/auth";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: commentId } = await params;

    // Delete ONLY if this comment belongs to the logged-in user
    const deletedComment = await db
      .delete(comments)
      .where(
        and(
          eq(comments.id, commentId),
          eq(comments.userId, session.user.id)
        )
      )
      .returning();

    if (deletedComment.length === 0) {
      return Response.json(
        {
          error:
            "Comment not found or you are not allowed to delete it",
        },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("DELETE_COMMENT_ERROR:", error);

    return Response.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
