"use client";

import { useState } from "react";

type FollowButtonProps = {
  userId: string;
  initialFollowing: boolean;
};

export default function FollowButton({
  userId,
  initialFollowing,
}: FollowButtonProps) {
  const [following, setFollowing] =
    useState(initialFollowing);

  const [loading, setLoading] =
    useState(false);

  async function handleFollow() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/users/${userId}/follow`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      setFollowing(data.following);
    } catch (error) {
      console.error("FOLLOW ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`mt-6 rounded-lg px-5 py-2 font-medium transition disabled:opacity-50 ${
        following
          ? "border border-gray-300 bg-white text-black hover:bg-gray-100"
          : "bg-black text-white hover:opacity-80"
      }`}
    >
      {loading
        ? "Loading..."
        : following
          ? "Following"
          : "Follow"}
    </button>
  );
}