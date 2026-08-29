"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";
import { formatTimestamp } from "@/lib/utils";

type Post = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  name: string;
  username: string | null;
  image: string | null;
  likeCount: number;
  isLiked: boolean;
};

type PostFeedProps = {
  onRefreshReady: (refresh: () => void) => void;
};

export default function PostFeed({ onRefreshReady }: PostFeedProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likingId, setLikingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const response = await fetch("/api/posts");
      const data = await parseResponseJson(response);

      if (!response.ok) {
        setError(data.error || "Failed to load posts");
        return;
      }

      setPosts(data.posts || []);
      setError("");
    } catch (err) {
      console.error("GET POSTS ERROR:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(postId: string) {
    setDeletingId(postId);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to delete post", "error");
        return;
      }

      setPosts((current) => current.filter((post) => post.id !== postId));
      setConfirmDeleteId(null);
      toast("Post deleted");
    } catch (err) {
      console.error("DELETE POST ERROR:", err);
      toast("Failed to delete post", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLike(postId: string) {
    if (likingId) return;
    setLikingId(postId);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to like post", "error");
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              isLiked: data.liked,
              likeCount: data.liked
                ? post.likeCount + 1
                : Math.max(0, post.likeCount - 1),
            }
            : post
        )
      );
    } catch (err) {
      console.error("LIKE POST ERROR:", err);
      toast("Failed to like post", "error");
    } finally {
      setLikingId(null);
    }
  }

  async function handleSaveEdit(postId: string) {
    if (!editContent.trim()) {
      toast("Post cannot be empty", "error");
      return;
    }

    setSavingId(postId);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to update post", "error");
        return;
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, content: data.post.content }
            : post
        )
      );
      setEditingId(null);
      toast("Post updated");
    } catch (err) {
      console.error("UPDATE POST ERROR:", err);
      toast("Failed to update post", "error");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    fetchPosts();
    onRefreshReady(fetchPosts);
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card-3d" style={{ padding: "1.25rem", opacity: 1 - i * 0.2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div className="skeleton-3d" style={{ width: "3rem", height: "3rem", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-3d" style={{ height: "0.875rem", width: "40%", marginBottom: "0.5rem" }} />
                <div className="skeleton-3d" style={{ height: "0.75rem", width: "25%" }} />
              </div>
            </div>
            <div className="skeleton-3d" style={{ height: "0.875rem", width: "100%", marginBottom: "0.5rem" }} />
            <div className="skeleton-3d" style={{ height: "0.875rem", width: "80%", marginBottom: "0.5rem" }} />
            <div className="skeleton-3d" style={{ height: "0.875rem", width: "60%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-3d danger-zone-3d" style={{ padding: "1.5rem", textAlign: "center" }}>
        <p style={{ color: "oklch(0.75 0.22 25)", marginBottom: "0.75rem", fontWeight: 500 }}>⚠️ {error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchPosts();
          }}
          className="btn-3d-ghost"
        >
          🔄 Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card-3d" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{
          fontSize: "3rem",
          marginBottom: "1rem",
          animation: "float 3s ease-in-out infinite",
        }}>
          🌐
        </div>
        <p style={{ color: "oklch(0.6 0.04 265)", fontWeight: 500 }}>
          No posts yet. Be the first to share!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {posts.map((post, index) => {
        const isOwner = currentUserId === post.userId;
        const profileHref = post.username
          ? `/profile/${post.username}`
          : null;

        const staggerClass = `stagger-${Math.min(index + 1, 5)}`;

        return (
          <article
            key={post.id}
            className={`card-3d ${staggerClass}`}
            style={{ padding: "1.25rem 1.25rem 1rem" }}
          >
            {/* Author row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {profileHref ? (
                <Link href={profileHref} style={{ flexShrink: 0 }}>
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.name}
                      className="avatar-3d"
                      style={{ width: "3rem", height: "3rem", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="avatar-placeholder-3d"
                      style={{ width: "3rem", height: "3rem", fontSize: "1.125rem" }}
                    >
                      {post.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              ) : post.image ? (
                <img
                  src={post.image}
                  alt={post.name}
                  className="avatar-3d"
                  style={{ width: "3rem", height: "3rem", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div
                  className="avatar-placeholder-3d"
                  style={{ width: "3rem", height: "3rem", fontSize: "1.125rem", flexShrink: 0 }}
                >
                  {post.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                {profileHref ? (
                  <Link
                    href={profileHref}
                    style={{
                      fontWeight: 700,
                      color: "oklch(0.92 0.02 265)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.75 0.2 270)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.92 0.02 265)")}
                  >
                    {post.name}
                  </Link>
                ) : (
                  <p style={{ fontWeight: 700, color: "oklch(0.92 0.02 265)" }}>{post.name}</p>
                )}

                {post.username && (
                  <p style={{ fontSize: "0.8125rem", color: "oklch(0.55 0.05 270)" }}>
                    @{post.username}
                  </p>
                )}
              </div>
            </div>

            {/* Content / Edit area */}
            {editingId === post.id ? (
              <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label className="sr-only" htmlFor={`edit-post-${post.id}`}>
                  Edit post
                </label>
                <textarea
                  id={`edit-post-${post.id}`}
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  className="input-3d"
                  rows={4}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button
                    type="button"
                    disabled={savingId === post.id}
                    onClick={() => handleSaveEdit(post.id)}
                    className="btn-3d-primary"
                  >
                    {savingId === post.id ? "⏳ Saving…" : "💾 Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn-3d-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                style={{
                  marginTop: "1rem",
                  whiteSpace: "pre-wrap",

                  lineHeight: 1.65,
                  color: "oklch(0.85 0.02 265)",
                  fontSize: "0.9375rem",
                }}
              >
                {post.content}
              </p>
            )}

            {/* Timestamp */}
            <p style={{ marginTop: "0.625rem", fontSize: "0.75rem", color: "oklch(0.45 0.03 265)" }}>
              🕐 {formatTimestamp(post.createdAt)}
            </p>

            {/* Like count */}
            <div
              style={{
                marginTop: "0.875rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid oklch(0.22 0.04 265 / 50%)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "oklch(0.55 0.06 25)" }}>❤️</span>
              <span style={{ fontSize: "0.8125rem", color: "oklch(0.6 0.04 265)", fontWeight: 500 }}>
                {post.likeCount} {post.likeCount === 1 ? "Like" : "Likes"}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                disabled={likingId === post.id}
                aria-pressed={post.isLiked}
                className={`btn-3d-ghost like-btn-3d ${post.isLiked ? "liked" : ""}`}
              >
                {post.isLiked ? "❤️ Liked" : "🤍 Like"}
              </button>

              <Link
                href={`/post/${post.id}`}
                className="btn-3d-ghost"
                style={{ textDecoration: "none" }}
              >
                💬 Comment
              </Link>

              {isOwner && editingId !== post.id && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(post.id);
                    setEditContent(post.content);
                  }}
                  className="btn-3d-ghost"
                >
                  ✏️ Edit
                </button>
              )}

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(post.id)}
                  className="btn-3d-danger"
                >
                  🗑️ Delete
                </button>
              )}
            </div>

            {/* Delete confirmation */}
            {confirmDeleteId === post.id && (
              <div className="danger-zone-3d" style={{ marginTop: "1rem" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "oklch(0.78 0.2 25)", marginBottom: "0.75rem" }}>
                  ⚠️ Delete this post? This cannot be undone.
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    disabled={deletingId === post.id}
                    onClick={() => handleDelete(post.id)}
                    className="btn-3d-danger"
                    style={{ fontSize: "0.8125rem", padding: "0.375rem 0.75rem" }}
                  >
                    {deletingId === post.id ? "⏳ Deleting…" : "✓ Confirm delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="btn-3d-ghost"
                    style={{ fontSize: "0.8125rem", padding: "0.375rem 0.75rem" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
