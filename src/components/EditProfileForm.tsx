"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseResponseJson } from "@/lib/http";
import { toast } from "@/lib/toast";

type Props = {
  name: string;
  username: string;
  bio: string;
  image: string;
};

export default function EditProfileForm({
  name,
  username,
  bio,
  image,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    name,
    username,
    bio,
    image,
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await parseResponseJson(response);

      if (!response.ok) {
        toast(data.error || "Something went wrong", "error");
        return;
      }

      toast("Profile updated");
      router.refresh();
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 rounded-xl border p-4 sm:p-6"
    >
      <h2 className="text-2xl font-bold">Edit Profile</h2>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border p-3 focus-visible:ring-2 focus-visible:ring-black"
          required
        />
      </div>

      <div>
        <label
          htmlFor="username"
          className="mb-1 block text-sm font-medium"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full rounded-md border p-3 focus-visible:ring-2 focus-visible:ring-black"
          required
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1 block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about yourself..."
          className="w-full rounded-md border p-3 focus-visible:ring-2 focus-visible:ring-black"
        />
      </div>

      <div>
        <label htmlFor="image" className="mb-1 block text-sm font-medium">
          Profile Image URL
        </label>
        <input
          id="image"
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full rounded-md border p-3 focus-visible:ring-2 focus-visible:ring-black"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-5 py-3 text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
