import { auth } from "@/lib/auth";
import { db } from "@/db";
import { comments, user } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";

// ========================
// CREATE COMMENT
// ========================

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: postId } = await params;

    const body = await request.json();

    const content = body.content?.trim();

    if (!content) {
      return Response.json(
        { error: "Comment content is required" },
        { status: 400 }
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

// ========================
// GET COMMENTS
// ========================

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

    return Response.json({
      success: true,
      comments: allComments,
    });
  } catch (error) {
    console.error("GET_COMMENTS_ERROR:", error);

    return Response.json(
      { error: "Failed to get comments" },
      { status: 500 }
    );
  }
}