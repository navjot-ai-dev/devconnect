import { auth } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function PATCH() {
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
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // =========================
    // MARK ALL AS READ
    // =========================

    const updated = await db
      .update(notifications)
      .set({
        read: true,
      })
      .where(
        and(
          eq(
            notifications.recipientId,
            session.user.id
          ),
          eq(
            notifications.read,
            false
          )
        )
      )
      .returning();

    // =========================
    // SUCCESS
    // =========================

    return Response.json({
      success: true,
      updatedCount: updated.length,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "MARK_ALL_NOTIFICATIONS_READ_ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to mark all notifications as read",
      },
      { status: 500 }
    );
  }
}