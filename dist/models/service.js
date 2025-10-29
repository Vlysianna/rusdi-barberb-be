"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceAddons = exports.serviceCategories = exports.services = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const cuid2_1 = require("@paralleldrive/cuid2");
exports.services = (0, mysql_core_1.mysqlTable)('services', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    category: (0, mysql_core_1.mysqlEnum)('category', [
        'haircut',
        'beard_trim',
        'hair_wash',
        'styling',
        'coloring',
        'treatment',
        'package'
    ]).notNull(),
    price: (0, mysql_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    duration: (0, mysql_core_1.int)('duration').notNull(),
    isActive: (0, mysql_core_1.boolean)('is_active').notNull().default(true),
    image: (0, mysql_core_1.text)('image'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow().onUpdateNow(),
});
exports.serviceCategories = (0, mysql_core_1.mysqlTable)('service_categories', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    icon: (0, mysql_core_1.varchar)('icon', { length: 255 }),
    sortOrder: (0, mysql_core_1.int)('sort_order').notNull().default(0),
    isActive: (0, mysql_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow().onUpdateNow(),
});
exports.serviceAddons = (0, mysql_core_1.mysqlTable)('service_addons', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    serviceId: (0, mysql_core_1.varchar)('service_id', { length: 128 }).notNull().references(() => exports.services.id),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    price: (0, mysql_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    isActive: (0, mysql_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow().onUpdateNow(),
});
//# sourceMappingURL=service.js.map