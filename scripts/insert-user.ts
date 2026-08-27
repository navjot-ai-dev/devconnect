import { config } from "dotenv";

config({
  path: ".env.local",
});

import { db } from "../src/db/index";
import { users } from "../src/db/schema";

async function main() {
  const user = await db
    .insert(users)
    .values({
      name: "Navjot",
      email: "navjot@example.com",
      username: "navjot",
      bio: "Frontend developer learning full stack development",
    })
    .returning();

  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => process.exit());