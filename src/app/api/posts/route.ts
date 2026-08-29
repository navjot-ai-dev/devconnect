import { auth } from "@/lib/auth";
import { db } from "@/db";
import { likes, posts, user } from "@/db/schema";
import { jsonError, jsonSuccess, readJson } from "@/lib/http";
import {
  formatZodError,
  postContentSchema,
} from "@/lib/validations";
import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const parsed = await readJson<{ content?: string }>(request);

    if (!parsed.ok) {
      return parsed.response;
    }

    const parsedContent = postContentSchema.safeParse(parsed.data);

    if (!parsedContent.success) {
      return jsonError(formatZodError(parsedContent.error), 400);
    }

    const newPost = await db
      .insert(posts)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        content: parsedContent.data.content,
      })
      .returning();

    return jsonSuccess(
      {
        post: {
          ...newPost[0],
          likeCount: 0,
          isLiked: false,
        },
      },
      201
    );
  } catch (error) {
    console.error("CREATE_POST_ERROR:", error);

    return jsonError("Failed to create post", 500);
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const allPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        createdAt: posts.createdAt,
        name: user.name,
        username: user.username,
        image: user.image,
        likeCount: sql<number>`
          count(${likes.userId})
        `.mapWith(Number),
        isLiked: session
          ? sql<boolean>`
              exists (
                select 1
                from ${likes}
                where ${likes.postId} = ${posts.id}
                and ${likes.userId} = ${session.user.id}
              )
            `
          : sql<boolean>`false`,
      })
      .from(posts)
      .innerJoin(user, eq(posts.userId, user.id))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .groupBy(posts.id, user.id)
      .orderBy(desc(posts.createdAt));

    return jsonSuccess({
      posts: allPosts,
    });
  } catch (error) {
    console.error("GET_POSTS_ERROR:", error);

    return jsonError("Failed to get posts", 500);
  }
}
