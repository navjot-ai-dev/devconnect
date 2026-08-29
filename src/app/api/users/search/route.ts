import { db } from "@/db";
import { user } from "@/db/schema";
import { jsonError, jsonSuccess } from "@/lib/http";
import { ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return jsonSuccess({
        users: [],
      });
    }

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio,
      })
      .from(user)
      .where(
        or(ilike(user.name, `%${q}%`), ilike(user.username, `%${q}%`))
      )
      .limit(20);

    return jsonSuccess({
      users,
    });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    return jsonError("Failed to search users", 500);
  }
}
