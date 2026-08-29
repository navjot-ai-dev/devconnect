"use client";

import { useState } from "react";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";

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

    if (!content.trim()) {
      toast("Comment cannot be empty", "error");
      return;
    }

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

      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to create comment", "error");
        return;
      }

      setContent("");
      toast("Comment posted");
      onCommentCreated();
    } catch (error) {
      console.error("CREATE COMMENT ERROR:", error);
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border p-4">
      <label htmlFor="comment-content" className="sr-only">
        Write a comment
      </label>
      <textarea
        id="comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a comment..."
        rows={3}
        className="w-full resize-none rounded-lg border p-3 outline-none focus-visible:ring-2 focus-visible:ring-black"
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Commenting..." : "Comment"}
      </button>
    </form>
  );
}
