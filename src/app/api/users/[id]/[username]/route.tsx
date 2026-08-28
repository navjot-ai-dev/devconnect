import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user,
  posts,
  follows,
} from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Find user
    const foundUser = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.username, username))
      .limit(1);

    if (foundUser.length === 0) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const profileUser = foundUser[0];

    // Count posts
    const postResult = await db
      .select({
        count: count(),
      })
      .from(posts)
      .where(eq(posts.userId, profileUser.id));

    // Count followers
    const followerResult = await db
      .select({
        count: count(),
      })
      .from(follows)
      .where(
        eq(follows.followingId, profileUser.id)
      );

    // Count following
    const followingResult = await db
      .select({
        count: count(),
      })
      .from(follows)
      .where(
        eq(follows.followerId, profileUser.id)
      );

    // Check current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let isFollowing = false;

    if (session) {
      const followResult = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(
              follows.followerId,
              session.user.id
            ),
            eq(
              follows.followingId,
              profileUser.id
            )
          )
        )
        .limit(1);

      isFollowing = followResult.length > 0;
    }

    return Response.json({
      success: true,

      user: profileUser,

      stats: {
        posts: postResult[0]?.count ?? 0,
        followers: followerResult[0]?.count ?? 0,
        following: followingResult[0]?.count ?? 0,
      },

      isFollowing,
    });
  } catch (error) {
    console.error(
      "GET_PUBLIC_PROFILE_ERROR:",
      error
    );

    return Response.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}