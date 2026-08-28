
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Welcome, {session.user.name}! 🚀
      </h1>

      <p className="mt-2 text-gray-600">
        You are successfully logged in.
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <p>
          <strong>Name:</strong> {session.user.name}
        </p>

        <p>
          <strong>Email:</strong> {session.user.email}
        </p>

        <p>
          <strong>User ID:</strong> {session.user.id}
        </p>
      </div>
    </main>
  );
}

