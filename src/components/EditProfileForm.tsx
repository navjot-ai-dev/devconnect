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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "oklch(0.65 0.08 270)",
    marginBottom: "0.375rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-3d"
      style={{ marginTop: "2rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      <h2
        style={{
          fontSize: "1.375rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, oklch(0.75 0.2 270), oklch(0.78 0.22 300))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        ✏️ Edit Profile
      </h2>

      <div>
        <label htmlFor="name" style={labelStyle}>
          Name
        </label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input-3d"
          required
        />
      </div>

      <div>
        <label htmlFor="username" style={labelStyle}>
          Username
        </label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="input-3d"
          required
        />
      </div>

      <div>
        <label htmlFor="bio" style={labelStyle}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about yourself…"
          className="input-3d"
        />
      </div>

      <div>
        <label htmlFor="image" style={labelStyle}>
          Profile Image URL
        </label>
        <input
          id="image"
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="https://…"
          className="input-3d"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="btn-3d-primary"
          style={{ padding: "0.625rem 1.75rem", fontWeight: 700 }}
        >
          {loading ? "⏳ Saving…" : "💾 Save Changes"}
        </button>
      </div>
    </form>
  );
}
