"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CommentForm from "@/components/CommentForm";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";
import { formatTimestamp } from "@/lib/utils";

type Comment = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  name: string;
  username: string | null;
  image: string | null;
};

type PostCommentsProps = {
  postId: string;
  initialComments: Comment[];
  currentUserId: string;
};

export default function PostComments({
  postId,
  initialComments,
  currentUserId,
}: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(
    null
  );

  async function fetchComments() {
    try {
      const response = await fetch(`/api/comments/${postId}`);
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to load comments", "error");
        return;
      }

      setComments(data.comments || []);
    } catch (error) {
      console.error("GET COMMENTS ERROR:", error);
      toast("Failed to load comments", "error");
    }
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to delete comment", "error");
        return;
      }

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId)
      );
      setConfirmDeleteId(null);
      toast("Comment deleted");
    } catch (error) {
      console.error("DELETE COMMENT ERROR:", error);
      toast("Failed to delete comment", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaveEdit(commentId: string) {
    if (!editContent.trim()) {
      toast("Comment cannot be empty", "error");
      return;
    }

    setSavingId(commentId);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to update comment", "error");
        return;
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: data.comment.content }
            : comment
        )
      );
      setEditingId(null);
      toast("Comment updated");
    } catch (error) {
      console.error("UPDATE COMMENT ERROR:", error);
      toast("Failed to update comment", "error");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2
        style={{
          marginBottom: "1rem",
          fontSize: "1.25rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, oklch(0.75 0.2 270), oklch(0.78 0.22 300))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        💬 Comments
      </h2>

      <CommentForm postId={postId} onCommentCreated={fetchComments} />

      <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {comments.length === 0 ? (
          <div className="card-3d" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem", animation: "float 3s ease-in-out infinite" }}>
              💭
            </div>
            <p style={{ color: "oklch(0.6 0.04 265)", fontWeight: 500 }}>
              No comments yet. Be the first!
            </p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <article
              key={comment.id}
              className={`card-3d stagger-${Math.min(index + 1, 5)}`}
              style={{ padding: "1rem" }}
            >
              {/* Author row */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                {comment.username ? (
                  <Link href={`/profile/${comment.username}`} style={{ flexShrink: 0 }}>
                    {comment.image ? (
                      <img
                        src={comment.image}
                        alt={comment.name}
                        className="avatar-3d"
                        style={{ width: "2.5rem", height: "2.5rem", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="avatar-placeholder-3d"
                        style={{ width: "2.5rem", height: "2.5rem", fontSize: "1rem" }}
                      >
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                ) : comment.image ? (
                  <img
                    src={comment.image}
                    alt={comment.name}
                    className="avatar-3d"
                    style={{ width: "2.5rem", height: "2.5rem", objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    className="avatar-placeholder-3d"
                    style={{ width: "2.5rem", height: "2.5rem", fontSize: "1rem", flexShrink: 0 }}
                  >
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  {comment.username ? (
                    <Link
                      href={`/profile/${comment.username}`}
                      style={{ fontWeight: 700, color: "oklch(0.9 0.02 265)", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.75 0.2 270)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.9 0.02 265)")}
                    >
                      {comment.name}
                    </Link>
                  ) : (
                    <p style={{ fontWeight: 600, color: "oklch(0.9 0.02 265)" }}>{comment.name}</p>
                  )}

                  {comment.username && (
                    <p style={{ fontSize: "0.75rem", color: "oklch(0.55 0.05 270)" }}>
                      @{comment.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Content / Edit */}
              {editingId === comment.id ? (
                <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="sr-only" htmlFor={`edit-comment-${comment.id}`}>
                    Edit comment
                  </label>
                  <textarea
                    id={`edit-comment-${comment.id}`}
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                    className="input-3d"
                    rows={3}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      disabled={savingId === comment.id}
                      onClick={() => handleSaveEdit(comment.id)}
                      className="btn-3d-primary"
                      style={{ fontSize: "0.8125rem", padding: "0.375rem 0.75rem" }}
                    >
                      {savingId === comment.id ? "⏳ Saving…" : "💾 Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn-3d-ghost"
                      style={{ fontSize: "0.8125rem", padding: "0.375rem 0.75rem" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    marginTop: "0.625rem",
                    whiteSpace: "pre-wrap",

                    lineHeight: 1.6,
                    color: "oklch(0.82 0.02 265)",
                    fontSize: "0.9rem",
                  }}
                >
                  {comment.content}
                </p>
              )}

              <p style={{ marginTop: "0.375rem", fontSize: "0.725rem", color: "oklch(0.45 0.03 265)" }}>
                🕐 {formatTimestamp(comment.createdAt)}
              </p>

              {comment.userId === currentUserId && (
                <div style={{ marginTop: "0.625rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {editingId !== comment.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="btn-3d-ghost"
                      style={{ fontSize: "0.8125rem", padding: "0.3rem 0.75rem" }}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(comment.id)}
                    disabled={deletingId === comment.id}
                    className="btn-3d-danger"
                    style={{ fontSize: "0.8125rem", padding: "0.3rem 0.75rem" }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}

              {confirmDeleteId === comment.id && (
                <div className="danger-zone-3d" style={{ marginTop: "0.75rem" }}>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "oklch(0.78 0.2 25)", marginBottom: "0.625rem" }}>
                    ⚠️ Delete this comment?
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      disabled={deletingId === comment.id}
                      onClick={() => handleDelete(comment.id)}
                      className="btn-3d-danger"
                      style={{ fontSize: "0.8125rem", padding: "0.3rem 0.625rem" }}
                    >
                      {deletingId === comment.id ? "⏳ Deleting…" : "✓ Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="btn-3d-ghost"
                      style={{ fontSize: "0.8125rem", padding: "0.3rem 0.625rem" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
