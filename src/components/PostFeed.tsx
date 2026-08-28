"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;

  name: string;
  username: string | null;
  image: string | null;

  likeCount: number;
  isLiked: boolean;
};

type PostFeedProps = {
  onRefreshReady: (refresh: () => void) => void;
};

export default function PostFeed({
  onRefreshReady,
}: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // GET POSTS
  // =========================

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

  // =========================
  // DELETE POST
  // =========================

  async function handleDelete(postId: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/posts/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error || "Failed to delete post"
        );
        return;
      }

      await fetchPosts();
    } catch (error) {
      console.error(
        "DELETE POST ERROR:",
        error
      );
    }
  }

  // =========================
  // LIKE POST
  // =========================

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
        alert(
          data.error || "Failed to like post"
        );
        return;
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: data.liked,
                likeCount: data.liked
                  ? post.likeCount + 1
                  : Math.max(
                      0,
                      post.likeCount - 1
                    ),
              }
            : post
        )
      );
    } catch (error) {
      console.error(
        "LIKE POST ERROR:",
        error
      );
    }
  }

  // =========================
  // LOAD POSTS
  // =========================

  useEffect(() => {
    fetchPosts();
    onRefreshReady(fetchPosts);
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <p className="text-gray-500">
        Loading posts...
      </p>
    );
  }

  // =========================
  // EMPTY
  // =========================

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-gray-500">
          No posts yet.
        </p>
      </div>
    );
  }

  // =========================
  // FEED
  // =========================

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-xl border bg-white p-5 shadow-sm"
        >

          {/* USER */}

          <div className="flex items-center gap-3">

            {post.image ? (
              <img
                src={post.image}
                alt={post.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold">
                {post.name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              {post.username ? (
                <Link
                  href={`/profile/${post.username}`}
                  className="font-bold hover:underline"
                >
                  {post.name}
                </Link>
              ) : (
                <p className="font-bold">
                  {post.name}
                </p>
              )}

              {post.username && (
                <p className="text-sm text-gray-500">
                  @{post.username}
                </p>
              )}
            </div>

          </div>

          {/* CONTENT */}

          <p className="mt-5 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* TIME */}

          <p className="mt-3 text-xs text-gray-400">
            {new Date(
              post.createdAt
            ).toLocaleString()}
          </p>

          {/* STATS */}

          <div className="mt-4 border-t pt-3">

            <span className="text-sm text-gray-500">
              ❤️ {post.likeCount}{" "}
              {post.likeCount === 1
                ? "Like"
                : "Likes"}
            </span>

          </div>

          {/* ACTIONS */}

          <div className="mt-3 flex gap-3">

            <button
              onClick={() =>
                handleLike(post.id)
              }
              className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-100"
            >
              {post.isLiked
                ? "❤️ Liked"
                : "🤍 Like"}
            </button>

            <Link
              href={`/post/${post.id}`}
              className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-100"
            >
              💬 Comment
            </Link>

            <button
              onClick={() =>
                handleDelete(post.id)
              }
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
            >
              🗑️ Delete
            </button>

          </div>

        </article>
      ))}
    </div>
  );
}