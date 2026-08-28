import { db } from "@/db";
import { user } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query =
      searchParams.get("q")?.trim() || "";

    if (!query) {
      return Response.json({
        success: true,
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
        or(
          ilike(user.name, `%${query}%`),
          ilike(user.username, `%${query}%`)
        )
      )
      .limit(10);

    return Response.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("SEARCH_USERS_ERROR:", error);

    return Response.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}