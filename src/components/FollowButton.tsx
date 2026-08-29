"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";

type FollowButtonProps = {
  userId: string;
  initialFollowing: boolean;
};

export default function FollowButton({
  userId,
  initialFollowing,
}: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function handleFollow() {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        credentials: "include",
      });
      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Something went wrong", "error");
        return;
      }

      setFollowing(data.following);
      toast(data.following ? "Followed" : "Unfollowed");
      router.refresh();
    } catch (error) {
      console.error("FOLLOW ERROR:", error);
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleFollow}
      disabled={loading}
      aria-pressed={following}
      className={`mt-6 rounded-lg px-5 py-2 font-medium transition focus-visible:ring-2 focus-visible:ring-black disabled:opacity-50 ${
        following
          ? "border border-gray-300 bg-white text-black hover:bg-gray-100"
          : "bg-black text-white hover:opacity-80"
      }`}
    >
      {loading ? "Loading..." : following ? "Following" : "Follow"}
    </button>
  );
}
