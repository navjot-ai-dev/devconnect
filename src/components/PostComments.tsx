"use client";

import { useEffect, useState } from "react";
import CommentForm from "@/components/CommentForm";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  name: string;
  username: string | null;
  image: string | null;
};

type PostCommentsProps = {
  postId: string;
  initialComments: Comment[];
};

export default function PostComments({
  postId,
  initialComments,
}: PostCommentsProps) {
  const [comments, setComments] =
    useState<Comment[]>(initialComments);

  async function fetchComments() {
    try {
      const response = await fetch(
        `/api/comments/${postId}`
      );

      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error(
        "GET COMMENTS ERROR:",
        error
      );
    }
  }

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  return (
    <section className="mt-8">

      <h2 className="mb-4 text-xl font-bold">
        Comments
      </h2>

      {/* Comment Form */}

      <CommentForm
        postId={postId}
        onCommentCreated={fetchComments}
      />

      {/* Comments */}

      <div className="mt-6 space-y-4">

        {comments.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="text-gray-500">
              No comments yet.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-xl border p-4"
            >

              <div className="flex items-center gap-3">

                {comment.image ? (
                  <img
                    src={comment.image}
                    alt={comment.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold">
                    {comment.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-medium">
                    {comment.name}
                  </p>

                  {comment.username && (
                    <p className="text-xs text-gray-500">
                      @{comment.username}
                    </p>
                  )}
                </div>

              </div>

              <p className="mt-3 whitespace-pre-wrap">
                {comment.content}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {new Date(
                  comment.createdAt
                ).toLocaleString()}
              </p>

            </article>
          ))
        )}

      </div>
    </section>
  );
}