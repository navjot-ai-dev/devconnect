"use client";

import { useState } from "react";

type CommentFormProps = {
  postId: string;
  onCommentCreated: () => void;
};

export default function CommentForm({
  postId,
  onCommentCreated,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!content.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          postId,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create comment");
        return;
      }

      setContent("");

      onCommentCreated();
    } catch (error) {
      console.error("CREATE COMMENT ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border p-4"
    >
      <textarea
        value={content}
        onChange={(event) =>
          setContent(event.target.value)
        }
        placeholder="Write a comment..."
        rows={3}
        className="w-full resize-none rounded-lg border p-3 outline-none focus:ring-2"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Commenting..." : "Comment 💬"}
      </button>
    </form>
  );
}