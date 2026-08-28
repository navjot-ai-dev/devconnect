
"use client";

import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  async function handleSignOut() {
    await authClient.signOut();

    window.location.href = "/sign-in";
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-6 rounded-md bg-red-500 px-5 py-3 text-white hover:bg-red-600"
    >
      Sign Out
    </button>
  );
}

