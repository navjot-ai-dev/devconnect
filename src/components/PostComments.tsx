"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CommentForm from "@/components/CommentForm";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";

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
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-bold">Comments</h2>

      <CommentForm postId={postId} onCommentCreated={fetchComments} />

      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="text-gray-500">No comments yet.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border p-4">
              <div className="flex items-center gap-3">
                {comment.username ? (
                  <Link href={`/profile/${comment.username}`}>
                    {comment.image ? (
                      <img
                        src={comment.image}
                        alt={comment.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                ) : comment.image ? (
                  <img
                    src={comment.image}
                    alt={comment.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  {comment.username ? (
                    <Link
                      href={`/profile/${comment.username}`}
                      className="font-medium hover:underline"
                    >
                      {comment.name}
                    </Link>
                  ) : (
                    <p className="font-medium">{comment.name}</p>
                  )}

                  {comment.username && (
                    <p className="text-xs text-gray-500">
                      @{comment.username}
                    </p>
                  )}
                </div>
              </div>

              {editingId === comment.id ? (
                <div className="mt-3 space-y-2">
                  <label
                    className="sr-only"
                    htmlFor={`edit-comment-${comment.id}`}
                  >
                    Edit comment
                  </label>
                  <textarea
                    id={`edit-comment-${comment.id}`}
                    value={editContent}
                    onChange={(event) => setEditContent(event.target.value)}
                    className="w-full rounded-lg border p-3"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={savingId === comment.id}
                      onClick={() => handleSaveEdit(comment.id)}
                      className="rounded-lg bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
                    >
                      {savingId === comment.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border px-3 py-1 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </p>

              {comment.userId === currentUserId && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {editingId !== comment.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(comment.id)}
                    disabled={deletingId === comment.id}
                    className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              )}

              {confirmDeleteId === comment.id && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-800">
                    Delete this comment?
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={deletingId === comment.id}
                      onClick={() => handleDelete(comment.id)}
                      className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
                    >
                      {deletingId === comment.id
                        ? "Deleting..."
                        : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg border bg-white px-3 py-1 text-sm"
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
