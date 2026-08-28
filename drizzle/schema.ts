import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const trackCategory = mysqlEnum("track_category", ["sakin", "enerji", "gece", "yol", "diger"]);

export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull().default("Bizim Şarkılarımız"),
  category: trackCategory.notNull().default("diger"),
  storageKey: varchar("storageKey", { length: 512 }).notNull().unique(),
  audioUrl: varchar("audioUrl", { length: 1024 }).notNull(),
  coverStorageKey: varchar("coverStorageKey", { length: 512 }),
  coverUrl: varchar("coverUrl", { length: 1024 }),
  genre: varchar("genre", { length: 120 }).notNull().default(""),
  lyrics: text("lyrics"),
  published: boolean("published").notNull().default(true),
  durationSeconds: int("durationSeconds").notNull().default(0),
  fileSizeBytes: int("fileSizeBytes").notNull().default(0),
  uploadedByUserId: int("uploadedByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;
