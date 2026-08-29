import { auth } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { jsonError, jsonSuccess } from "@/lib/http";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Props
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;

    const updated = await db
      .update(notifications)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.recipientId, session.user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return jsonError("Notification not found", 404);
    }

    return jsonSuccess({
      notification: updated[0],
    });
  } catch (error) {
    console.error("MARK_NOTIFICATION_READ_ERROR:", error);

    return jsonError("Failed to mark notification as read", 500);
  }
}
