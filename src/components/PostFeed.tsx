"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";

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

export default function PostFeed({ onRefreshReady }: PostFeedProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likingId, setLikingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const response = await fetch("/api/posts");
      const data = await parseResponseJson(response);

      if (!response.ok) {
        setError(data.error || "Failed to load posts");
        return;
      }

      setPosts(data.posts || []);
      setError("");
    } catch (err) {
      console.error("GET POSTS ERROR:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(postId: string) {
    setDeletingId(postId);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to delete post", "error");
        return;
      }

      setPosts((current) => current.filter((post) => post.id !== postId));
      setConfirmDeleteId(null);
      toast("Post deleted");
    } catch (err) {
      console.error("DELETE POST ERROR:", err);
      toast("Failed to delete post", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLike(postId: string) {
    if (likingId) return;
    setLikingId(postId);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to like post", "error");
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
                  : Math.max(0, post.likeCount - 1),
              }
            : post
        )
      );
    } catch (err) {
      console.error("LIKE POST ERROR:", err);
      toast("Failed to like post", "error");
    } finally {
      setLikingId(null);
    }
  }

  async function handleSaveEdit(postId: string) {
    if (!editContent.trim()) {
      toast("Post cannot be empty", "error");
      return;
    }

    setSavingId(postId);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Failed to update post", "error");
        return;
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, content: data.post.content }
            : post
        )
      );
      setEditingId(null);
      toast("Post updated");
    } catch (err) {
      console.error("UPDATE POST ERROR:", err);
      toast("Failed to update post", "error");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    fetchPosts();
    onRefreshReady(fetchPosts);
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading posts...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchPosts();
          }}
          className="mt-3 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-gray-500">No posts yet. Be the first to share.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => {
        const isOwner = currentUserId === post.userId;
        const profileHref = post.username
          ? `/profile/${post.username}`
          : null;

        return (
          <article
            key={post.id}
            className="rounded-xl border bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-center gap-3">
              {profileHref ? (
                <Link href={profileHref} className="shrink-0">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold">
                      {post.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
              ) : post.image ? (
                <img
                  src={post.image}
                  alt={post.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-bold">
                  {post.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    className="font-bold hover:underline"
                  >
                    {post.name}
                  </Link>
                ) : (
                  <p className="font-bold">{post.name}</p>
                )}

                {post.username && (
                  <p className="truncate text-sm text-gray-500">
                    @{post.username}
                  </p>
                )}
              </div>
            </div>

            {editingId === post.id ? (
              <div className="mt-5 space-y-3">
                <label className="sr-only" htmlFor={`edit-post-${post.id}`}>
                  Edit post
                </label>
                <textarea
                  id={`edit-post-${post.id}`}
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  className="w-full rounded-lg border p-3 focus-visible:ring-2 focus-visible:ring-black"
                  rows={4}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={savingId === post.id}
                    onClick={() => handleSaveEdit(post.id)}
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {savingId === post.id ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-5 whitespace-pre-wrap break-words">
                {post.content}
              </p>
            )}

            <p className="mt-3 text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleString()}
            </p>

            <div className="mt-4 border-t pt-3">
              <span className="text-sm text-gray-500">
                {post.likeCount} {post.likeCount === 1 ? "Like" : "Likes"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                disabled={likingId === post.id}
                aria-pressed={post.isLiked}
                className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50"
              >
                {post.isLiked ? "❤️ Liked" : "🤍 Like"}
              </button>

              <Link
                href={`/post/${post.id}`}
                className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-black"
              >
                💬 Comment
              </Link>

              {isOwner && editingId !== post.id && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(post.id);
                    setEditContent(post.content);
                  }}
                  className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-100"
                >
                  Edit
                </button>
              )}

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(post.id)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>

            {confirmDeleteId === post.id && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  Delete this post? This cannot be undone.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={deletingId === post.id}
                    onClick={() => handleDelete(post.id)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    {deletingId === post.id ? "Deleting..." : "Confirm delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-lg border bg-white px-3 py-1.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
