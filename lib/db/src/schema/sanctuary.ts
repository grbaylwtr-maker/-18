import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galaxiesTable = pgTable("galaxies", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: text("name").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  memberCount: integer("member_count").notNull().default(0),
  color: varchar("color", { length: 50 }).notNull().default("#C4B5FD"),
  description: text("description").notNull(),
  isLive: boolean("is_live").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const galaxyMessagesTable = pgTable("galaxy_messages", {
  id: serial("id").primaryKey(),
  galaxyId: integer("galaxy_id").notNull().references(() => galaxiesTable.id),
  content: text("content").notNull(),
  spectralColor: varchar("spectral_color", { length: 50 }).notNull().default("#C4B5FD"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const talesTable = pgTable("tales", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  genre: varchar("genre", { length: 100 }).notNull(),
  pulseCount: integer("pulse_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const taleCommentsTable = pgTable("tale_comments", {
  id: serial("id").primaryKey(),
  taleId: integer("tale_id").notNull().references(() => talesTable.id),
  content: text("content").notNull(),
  spectralColor: varchar("spectral_color", { length: 50 }).notNull().default("#C4B5FD"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reelsTable = pgTable("reels", {
  id: serial("id").primaryKey(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  videoUrl: text("video_url"),
  emotionTag: varchar("emotion_tag", { length: 100 }).notNull(),
  resonanceCount: integer("resonance_count").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(30),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const secretsTable = pgTable("secrets", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const echoSessionsTable = pgTable("echo_sessions", {
  id: serial("id").primaryKey(),
  sessionToken: varchar("session_token", { length: 200 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("searching"),
  spectralColorA: varchar("spectral_color_a", { length: 50 }).notNull(),
  spectralColorB: varchar("spectral_color_b", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const echoMessagesTable = pgTable("echo_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => echoSessionsTable.id),
  content: text("content").notNull(),
  senderColor: varchar("sender_color", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pollsTable = pgTable("polls", {
  id: serial("id").primaryKey(),
  galaxyId: integer("galaxy_id").notNull().references(() => galaxiesTable.id),
  question: text("question").notNull(),
  options: jsonb("options").notNull().default([]),
  totalVotes: integer("total_votes").notNull().default(0),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const moodEntriesTable = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  spectralToken: varchar("spectral_token", { length: 200 }).notNull(),
  mood: integer("mood").notNull(),
  note: text("note"),
  emotion: varchar("emotion", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookmarksTable = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  spectralToken: varchar("spectral_token", { length: 200 }).notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: varchar("content_id", { length: 100 }).notNull(),
  title: text("title"),
  excerpt: text("excerpt"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expressionsTable = pgTable("expressions", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull().default("visual"),
  title: text("title").notNull(),
  description: text("description"),
  color: varchar("color", { length: 50 }).notNull().default("#FB923C"),
  imageUrl: text("image_url"),
  content: text("content"),
  spectralAuthor: varchar("spectral_author", { length: 100 }),
  resonanceCount: integer("resonance_count").notNull().default(0),
  size: varchar("size", { length: 20 }).default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertGalaxySchema = createInsertSchema(galaxiesTable).omit({ id: true, createdAt: true });
export const insertGalaxyMessageSchema = createInsertSchema(galaxyMessagesTable).omit({ id: true, createdAt: true });
export const insertTaleSchema = createInsertSchema(talesTable).omit({ id: true, pulseCount: true, createdAt: true });
export const insertReelSchema = createInsertSchema(reelsTable).omit({ id: true, resonanceCount: true, createdAt: true });
export const insertSecretSchema = createInsertSchema(secretsTable).omit({ id: true, isRead: true, createdAt: true });
export const insertTaleCommentSchema = createInsertSchema(taleCommentsTable).omit({ id: true, createdAt: true });
export const insertMoodSchema = createInsertSchema(moodEntriesTable).omit({ id: true, createdAt: true });
export const insertBookmarkSchema = createInsertSchema(bookmarksTable).omit({ id: true, createdAt: true });
export const insertExpressionSchema = createInsertSchema(expressionsTable).omit({ id: true, resonanceCount: true, createdAt: true });

export type Galaxy = typeof galaxiesTable.$inferSelect;
export type GalaxyMessage = typeof galaxyMessagesTable.$inferSelect;
export type Tale = typeof talesTable.$inferSelect;
export type TaleComment = typeof taleCommentsTable.$inferSelect;
export type Reel = typeof reelsTable.$inferSelect;
export type Secret = typeof secretsTable.$inferSelect;
export type EchoSession = typeof echoSessionsTable.$inferSelect;
export type EchoMessage = typeof echoMessagesTable.$inferSelect;
export type Poll = typeof pollsTable.$inferSelect;
export type MoodEntry = typeof moodEntriesTable.$inferSelect;
export type Bookmark = typeof bookmarksTable.$inferSelect;
export type Expression = typeof expressionsTable.$inferSelect;

export type InsertGalaxy = z.infer<typeof insertGalaxySchema>;
export type InsertTale = z.infer<typeof insertTaleSchema>;
