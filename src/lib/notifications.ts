import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type NotificationType = "follow" | "like" | "comment";

export async function createNotification(input: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string | null;
}) {
  if (input.recipientId === input.actorId) {
    return;
  }

  if (input.type === "like" && input.postId) {
    const [existing] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.actorId, input.actorId),
          eq(notifications.type, "like"),
          eq(notifications.postId, input.postId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(notifications)
        .set({ read: false })
        .where(eq(notifications.id, existing.id));
      return;
    }
  }

  try {
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      recipientId: input.recipientId,
      actorId: input.actorId,
      type: input.type,
      postId: input.postId ?? null,
      read: false,
    });
  } catch (error) {
    console.error("CREATE_NOTIFICATION_ERROR:", error);
  }
}

export async function deleteLikeNotification(input: {
  actorId: string;
  postId: string;
}) {
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.actorId, input.actorId),
        eq(notifications.type, "like"),
        eq(notifications.postId, input.postId)
      )
    );
}
