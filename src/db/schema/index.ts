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
  real,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Custom fields
  role: userRoleEnum("role").notNull().default("user"),
  rank: text("rank").default("8flex"),
  isVerified: boolean("is_verified").notNull().default(false), // Legacy field, keeping for safety
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
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
  authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
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

// New table to track if a user unlocked solutions without solving
export const unlockedSolutions = pgTable("unlocked_solutions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id", { length: 50 })
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
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
  (t) => ({
    pk: primaryKey({ columns: [t.contestId, t.challengeId] }),
  })
);

export const contestParticipants = pgTable(
  "contest_participants",
  {
    contestId: text("contest_id")
      .notNull()
      .references(() => contests.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contestId, t.userId] }),
  })
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

export const messages = pgTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user1Id: text("user1_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  user2Id: text("user2_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const friendStatusEnum = pgEnum("friend_status", ["pending", "accepted", "rejected"]);

export const friends = pgTable("friends", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  requesterId: text("requester_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: friendStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clans = pgTable("clans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clanMembers = pgTable("clan_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  clanId: text("clan_id")
    .notNull()
    .references(() => clans.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const clanMessages = pgTable("clan_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  clanId: text("clan_id")
    .notNull()
    .references(() => clans.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const globalMessages = pgTable("global_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const voiceParticipants = pgTable("voice_participants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  clanId: text("clan_id")
    .notNull()
    .references(() => clans.id, { onDelete: "cascade" }),
  channelId: text("channel_id").notNull(), // e.g. "General Voice"
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isMuted: boolean("is_muted").default(false).notNull(),
  isCameraOn: boolean("is_camera_on").default(false).notNull(),
});

export const contestSolutions = pgTable("contest_solutions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  contestId: text("contest_id").notNull().references(() => contests.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: varchar("challenge_id", { length: 50 }).notNull().references(() => challenges.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  accuracy: text("accuracy").notNull(),
  score: text("score").notNull(),
  duration: integer("duration").default(0),
  chars: integer("chars"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contestLeaderboard = pgTable(
  "contest_leaderboard",
  {
    contestId: text("contest_id").notNull().references(() => contests.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    totalScore: real("total_score").notNull().default(0),
    rank: integer("rank").default(0),
    challengesSolved: integer("challenges_solved").default(0),
    lastSubmissionAt: timestamp("last_submission_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contestId, t.userId] }),
  })
);

export const voiceSignals = pgTable("voice_signals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clanId: text("clan_id").notNull().references(() => clans.id, { onDelete: "cascade" }),
  fromUserId: text("from_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  toUserId: text("to_user_id").references(() => users.id, { onDelete: "cascade" }), // Null for broadcast, but usually direct
  signal: jsonb("signal").notNull(), // The actual SDP or Candidate
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
