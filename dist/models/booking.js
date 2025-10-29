"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingHistory = exports.bookingAddons = exports.bookings = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const cuid2_1 = require("@paralleldrive/cuid2");
const user_1 = require("./user");
const stylist_1 = require("./stylist");
const service_1 = require("./service");
exports.bookings = (0, mysql_core_1.mysqlTable)("bookings", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    customerId: (0, mysql_core_1.varchar)("customer_id", { length: 128 })
        .notNull()
        .references(() => user_1.users.id),
    stylistId: (0, mysql_core_1.varchar)("stylist_id", { length: 128 })
        .notNull()
        .references(() => stylist_1.stylists.id),
    serviceId: (0, mysql_core_1.varchar)("service_id", { length: 128 })
        .notNull()
        .references(() => service_1.services.id),
    appointmentDate: (0, mysql_core_1.timestamp)("appointment_date").notNull(),
    appointmentTime: (0, mysql_core_1.varchar)("appointment_time", { length: 8 }).notNull(),
    endTime: (0, mysql_core_1.varchar)("end_time", { length: 8 }),
    status: (0, mysql_core_1.mysqlEnum)("status", [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
    ])
        .notNull()
        .default("pending"),
    totalAmount: (0, mysql_core_1.decimal)("total_amount", { precision: 10, scale: 2 }).notNull(),
    notes: (0, mysql_core_1.text)("notes"),
    cancelReason: (0, mysql_core_1.text)("cancel_reason"),
    cancelledAt: (0, mysql_core_1.timestamp)("cancelled_at"),
    confirmedAt: (0, mysql_core_1.timestamp)("confirmed_at"),
    completedAt: (0, mysql_core_1.timestamp)("completed_at"),
    reminderSent: (0, mysql_core_1.boolean)("reminder_sent").notNull().default(false),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").notNull().defaultNow().onUpdateNow(),
});
exports.bookingAddons = (0, mysql_core_1.mysqlTable)("booking_addons", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    bookingId: (0, mysql_core_1.varchar)("booking_id", { length: 128 })
        .notNull()
        .references(() => exports.bookings.id),
    addonId: (0, mysql_core_1.varchar)("addon_id", { length: 128 }).notNull(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    price: (0, mysql_core_1.decimal)("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
});
exports.bookingHistory = (0, mysql_core_1.mysqlTable)("booking_history", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    bookingId: (0, mysql_core_1.varchar)("booking_id", { length: 128 })
        .notNull()
        .references(() => exports.bookings.id),
    action: (0, mysql_core_1.varchar)("action", { length: 100 }).notNull(),
    previousStatus: (0, mysql_core_1.mysqlEnum)("previous_status", [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
    ]),
    newStatus: (0, mysql_core_1.mysqlEnum)("new_status", [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
    ]),
    notes: (0, mysql_core_1.text)("notes"),
    performedBy: (0, mysql_core_1.varchar)("performed_by", { length: 128 }).references(() => user_1.users.id),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
});
//# sourceMappingURL=booking.js.map