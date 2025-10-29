"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const cuid2_1 = require("@paralleldrive/cuid2");
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }).notNull(),
    fullName: (0, mysql_core_1.varchar)("full_name", { length: 255 }).notNull(),
    phone: (0, mysql_core_1.varchar)("phone", { length: 20 }),
    avatar: (0, mysql_core_1.text)("avatar"),
    role: (0, mysql_core_1.mysqlEnum)("role", ["admin", "manager", "stylist", "customer"])
        .notNull()
        .default("customer"),
    isActive: (0, mysql_core_1.boolean)("is_active").notNull().default(true),
    emailVerified: (0, mysql_core_1.boolean)("email_verified").notNull().default(false),
    emailVerifiedAt: (0, mysql_core_1.timestamp)("email_verified_at"),
    dateOfBirth: (0, mysql_core_1.date)("date_of_birth"),
    gender: (0, mysql_core_1.mysqlEnum)("gender", ["male", "female"]),
    address: (0, mysql_core_1.text)("address"),
    preferences: (0, mysql_core_1.text)("preferences"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").notNull().defaultNow().onUpdateNow(),
});
//# sourceMappingURL=user.js.map