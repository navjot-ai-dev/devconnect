"use client";

import { useState } from "react";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";

type CreatePostProps = {
  onPostCreated: () => void;
};

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      toast("Post cannot be empty", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/posts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to create post", "error");
        return;
      }

      setContent("");
      toast("Post created");
      onPostCreated();
    } catch (error) {
      console.error("CREATE POST ERROR:", error);
      toast("Failed to create post", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-3d"
      style={{ padding: "1.25rem" }}
    >
      <div
        style={{
          marginBottom: "0.875rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              width: "2rem",
              height: "2rem",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.625rem",
              background: "linear-gradient(135deg, oklch(0.75 0.2 270), oklch(0.78 0.22 300))",
              boxShadow: "0 10px 24px oklch(0.65 0.22 270 / 20%)",
            }}
          >
            ✍️
          </span>
          <span
            style={{
              fontSize: "1rem",
              background: "linear-gradient(135deg, oklch(0.75 0.2 270), oklch(0.78 0.22 300))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 700,
            }}
          >
            Share an update
          </span>
        </div>

        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "oklch(0.6 0.04 265)",
            border: "1px solid oklch(0.25 0.04 265 / 55%)",
            borderRadius: "9999px",
            padding: "0.3rem 0.6rem",
            background: "oklch(0.12 0.02 265 / 60%)",
          }}
        >
          Community
        </span>
      </div>

      <label htmlFor="post-content" className="sr-only">
        Create a post
      </label>
      <textarea
        id="post-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Share code, ideas, questions…"
        className="input-3d"
        rows={4}
      />

      <div style={{ marginTop: "0.875rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn-3d-primary"
        >
          {loading ? "⏳ Posting…" : "🚀 Publish"}
        </button>
      </div>
    </form>
  );
}
