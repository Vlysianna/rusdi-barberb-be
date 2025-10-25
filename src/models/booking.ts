import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  text,
  int,
  decimal,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./user";
import { stylists } from "./stylist";
import { services } from "./service";

export const bookings = mysqlTable("bookings", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  customerId: varchar("customer_id", { length: 128 })
    .notNull()
    .references(() => users.id),
  stylistId: varchar("stylist_id", { length: 128 })
    .notNull()
    .references(() => stylists.id),
  serviceId: varchar("service_id", { length: 128 })
    .notNull()
    .references(() => services.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  appointmentTime: varchar("appointment_time", { length: 8 }).notNull(), // HH:MM:SS format
  endTime: varchar("end_time", { length: 8 }), // calculated based on service duration
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
  ])
    .notNull()
    .default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  cancelReason: text("cancel_reason"),
  cancelledAt: timestamp("cancelled_at"),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  reminderSent: boolean("reminder_sent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const bookingAddons = mysqlTable("booking_addons", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  bookingId: varchar("booking_id", { length: 128 })
    .notNull()
    .references(() => bookings.id),
  addonId: varchar("addon_id", { length: 128 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingHistory = mysqlTable("booking_history", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  bookingId: varchar("booking_id", { length: 128 })
    .notNull()
    .references(() => bookings.id),
  action: varchar("action", { length: 100 }).notNull(), // created, confirmed, cancelled, etc.
  previousStatus: mysqlEnum("previous_status", [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
  ]),
  newStatus: mysqlEnum("new_status", [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
  ]),
  notes: text("notes"),
  performedBy: varchar("performed_by", { length: 128 }).references(
    () => users.id,
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type BookingAddon = typeof bookingAddons.$inferSelect;
export type NewBookingAddon = typeof bookingAddons.$inferInsert;
export type BookingHistory = typeof bookingHistory.$inferSelect;
export type NewBookingHistory = typeof bookingHistory.$inferInsert;
