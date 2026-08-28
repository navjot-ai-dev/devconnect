
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [message, setMessage] = useState("");

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
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

      setMessage("Profile updated successfully! ✅");

      router.refresh();
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 rounded-xl border p-6"
    >
      <h2 className="text-2xl font-bold">
        Edit Profile
      </h2>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Name
        </label>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border p-3"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Username
        </label>

        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full rounded-md border p-3"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Bio
        </label>

        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about yourself..."
          className="w-full rounded-md border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Profile Image URL
        </label>

        <input
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-md border p-3"
        />
      </div>

      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

