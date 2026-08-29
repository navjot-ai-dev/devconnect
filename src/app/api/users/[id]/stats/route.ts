
import { db } from "@/db";
import { follows, posts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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

    // Posts count
    const [postResult] = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(posts)
      .where(eq(posts.userId, id));

    // Followers count
    const [followersResult] = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(follows)
      .where(eq(follows.followingId, id));

    // Following count
    const [followingResult] = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(follows)
      .where(eq(follows.followerId, id));

    return Response.json({
      success: true,
      stats: {
        posts: postResult?.count ?? 0,
        followers: followersResult?.count ?? 0,
        following: followingResult?.count ?? 0,
      },
    });
  } catch (error) {
    console.error(
      "GET PROFILE STATS ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to get profile stats",
      },
      { status: 500 }
    );
  }
}
