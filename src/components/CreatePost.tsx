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
      className="space-y-3 rounded-xl border bg-white p-4 sm:p-5"
    >
      <label htmlFor="post-content" className="sr-only">
        Create a post
      </label>
      <textarea
        id="post-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full rounded-lg border p-3 focus-visible:ring-2 focus-visible:ring-black"
        rows={4}
      />

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="rounded-lg bg-black px-5 py-2 text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
