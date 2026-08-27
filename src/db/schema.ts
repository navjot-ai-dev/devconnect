import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

// ====================
// USERS
// ====================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  username: varchar("username", { length: 50 })
    .notNull()
    .unique(),

  bio: text("bio"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


// ====================
// POSTS
// ====================

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  content: text("content").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


// ====================
// COMMENTS
// ====================

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),

  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, {
      onDelete: "cascade",
    }),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  content: text("content").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


// ====================
// LIKES
// ====================

export const likes = pgTable(
  "likes",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },

  (table) => [
    primaryKey({
      columns: [table.postId, table.userId],
    }),
  ]
);


// ====================
// FOLLOWS
// ====================

export const follows = pgTable(
  "follows",
  {
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    followingId: integer("following_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },

  (table) => [
    primaryKey({
      columns: [table.followerId, table.followingId],
    }),
  ]
);