import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  follows,
  notifications,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Props
) {
  try {
    // =========================
    // GET SESSION
    // =========================

    const session = await auth.api.getSession({
      headers: await headers(),
    });



    if (!session) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    console.log("CURRENT USER:", session.user.id);

    // =========================
    // GET TARGET USER
    // =========================

    const { id: targetUserId } =
      await params;

    // =========================
    // CANNOT FOLLOW YOURSELF
      // =========================

    if (session.user.id === targetUserId) {
      return Response.json(
        {
          error: "You cannot follow yourself",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CHECK EXISTING FOLLOW
    // =========================

    const [existingFollow] = await db
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
            targetUserId
          )
        )
      )
      .limit(1);

    // =========================
    // UNFOLLOW
    // =========================

    if (existingFollow) {
      await db
        .delete(follows)
        .where(
          and(
            eq(
              follows.followerId,
              session.user.id
            ),
            eq(
              follows.followingId,
              targetUserId
            )
          )
        );

      return Response.json({
        success: true,
        following: false,
        message: "User unfollowed",
      });
    }

    // =========================
    // FOLLOW
    // =========================

    await db.insert(follows).values({
      followerId: session.user.id,
      followingId: targetUserId,
    });

    // =========================
    // CREATE NOTIFICATION
    // =========================

    await db.insert(notifications).values({
      id: crypto.randomUUID(),

      recipientId: targetUserId,

      actorId: session.user.id,

      type: "follow",

      read: false,
    });

    return Response.json({
      success: true,
      following: true,
      message: "User followed",
    });
  } catch (error) {
    console.error(
      "FOLLOW_ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to follow user",
      },
      {
        status: 500,
      }
    );
  }
}