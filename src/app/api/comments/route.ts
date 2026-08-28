import { auth } from "@/lib/auth";
import { db } from "@/db";
import { comments, posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(request: Request) {
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

    const body = await request.json();

    const postId = body.postId;
    const content = body.content?.trim();

    if (!postId) {
      return Response.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    if (!content) {
      return Response.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Make sure post exists
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const newComment = await db
      .insert(comments)
      .values({
        id: crypto.randomUUID(),
        postId,
        userId: session.user.id,
        content,
      })
      .returning();

    return Response.json(
      {
        success: true,
        comment: newComment[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_COMMENT_ERROR:", error);

    return Response.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}