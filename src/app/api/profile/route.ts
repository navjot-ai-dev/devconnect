import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { jsonError, jsonSuccess, readJson } from "@/lib/http";
import {
  formatZodError,
  profileUpdateSchema,
} from "@/lib/validations";
import { and, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";

const profileSelect = {
  id: user.id,
  name: user.name,
  email: user.email,
  username: user.username,
  bio: user.bio,
  image: user.image,
  updatedAt: user.updatedAt,
};

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const [profile] = await db
      .select(profileSelect)
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!profile) {
      return jsonError("User not found", 404);
    }

    return jsonSuccess({
      user: profile,
    });
  } catch (error) {
    console.error("GET_PROFILE_ERROR:", error);

    return jsonError("Failed to get profile", 500);
  }
}

async function updateCurrentUserProfile(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const parsed = await readJson<unknown>(request);

  if (!parsed.ok) {
    return parsed.response;
  }

  const parsedProfile = profileUpdateSchema.safeParse(parsed.data);

  if (!parsedProfile.success) {
    return jsonError(formatZodError(parsedProfile.error), 400);
  }

  const { name, username, bio, image } = parsedProfile.data;
  const normalizedUsername = username.toLowerCase();

  const [usernameTaken] = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.username, normalizedUsername),
        ne(user.id, session.user.id)
      )
    )
    .limit(1);

  if (usernameTaken) {
    return jsonError("Username is already taken", 409);
  }

  const imageValue =
    !image || image.length === 0
      ? null
      : image.startsWith("http://") || image.startsWith("https://")
        ? image
        : null;

  if (image && image.length > 0 && !imageValue) {
    return jsonError("Profile image must be a valid http(s) URL", 400);
  }

  const [updatedUser] = await db
    .update(user)
    .set({
      name,
      username: normalizedUsername,
      bio: bio || null,
      image: imageValue,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id))
    .returning(profileSelect);

  return jsonSuccess({
    user: updatedUser,
    message: "Profile updated",
  });
}

export async function PATCH(request: Request) {
  try {
    return await updateCurrentUserProfile(request);
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);

    return jsonError("Failed to update profile", 500);
  }
}

export async function PUT(request: Request) {
  try {
    return await updateCurrentUserProfile(request);
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);

    return jsonError("Failed to update profile", 500);
  }
}
