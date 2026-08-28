"use client";

import { useRef } from "react";

import CreatePost from "@/components/CreatePost";
import PostFeed from "@/components/PostFeed";

export default function Home() {
  const refreshFeed = useRef<(() => void) | null>(null);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <CreatePost
        onPostCreated={() => {
          refreshFeed.current?.();
        }}
      />

      <PostFeed
        onRefreshReady={(refresh) => {
          refreshFeed.current = refresh;
        }}
      />
    </main>
  );
}