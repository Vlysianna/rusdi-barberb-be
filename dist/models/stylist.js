"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylistLeaves = exports.stylistServices = exports.stylistSchedules = exports.stylists = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const cuid2_1 = require("@paralleldrive/cuid2");
const user_1 = require("./user");
exports.stylists = (0, mysql_core_1.mysqlTable)("stylists", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 128 })
        .notNull()
        .references(() => user_1.users.id),
    specialties: (0, mysql_core_1.json)("specialties").$type().notNull().default([]),
    experience: (0, mysql_core_1.int)("experience").notNull().default(0),
    rating: (0, mysql_core_1.decimal)("rating", { precision: 3, scale: 2 })
        .notNull()
        .default("0.00"),
    totalReviews: (0, mysql_core_1.int)("total_reviews").notNull().default(0),
    totalBookings: (0, mysql_core_1.int)("total_bookings").notNull().default(0),
    revenue: (0, mysql_core_1.decimal)("revenue", { precision: 12, scale: 2 })
        .notNull()
        .default("0.00"),
    commissionRate: (0, mysql_core_1.decimal)("commission_rate", { precision: 5, scale: 2 })
        .notNull()
        .default("15.00"),
    isAvailable: (0, mysql_core_1.boolean)("is_available").notNull().default(true),
    schedule: (0, mysql_core_1.json)("schedule")
        .$type()
        .default({}),
    bio: (0, mysql_core_1.text)("bio"),
    portfolio: (0, mysql_core_1.json)("portfolio").$type().default([]),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").notNull().defaultNow().onUpdateNow(),
});
exports.stylistSchedules = (0, mysql_core_1.mysqlTable)("stylist_schedules", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    stylistId: (0, mysql_core_1.varchar)("stylist_id", { length: 128 })
        .notNull()
        .references(() => exports.stylists.id),
    dayOfWeek: (0, mysql_core_1.int)("day_of_week").notNull(),
    startTime: (0, mysql_core_1.varchar)("start_time", { length: 8 }).notNull(),
    endTime: (0, mysql_core_1.varchar)("end_time", { length: 8 }).notNull(),
    isAvailable: (0, mysql_core_1.boolean)("is_available").notNull().default(true),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").notNull().defaultNow().onUpdateNow(),
});
exports.stylistServices = (0, mysql_core_1.mysqlTable)("stylist_services", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    stylistId: (0, mysql_core_1.varchar)("stylist_id", { length: 128 })
        .notNull()
        .references(() => exports.stylists.id),
    serviceId: (0, mysql_core_1.varchar)("service_id", { length: 128 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
});
exports.stylistLeaves = (0, mysql_core_1.mysqlTable)("stylist_leaves", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    stylistId: (0, mysql_core_1.varchar)("stylist_id", { length: 128 })
        .notNull()
        .references(() => exports.stylists.id),
    startDate: (0, mysql_core_1.timestamp)("start_date").notNull(),
    endDate: (0, mysql_core_1.timestamp)("end_date").notNull(),
    reason: (0, mysql_core_1.text)("reason").notNull(),
    isApproved: (0, mysql_core_1.boolean)("is_approved").notNull().default(false),
    approvedBy: (0, mysql_core_1.varchar)("approved_by", { length: 128 }).references(() => user_1.users.id),
    approvedAt: (0, mysql_core_1.timestamp)("approved_at"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").notNull().defaultNow().onUpdateNow(),
});
//# sourceMappingURL=stylist.js.map