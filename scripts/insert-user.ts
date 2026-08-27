import { db } from "../src/db";
import { users } from "../src/db/schema";

async function main() {
  const user = await db
    .insert(users)
    .values({
      name: "sneha",
      email: "sneha@example.com",
      username: "sneha",
      bio: "Frontend developer learning full stack development with Drizzle ORM and Neon",
    })
    .returning();

  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));