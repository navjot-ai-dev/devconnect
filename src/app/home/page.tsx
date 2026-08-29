"use client";

import { useRef } from "react";
import CreatePost from "@/components/CreatePost";
import PostFeed from "@/components/PostFeed";

export default function HomePage() {
  const refreshPosts = useRef<() => void>(() => {});

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="page-shell mb-6 overflow-hidden">
          <div className="hero-panel">
            <div className="space-y-3">
              <span className="chip">Developer network</span>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  DevConnect
                </h1>
                <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
                  Share ideas, spark conversations, and build with people who love shipping.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5">
                Build
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5">
                Share
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5">
                Learn
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <CreatePost
            onPostCreated={() => {
              refreshPosts.current();
            }}
          />
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Latest Posts
            </h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
              Live feed
            </span>
          </div>

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
