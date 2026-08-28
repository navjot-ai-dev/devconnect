"use client";

import { useEffect, useState } from "react";
import CommentForm from "@/components/CommentForm";

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
  const [comments, setComments] =
    useState<Comment[]>(initialComments);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  async function fetchComments() {
    try {
      const response = await fetch(
        `/api/comments/${postId}`
      );

      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error(
        "GET COMMENTS ERROR:",
        error
      );
    }
  }

  async function handleDelete(commentId: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    setDeletingId(commentId);

    try {
      const response = await fetch(
        `/api/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to delete comment"
        );
        return;
      }

      // Remove immediately from UI
      setComments((current) =>
        current.filter(
          (comment) =>
            comment.id !== commentId
        )
      );
    } catch (error) {
      console.error(
        "DELETE COMMENT ERROR:",
        error
      );
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  return (
    <section className="mt-8">

      {/* TITLE */}

      <h2 className="mb-4 text-xl font-bold">
        Comments
      </h2>

      {/* COMMENT FORM */}

      <CommentForm
        postId={postId}
        onCommentCreated={fetchComments}
      />

      {/* COMMENTS */}

      <div className="mt-6 space-y-4">

        {comments.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="text-gray-500">
              No comments yet.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-xl border p-4"
            >

              {/* AUTHOR */}

              <div className="flex items-center gap-3">

                {comment.image ? (
                  <img
                    src={comment.image}
                    alt={comment.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold">
                    {comment.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-medium">
                    {comment.name}
                  </p>

                  {comment.username && (
                    <p className="text-xs text-gray-500">
                      @{comment.username}
                    </p>
                  )}
                </div>

              </div>

              {/* COMMENT */}

              <p className="mt-3 whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* DATE */}

              <p className="mt-2 text-xs text-gray-400">
                {new Date(
                  comment.createdAt
                ).toLocaleString()}
              </p>

              {/* DELETE */}

              {comment.userId === currentUserId && (
                <button
                  onClick={() =>
                    handleDelete(comment.id)
                  }
                  disabled={
                    deletingId === comment.id
                  }
                  className="mt-3 rounded-lg bg-red-500 px-3 py-1 text-sm text-white disabled:opacity-50"
                >
                  {deletingId === comment.id
                    ? "Deleting..."
                    : "Delete 🗑️"}
                </button>
              )}

            </article>
          ))
        )}

      </div>
    </section>
  );
}