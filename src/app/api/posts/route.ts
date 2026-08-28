import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";

// CREATE POST
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

    const content = body.content?.trim();

    if (!content) {
      return Response.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    const newPost = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        content,
      })
      .returning();

    return Response.json(
      {
        success: true,
        post: newPost[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE_POST_ERROR:", error);

    return Response.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

// GET POSTS
export async function GET() {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    return Response.json({
      success: true,
      posts: allPosts,
    });
  } catch (error) {
    console.error("GET_POSTS_ERROR:", error);

    return Response.json(
      { error: "Failed to get posts" },
      { status: 500 }
    );
  }
}