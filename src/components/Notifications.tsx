"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";

type Notification = {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  postId: string | null;
  actorId: string;
  actorName: string;
  actorUsername: string | null;
  actorImage: string | null;
};

function notificationCopy(notification: Notification) {
  const handle =
    notification.actorUsername || notification.actorName;

  if (notification.type === "follow") {
    return `👤 ${handle} started following you`;
  }

  if (notification.type === "like") {
    return `❤️ ${handle} liked your post`;
  }

  if (notification.type === "comment") {
    return `💬 ${handle} commented on your post`;
  }

  return `${handle} ${notification.type}`;
}

function notificationHref(notification: Notification) {
  if (notification.type === "follow" && notification.actorUsername) {
    return `/profile/${notification.actorUsername}`;
  }

  if (
    (notification.type === "like" || notification.type === "comment") &&
    notification.postId
  ) {
    return `/post/${notification.postId}`;
  }

  if (notification.actorUsername) {
    return `/profile/${notification.actorUsername}`;
  }

  return null;
}

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  async function fetchNotifications() {
    try {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        setError(data.error || "Failed to load notifications");
        return;
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError("");
    } catch (err) {
      console.error("GET NOTIFICATIONS ERROR:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to mark as read", "error");
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("MARK READ ERROR:", err);
      toast("Failed to mark as read", "error");
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to mark all as read", "error");
        return;
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      setUnreadCount(0);
      toast("All notifications marked as read");
    } catch (err) {
      console.error("MARK ALL READ ERROR:", err);
      toast("Failed to mark all as read", "error");
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    const href = notificationHref(notification);
    if (href) {
      router.push(href);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        <p className="text-gray-500">Loading notifications...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {unreadCount} unread
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={markingAll}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50"
          >
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(notification)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleNotificationClick(notification);
                }
              }}
              className={`cursor-pointer rounded-xl border p-4 transition focus-visible:ring-2 focus-visible:ring-black ${
                !notification.read
                  ? "bg-blue-50 hover:bg-blue-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {notification.actorImage ? (
                  <img
                    src={notification.actorImage}
                    alt={notification.actorName}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg font-bold">
                    {notification.actorName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-medium break-words">
                    {notificationCopy(notification)}
                  </p>

                  {notification.actorUsername && (
                    <p className="text-sm text-gray-500">
                      @{notification.actorUsername}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                {!notification.read && (
                  <span
                    className="mt-2 h-3 w-3 shrink-0 rounded-full bg-blue-500"
                    aria-label="Unread"
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-gray-400">
        <Link href="/home" className="hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
