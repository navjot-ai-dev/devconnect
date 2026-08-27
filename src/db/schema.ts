import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  }).notNull().unique(),

  username: varchar("username", {
    length: 50,
  }).notNull().unique(),

  bio: text("bio"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});