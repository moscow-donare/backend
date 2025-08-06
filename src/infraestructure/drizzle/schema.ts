import { pgTable, serial, varchar, timestamp, text, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  address: varchar("address", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: integer("category").notNull(),
  goal: integer("goal").notNull(),
  end_date: timestamp("end_date", { withTimezone: true }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  photo: varchar("photo", { length: 255 }).notNull(),
  creator_id: integer("creator_id").notNull().references(() => users.id),
  status: integer("status").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


export const schema = { users, campaigns };