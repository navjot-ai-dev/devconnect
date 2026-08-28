"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

type PostFeedProps = {
  onRefreshReady: (refresh: () => void) => void;
};

export default function PostFeed({
  onRefreshReady,
}: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  async function fetchPosts() {
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("GET POSTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(postId: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete post");
        return;
      }

      await fetchPosts();
    } catch (error) {
      console.error("DELETE POST ERROR:", error);
    }
  }

  async function handleLike(postId: string) {
    try {
      const response = await fetch(
        `/api/posts/${postId}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to like post");
        return;
      }

      setLikedPosts((current) => {
        if (data.liked) {
          return [...current, postId];
        }

        return current.filter((id) => id !== postId);
      });
    } catch (error) {
      console.error("LIKE POST ERROR:", error);
    }
  }

  useEffect(() => {
    fetchPosts();
    onRefreshReady(fetchPosts);
  }, []);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const isLiked = likedPosts.includes(post.id);

        return (
          <article
            key={post.id}
            className="rounded-xl border p-4 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              User: {post.userId}
            </p>

            <p className="mt-2">
              {post.content}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleString()}
            </p>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleLike(post.id)}
                className="rounded-lg border px-3 py-1 text-sm"
              >
                {isLiked ? "❤️ Liked" : "🤍 Like"}
              </button>

              <button
                onClick={() => handleDelete(post.id)}
                className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white"
              >
                Delete 🗑️
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}