import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or fewer")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be 500 characters or fewer")
    .optional()
    .nullable(),
  image: z
    .string()
    .trim()
    .max(2000, "Image URL is too long")
    .optional()
    .nullable(),
});

export const postContentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post content is required")
    .max(5000, "Post must be 5000 characters or fewer"),
});

export const commentContentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment content is required")
    .max(2000, "Comment must be 2000 characters or fewer"),
});

export function formatZodError(error: z.ZodError) {
  return error.issues[0]?.message || "Invalid input";
}
