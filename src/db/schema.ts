
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

// ====================
// BETTER AUTH — USER
// ====================

export const user = pgTable("user", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  emailVerified: boolean("email_verified")
    .default(false)
    .notNull(),

  image: text("image"),

  // DevConnect profile fields
  username: text("username").unique(),

  bio: text("bio"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ====================
// BETTER AUTH — SESSION
// ====================

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    expiresAt: timestamp("expires_at").notNull(),

    token: text("token").notNull().unique(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
  ],
);

// ====================
// BETTER AUTH — ACCOUNT
// ====================

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),

    accountId: text("account_id").notNull(),

    providerId: text("provider_id").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    accessToken: text("access_token"),

    refreshToken: text("refresh_token"),

    idToken: text("id_token"),

    accessTokenExpiresAt: timestamp(
      "access_token_expires_at"
    ),

    refreshTokenExpiresAt: timestamp(
      "refresh_token_expires_at"
    ),

    scope: text("scope"),

    password: text("password"),

    // Required by your Better Auth version
    issuer: text("issuer"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
  ],
);

// ====================
// BETTER AUTH — VERIFICATION
// ====================

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),

    identifier: text("identifier").notNull(),

    value: text("value").notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("verification_identifier_idx").on(
      table.identifier
    ),
  ],
);

// ====================
// POSTS
// ====================

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
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
  id: text("id").primaryKey(),

  postId: text("post_id")
    .notNull()
    .references(() => posts.id, {
      onDelete: "cascade",
    }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
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
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
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
  ],
);

// ====================
// FOLLOWS
// ====================

export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    followingId: text("following_id")
      .notNull()
      .references(() => user.id, {
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
  ],
);

// ====================
// RELATIONS
// ====================

export const userRelations = relations(
  user,
  ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    posts: many(posts),
    comments: many(comments),
    likes: many(likes),

    followers: many(follows, {
      relationName: "followers",
    }),

    following: many(follows, {
      relationName: "following",
    }),
  })
);

export const sessionRelations = relations(
  session,
  ({ one }) => ({
    user: one(user, {
      fields: [session.userId],
      references: [user.id],
    }),
  })
);

export const accountRelations = relations(
  account,
  ({ one }) => ({
    user: one(user, {
      fields: [account.userId],
      references: [user.id],
    }),
  })
);

export const postRelations = relations(
  posts,
  ({ one, many }) => ({
    user: one(user, {
      fields: [posts.userId],
      references: [user.id],
    }),

    comments: many(comments),
    likes: many(likes),
  })
);

export const commentRelations = relations(
  comments,
  ({ one }) => ({
    user: one(user, {
      fields: [comments.userId],
      references: [user.id],
    }),

    post: one(posts, {
      fields: [comments.postId],
      references: [posts.id],
    }),
  })
);

export const likeRelations = relations(
  likes,
  ({ one }) => ({
    user: one(user, {
      fields: [likes.userId],
      references: [user.id],
    }),

    post: one(posts, {
      fields: [likes.postId],
      references: [posts.id],
    }),
  })
);

export const followRelations = relations(
  follows,
  ({ one }) => ({
    follower: one(user, {
      fields: [follows.followerId],
      references: [user.id],
      relationName: "followers",
    }),

    following: one(user, {
      fields: [follows.followingId],
      references: [user.id],
      relationName: "following",
    }),
  })
);

