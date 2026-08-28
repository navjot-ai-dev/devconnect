"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  username: string | null;
  name: string;
  image: string | null;
};

type Post = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
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

  const [comments, setComments] = useState<
    Record<string, Comment[]>
  >({});

  const [commentText, setCommentText] = useState<
    Record<string, string>
  >({});

  const [loadingComments, setLoadingComments] = useState<
    string | null
  >(null);

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

  // ========================
  // DELETE POST
  // ========================

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

  // ========================
  // LIKE POST
  // ========================

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

      await fetchPosts();
    } catch (error) {
      console.error("LIKE POST ERROR:", error);
    }
  }

  // ========================
  // GET COMMENTS
  // ========================

  async function fetchComments(postId: string) {
    setLoadingComments(postId);

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments`
      );

      const data = await response.json();

      if (data.success) {
        setComments((current) => ({
          ...current,
          [postId]: data.comments,
        }));
      }
    } catch (error) {
      console.error("GET COMMENTS ERROR:", error);
    } finally {
      setLoadingComments(null);
    }
  }

  // ========================
  // CREATE COMMENT
  // ========================

  async function handleComment(postId: string) {
    const content = commentText[postId]?.trim();

    if (!content) return;

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create comment");
        return;
      }

      setCommentText((current) => ({
        ...current,
        [postId]: "",
      }));

      await fetchComments(postId);
    } catch (error) {
      console.error("CREATE COMMENT ERROR:", error);
    }
  }

  // ========================
  // INITIAL LOAD
  // ========================

  useEffect(() => {
    fetchPosts();
    onRefreshReady(fetchPosts);
  }, []);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-xl border p-4 shadow-sm"
        >
          {/* USER */}

          <p className="text-sm text-gray-500">
            User: {post.userId}
          </p>

          {/* POST */}

          <p className="mt-2">
            {post.content}
          </p>

          {/* DATE */}

          <p className="mt-2 text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </p>

          {/* ACTIONS */}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleLike(post.id)}
              className="rounded-lg border px-3 py-1 text-sm"
            >
              {post.isLiked
                ? "❤️ Liked"
                : "🤍 Like"}{" "}
              {post.likeCount}
            </button>

            <button
              onClick={() => {
                fetchComments(post.id);
              }}
              className="rounded-lg border px-3 py-1 text-sm"
            >
              💬 Comments
            </button>

            <button
              onClick={() => handleDelete(post.id)}
              className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white"
            >
              Delete 🗑️
            </button>
          </div>

          {/* COMMENTS */}

          {comments[post.id] && (
            <div className="mt-4 space-y-3 border-t pt-4">
              {loadingComments === post.id ? (
                <p className="text-sm text-gray-500">
                  Loading comments...
                </p>
              ) : comments[post.id].length === 0 ? (
                <p className="text-sm text-gray-500">
                  No comments yet.
                </p>
              ) : (
                comments[post.id].map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg bg-gray-50 p-3"
                  >
                    <p className="text-sm font-semibold">
                      {comment.username ||
                        comment.name}
                    </p>

                    <p className="text-sm">
                      {comment.content}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(
                        comment.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                ))
              )}

              {/* ADD COMMENT */}

              <div className="flex gap-2">
                <input
                  value={commentText[post.id] || ""}
                  onChange={(event) =>
                    setCommentText((current) => ({
                      ...current,
                      [post.id]: event.target.value,
                    }))
                  }
                  placeholder="Write a comment..."
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                />

                <button
                  onClick={() =>
                    handleComment(post.id)
                  }
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                  Comment
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}