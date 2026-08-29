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
    <form onSubmit={handleSubmit} className="card-3d" style={{ padding: "1rem" }}>
      <label htmlFor="comment-content" className="sr-only">
        Write a comment
      </label>
      <textarea
        id="comment-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a comment…"
        rows={3}
        className="input-3d"
        style={{ resize: "none" }}
        disabled={loading}
      />

      <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn-3d-primary"
          style={{ fontSize: "0.875rem" }}
        >
          {loading ? "⏳ Commenting…" : "💬 Comment"}
        </button>
      </div>
    </form>
  );
}
