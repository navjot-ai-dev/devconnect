import { auth } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
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
        {
          status: 401,
        }
      );
    }

    // =========================
    // GET NOTIFICATION ID
    // =========================

    const { id } = await params;

    // =========================
    // MARK AS READ
    // =========================

    const updated = await db
      .update(notifications)
      .set({
        read: true,
      })
      .where(
        and(
          eq(notifications.id, id),
          eq(
            notifications.recipientId,
            session.user.id
          )
        )
      )
      .returning();

    // =========================
    // NOT FOUND
    // =========================

    if (updated.length === 0) {
      return Response.json(
        {
          success: false,
          error:
            "Notification not found",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // SUCCESS
    // =========================

    return Response.json({
      success: true,
      notification: updated[0],
    });
  } catch (error) {
    console.error(
      "MARK_NOTIFICATION_READ_ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to mark notification as read",
      },
      {
        status: 500,
      }
    );
  }
}