import { pgTable, serial, text, varchar, timestamp, jsonb, date } from "drizzle-orm/pg-core";

export const laws = pgTable("laws", {
  id: serial("id").primaryKey(),
  lawId: varchar("law_id", { length: 50 }),
  mst: varchar("mst", { length: 50 }),
  name: text("name").notNull(),
  shortName: varchar("short_name", { length: 100 }).notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  lastChecked: timestamp("last_checked"),
});

export const amendments = pgTable("amendments", {
  id: serial("id").primaryKey(),
  lawRef: varchar("law_ref", { length: 50 }).notNull(),
  date: date("date").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  summary: text("summary"),
  enforcementDate: date("enforcement_date"),
  detectedAt: timestamp("detected_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  lawIds: jsonb("law_ids").$type<string[]>().notNull(),
  alertDays: jsonb("alert_days").$type<number[]>().notNull().default([90, 60, 30, 7]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const summaryCache = pgTable("summary_cache", {
  id: serial("id").primaryKey(),
  articleKey: varchar("article_key", { length: 200 }).notNull().unique(),
  version: varchar("version", { length: 50 }),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
