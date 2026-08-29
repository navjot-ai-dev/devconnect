import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  notifications,
  user,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  try {
    // =========================
    // GET CURRENT SESSION
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
    // GET NOTIFICATIONS
    // =========================

    const result = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        read: notifications.read,
        createdAt: notifications.createdAt,

        actorId: user.id,
        actorName: user.name,
        actorUsername: user.username,
        actorImage: user.image,
      })
      .from(notifications)
      .innerJoin(
        user,
        eq(notifications.actorId, user.id)
      )
      .where(
        eq(
          notifications.recipientId,
          session.user.id
        )
      )
      .orderBy(
        desc(notifications.createdAt)
      );

    // =========================
    // UNREAD COUNT
    // =========================

    const unreadCount = result.filter(
      (notification) =>
        !notification.read
    ).length;

    // =========================
    // RESPONSE
    // =========================

    return Response.json({
      success: true,
      notifications: result,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET_NOTIFICATIONS_ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to get notifications",
      },
      {
        status: 500,
      }
    );
  }
}