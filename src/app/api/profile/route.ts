
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function PUT(request: Request) {
  try {
    // Get logged-in user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // User is not logged in
    if (!session) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get data from request
    const body = await request.json();

    const { name, username, bio, image } = body;

    // Basic validation
    if (!name || !username) {
      return Response.json(
        { error: "Name and username are required" },
        { status: 400 }
      );
    }

    // Update current user's profile
    const updatedUser = await db
      .update(user)
      .set({
        name,
        username,
        bio: bio || null,
        image: image || null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
      });

    return Response.json({
      success: true,
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);

    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

