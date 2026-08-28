"use client";

import { useState } from "react";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) return;

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

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create post");
        return;
      }

      console.log("POST CREATED:", data);

      setContent("");
    } catch (error) {
      console.error("CREATE POST ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full rounded-lg border p-3"
        rows={4}
      />

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="rounded-lg bg-black px-5 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post 🚀"}
      </button>
    </form>
  );
}