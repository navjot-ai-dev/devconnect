
import { db } from "@/db";
import { user } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim();

    if (!q) {
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
          ilike(user.name, `%${q}%`),
          ilike(user.username, `%${q}%`)
        )
      )
      .limit(20);

    return Response.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "SEARCH USERS ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to search users",
      },
      { status: 500 }
    );
  }
}

