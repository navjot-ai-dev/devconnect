import { auth } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { jsonError, jsonSuccess } from "@/lib/http";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

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
