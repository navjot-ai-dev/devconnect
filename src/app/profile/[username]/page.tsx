
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: Props) {
  const { username } = await params;

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border p-6">
          {/* Profile Image */}
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name */}
          <h1 className="mt-4 text-3xl font-bold">
            {profile.name}
          </h1>

          {/* Username */}
          <p className="text-gray-500">
            @{profile.username}
          </p>

          {/* Bio */}
          <p className="mt-4">
            {profile.bio || "No bio yet."}
          </p>

          {/* Stats */}
          <div className="mt-6 flex gap-8">
            <div>
              <p className="font-bold">0</p>
              <p className="text-sm text-gray-500">
                Posts
              </p>
            </div>

            <div>
              <p className="font-bold">0</p>
              <p className="text-sm text-gray-500">
                Followers
              </p>
            </div>

            <div>
              <p className="font-bold">0</p>
              <p className="text-sm text-gray-500">
                Following
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

