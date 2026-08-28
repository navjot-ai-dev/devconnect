import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(
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

    const { id } = await params;

    // Delete ONLY if this post belongs to the logged-in user
    const deletedPost = await db
      .delete(posts)
      .where(
        and(
          eq(posts.id, id),
          eq(posts.userId, session.user.id)
        )
      )
      .returning();

    if (deletedPost.length === 0) {
      return Response.json(
        {
          error: "Post not found or you are not allowed to delete it",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_POST_ERROR:", error);

    return Response.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}