import { auth } from "@/lib/auth";
import { db } from "@/db";
import { notifications, user } from "@/db/schema";
import { jsonError, jsonSuccess } from "@/lib/http";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const result = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        read: notifications.read,
        createdAt: notifications.createdAt,
        postId: notifications.postId,
        actorId: user.id,
        actorName: user.name,
        actorUsername: user.username,
        actorImage: user.image,
      })
      .from(notifications)
      .innerJoin(user, eq(notifications.actorId, user.id))
      .where(eq(notifications.recipientId, session.user.id))
      .orderBy(desc(notifications.createdAt));

    const unreadCount = result.filter(
      (notification) => !notification.read
    ).length;

    return jsonSuccess({
      notifications: result,
      unreadCount,
    });
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR:", error);

    return jsonError("Failed to get notifications", 500);
  }
}

export async function PATCH() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const updated = await db
      .update(notifications)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notifications.recipientId, session.user.id),
          eq(notifications.read, false)
        )
      )
      .returning();

    return jsonSuccess({
      updatedCount: updated.length,
      unreadCount: 0,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK_ALL_NOTIFICATIONS_READ_ERROR:", error);

    return jsonError("Failed to mark all notifications as read", 500);
  }
}
