"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";
import { formatTimestamp } from "@/lib/utils";

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
      <main style={{ maxWidth: "42rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-3d" style={{ padding: "1rem", opacity: 1 - i * 0.18 }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div className="skeleton-3d" style={{ width: "3rem", height: "3rem", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-3d" style={{ height: "0.875rem", width: "55%", marginBottom: "0.4rem" }} />
                  <div className="skeleton-3d" style={{ height: "0.75rem", width: "30%" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "42rem", margin: "0 auto", padding: "1.5rem 1rem" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, oklch(0.75 0.2 270), oklch(0.78 0.22 300), oklch(0.7 0.25 320))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-shift 3s ease infinite",
                lineHeight: 1.1,
              }}
            >
              🔔 Notifications
            </h1>
            {unreadCount > 0 && (
              <p style={{ marginTop: "0.35rem", fontSize: "0.875rem", color: "oklch(0.6 0.04 265)" }}>
                <span className="badge-3d" style={{ marginRight: "0.4rem" }}>{unreadCount}</span>
                unread
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="btn-3d-ghost"
            >
              {markingAll ? "⏳ Marking…" : "✓ Mark all as read"}
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="card-3d danger-zone-3d" style={{ padding: "1.5rem", textAlign: "center" }}>
          <p style={{ color: "oklch(0.75 0.22 25)" }}>⚠️ {error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card-3d" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "float 3s ease-in-out infinite" }}>
            🔕
          </div>
          <p style={{ color: "oklch(0.6 0.04 265)", fontWeight: 500 }}>
            No notifications yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.map((notification, index) => (
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
              className={`notification-3d stagger-${Math.min(index + 1, 5)} ${!notification.read ? "unread" : ""}`}
              style={{ padding: "1rem" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                {notification.actorImage ? (
                  <img
                    src={notification.actorImage}
                    alt={notification.actorName}
                    className="avatar-3d"
                    style={{ width: "3rem", height: "3rem", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    className="avatar-placeholder-3d"
                    style={{ width: "3rem", height: "3rem", fontSize: "1.125rem", flexShrink: 0 }}
                  >
                    {notification.actorName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 500, color: "oklch(0.9 0.02 265)" }}>
                    {notificationCopy(notification)}
                  </p>

                  {notification.actorUsername && (
                    <p style={{ fontSize: "0.8125rem", color: "oklch(0.55 0.05 270)" }}>
                      @{notification.actorUsername}
                    </p>
                  )}

                  <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "oklch(0.45 0.03 265)" }}>
                    🕐 {formatTimestamp(notification.createdAt)}
                  </p>
                </div>

                {!notification.read && (
                  <span
                    className="unread-dot"
                    aria-label="Unread"
                    style={{ width: "0.75rem", height: "0.75rem", flexShrink: 0, marginTop: "0.25rem" }}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "oklch(0.45 0.03 265)" }}>
        <Link
          href="/home"
          style={{ color: "oklch(0.65 0.22 270)", textDecoration: "none", transition: "all 0.2s" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "oklch(0.75 0.2 270)";
            e.currentTarget.style.textShadow = "0 0 12px oklch(0.65 0.22 270 / 50%)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "oklch(0.65 0.22 270)";
            e.currentTarget.style.textShadow = "";
          }}
        >
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
