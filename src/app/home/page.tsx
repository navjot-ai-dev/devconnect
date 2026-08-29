"use client";

import { useRef } from "react";
import CreatePost from "@/components/CreatePost";
import PostFeed from "@/components/PostFeed";

export default function HomePage() {
  const refreshPosts = useRef<() => void>(() => {});

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-2xl font-bold sm:text-3xl">
          DevConnect 🚀
        </h1>

        <p className="mt-2 text-gray-500">
          Share your ideas with developers.
        </p>

        {/* Create Post */}

        <div className="mt-6">
          <CreatePost
            onPostCreated={() => {
              refreshPosts.current();
            }}
          />
        </div>

        {/* Posts */}

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">
            Latest Posts
          </h2>

          <PostFeed
            onRefreshReady={(refresh) => {
              refreshPosts.current = refresh;
            }}
          />
        </section>

      </div>
    </main>
  );
}