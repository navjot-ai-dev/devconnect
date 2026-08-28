import { db } from "@/db";
import { comments, posts, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import PostComments from "@/components/PostComments";
import { auth } from "@/lib/auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // =========================
  // GET POST + AUTHOR
  // =========================

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

  // =========================
  // GET COMMENTS + AUTHORS
  // =========================

  const postComments = await db
    .select({
      id: comments.id,
      userId: comments.userId,
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

  const commentsForClient = postComments.map((comment) => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  }));

  // =========================
  // PAGE
  // =========================

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">

        {/* BACK */}

        <a
          href="/home"
          className="mb-6 inline-block text-sm text-gray-500 hover:underline"
        >
          ← Back to Home
        </a>

        {/* POST */}

        <article className="rounded-xl border bg-white p-6 shadow-sm">

          {/* AUTHOR */}

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

          {/* CONTENT */}

          <p className="mt-6 whitespace-pre-wrap text-lg">
            {post.content}
          </p>

          {/* DATE */}

          <p className="mt-4 text-xs text-gray-400">
            {new Date(
              post.createdAt
            ).toLocaleString()}
          </p>

        </article>

        {/* COMMENTS */}

        <PostComments
          postId={id}
          currentUserId={session?.user.id ?? ""}
          initialComments={commentsForClient}
        />

      </div>
    </main>
  );
}