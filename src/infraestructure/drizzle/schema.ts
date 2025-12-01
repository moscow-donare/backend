import { relations } from "drizzle-orm";
import { pgTable, serial, varchar, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";

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
  photo: varchar("photo", { length: 255 }).notNull(),
  creator_id: integer("creator_id").notNull().references(() => users.id),
  contract_address: varchar("contract_address", { length: 255 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const campaignsRelations = relations(campaigns, ({ many, one }) => ({
  state_changes: many(state_changes),
  creator: one(users, {
    fields: [campaigns.creator_id],
    references: [users.id],
  })
}));

export const state_changes = pgTable("state_changes", {
  id: serial("id").primaryKey(),
  campaign_id: integer("campaign_id").notNull(),
  state: integer("state").notNull(),
  reason: text("reason").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const stateChangesRelations = relations(state_changes, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [state_changes.campaign_id],
    references: [campaigns.id],
  }),
}));

export const userData = pgTable("user_data", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  birthday: timestamp("birthday").defaultNow(),
  country: varchar("country", { length: 255 }).default(null as unknown as string),
  state: varchar("state", { length: 255 }).default(null as unknown as string),
  city: varchar("city", { length: 255 }).default(null as unknown as string),
  gender: varchar("gender", { length: 10 }).default(null as unknown as string),
  provider: varchar("provider", { length: 50 }).default(null as unknown as string),
  photo: varchar("photo", { length: 500 }).default(null as unknown as string),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const userDataRelations = relations(userData, ({ one }) => ({
  user: one(users, {
    fields: [userData.user_id],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  userData: one(userData, {
    fields: [users.id],
    references: [userData.user_id],
  }),
  donations: many(donations),
}));

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  campaign_id: integer("campaign_id").notNull().references(() => campaigns.id),
  amount: integer("amount").notNull(),
  tx_hash: varchar("tx_hash", { length: 255 }).notNull(),
  is_anonymous: boolean("is_anonymous").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.user_id],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [donations.campaign_id],
    references: [campaigns.id],
  }),
}));

export const schema = { users, campaigns, state_changes, userData, donations, stateChangesRelations, campaignsRelations, userDataRelations, usersRelations, donationsRelations };