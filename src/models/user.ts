import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  text,
  mysqlEnum,
  date,
} from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["admin", "manager", "stylist", "customer"])
    .notNull()
    .default("customer"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  dateOfBirth: date("date_of_birth"),
  gender: mysqlEnum("gender", ["male", "female"]),
  address: text("address"),
  preferences: text("preferences"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
