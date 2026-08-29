
"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actorId: string;
  actorName: string;
  actorUsername: string | null;
  actorImage: string | null;
};

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // GET NOTIFICATIONS
  // =========================

  async function fetchNotifications() {
    try {
      const response = await fetch(
        "/api/notifications",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        return;
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(
        "GET NOTIFICATIONS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // MARK ONE AS READ
  // =========================

  async function markAsRead(
    notificationId: string
  ) {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      setUnreadCount((count) =>
        Math.max(0, count - 1)
      );
    } catch (error) {
      console.error(
        "MARK READ ERROR:",
        error
      );
    }
  }

  // =========================
  // MARK ALL AS READ
  // =========================

  async function markAllAsRead() {
    try {
      const response = await fetch(
        "/api/notifications/read-all",
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.error);
        return;
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "MARK ALL READ ERROR:",
        error
      );
    }
  }

  // =========================
  // LOAD
  // =========================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p>Loading notifications...</p>
      </main>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="mx-auto max-w-2xl p-6">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            🔔 Notifications
          </h1>

          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {unreadCount} unread
            </p>
          )}
        </div>

        {/* MARK ALL BUTTON */}

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
          >
            Mark all as read
          </button>
        )}

      </div>

      {/* EMPTY */}

      {notifications.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-gray-500">
            No notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">

          {notifications.map(
            (notification) => (
              <article
                key={notification.id}
                onClick={() =>
                  !notification.read &&
                  markAsRead(notification.id)
                }
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  !notification.read
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "hover:bg-gray-50"
                }`}
              >

                <div className="flex items-center gap-3">

                  {/* IMAGE */}

                  {notification.actorImage ? (
                    <img
                      src={
                        notification.actorImage
                      }
                      alt={
                        notification.actorName
                      }
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold">
                      {notification.actorName
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {/* CONTENT */}

                  <div className="flex-1">

                    <p className="font-medium">
                      <span className="font-bold">
                        {notification.actorName}
                      </span>{" "}

                      {notification.type ===
                      "follow"
                        ? "started following you"
                        : notification.type}
                    </p>

                    {notification.actorUsername && (
                      <p className="text-sm text-gray-500">
                        @
                        {
                          notification.actorUsername
                        }
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>

                  {/* UNREAD DOT */}

                  {!notification.read && (
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                  )}

                </div>

              </article>
            )
          )}

        </div>
      )}

    </main>
  );
}

