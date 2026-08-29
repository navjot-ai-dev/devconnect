import { db } from "../src/db";
import { user } from "../src/db/schema";

async function main() {
  const insertedUser = await db
    .insert(user)
    .values({
      id: "seed-user-sneha",
      name: "sneha",
      email: "sneha@example.com",
      username: "sneha",
      bio: "Frontend developer learning full stack development with Drizzle ORM and Neon",
    })
    .returning();

  console.log(insertedUser);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));