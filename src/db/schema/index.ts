import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  primaryKey,
  integer,
  boolean,
  pgEnum,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  // isVerified: false = belum diverifikasi (menunggu approve admin)
  isVerified: boolean("is_verified").notNull().default(false),
  image: text("image"),
  password: text("password"),
  // peran user, disimpan sebagai enum Postgres user_role
  role: userRoleEnum("role").notNull().default("user"),
  rank: text("rank").default("8flex"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    }
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const challenges = pgTable("challenges", {
  id: varchar("id", { length: 50 }).primaryKey(),
  title: text("title").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  colors: jsonb("colors").$type<string[]>().notNull(),
  defaultCode: text("default_code"),
  targetCode: text("target_code"),
  imageUrl: text("image_url"),
  description: text("description"),
  tips: jsonb("tips").$type<string[]>().default([]).notNull(),
  targetChars: integer("target_chars"), // Optional target for max score
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id", { length: 50 }).references(() => challenges.id, { onDelete: "cascade" }).notNull(),
  code: text("code").notNull(),
  accuracy: text("accuracy").notNull(),
  score: text("score").notNull(),
  duration: integer("duration").default(0), // Time taken in seconds
  chars: integer("chars"), // Code length
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contests = pgTable("contests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contestChallenges = pgTable(
  "contest_challenges",
  {
    contestId: text("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    challengeId: varchar("challenge_id", { length: 50 })
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
  },
  (t) => [
    {
      pk: primaryKey({ columns: [t.contestId, t.challengeId] }),
    },
  ]
);

export const comments = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: text("parent_id").references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
