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
        alert(
          data.error ||
            "Failed to follow user"
        );
        return;
      }

      setFollowing(data.following);
    } catch (error) {
      console.error(
        "FOLLOW ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className="mt-6 rounded-lg bg-black px-5 py-2 text-white transition hover:opacity-80 disabled:opacity-50"
    >
      {loading
        ? "Loading..."
        : following
          ? "Following"
          : "Follow"}
    </button>
  );
}