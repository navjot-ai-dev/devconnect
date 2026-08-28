
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import EditProfileForm from "@/components/EditProfileForm";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const [profile] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">
          My Profile 👤
        </h1>

        <div className="mt-6 rounded-xl border p-6">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div>
              <p className="text-sm text-gray-500">
                Name
              </p>
              <p className="text-lg font-medium">
                {profile.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>
              <p className="text-lg font-medium">
                {profile.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Username
              </p>
              <p className="text-lg font-medium">
                {profile.username || "Not set"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Bio
              </p>
              <p className="text-lg">
                {profile.bio || "No bio yet"}
              </p>
            </div>
          </div>
        </div>

        <EditProfileForm
          name={profile.name}
          username={profile.username ?? ""}
          bio={profile.bio ?? ""}
          image={profile.image ?? ""}
        />
      </div>
    </main>
  );
}

