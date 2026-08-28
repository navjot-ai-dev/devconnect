import { db } from "@/db";
import { comments, posts, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  // Get post + author
  const [post] = await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,

      name: user.name,
      username: user.username,
      image: user.image,
    })
    .from(posts)
    .innerJoin(user, eq(posts.userId, user.id))
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) {
    notFound();
  }

  // Get comments + comment authors
  const postComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,

      name: user.name,
      username: user.username,
      image: user.image,
    })
    .from(comments)
    .innerJoin(user, eq(comments.userId, user.id))
    .where(eq(comments.postId, id))
    .orderBy(desc(comments.createdAt));

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">

        {/* Back */}

        <a
          href="/home"
          className="mb-6 inline-block text-sm text-gray-500 hover:underline"
        >
          ← Back to Home
        </a>

        {/* POST */}

        <article className="rounded-xl border bg-white p-6 shadow-sm">

          {/* Author */}

          <div className="flex items-center gap-3">

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

            <div>
              <p className="font-bold">
                {post.name}
              </p>

              {post.username && (
                <p className="text-sm text-gray-500">
                  @{post.username}
                </p>
              )}
            </div>

          </div>

          {/* Content */}

          <p className="mt-6 whitespace-pre-wrap text-lg">
            {post.content}
          </p>

          {/* Date */}

          <p className="mt-4 text-xs text-gray-400">
            {new Date(
              post.createdAt
            ).toLocaleString()}
          </p>

        </article>

        {/* COMMENTS */}

        <section className="mt-8">

          <h2 className="mb-4 text-xl font-bold">
            Comments
          </h2>

          {postComments.length === 0 ? (
            <div className="rounded-xl border p-6 text-center">
              <p className="text-gray-500">
                No comments yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {postComments.map((comment) => (
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
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}