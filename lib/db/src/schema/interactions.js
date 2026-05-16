import { pgTable, serial, timestamp, integer, text, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
export const likesTable = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(), // 'project' | 'post'
  targetId: integer("target_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique().on(table.userId, table.targetType, table.targetId),
]);
export const savesTable = pgTable("saves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(), // 'project' | 'post'
  targetId: integer("target_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique().on(table.userId, table.targetType, table.targetId),
]);
export type Like = typeof likesTable.$inferSelect;
export type Save = typeof savesTable.$inferSelect;