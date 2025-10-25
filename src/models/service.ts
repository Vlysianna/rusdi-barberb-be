import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  text,
  int,
  decimal,
  mysqlEnum
} from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';

export const services = mysqlTable('services', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: mysqlEnum('category', [
    'haircut',
    'beard_trim',
    'hair_wash',
    'styling',
    'coloring',
    'treatment',
    'package'
  ]).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: int('duration').notNull(), // in minutes
  isActive: boolean('is_active').notNull().default(true),
  image: text('image'), // URL to service image
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const serviceCategories = mysqlTable('service_categories', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 255 }), // icon name or URL
  sortOrder: int('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const serviceAddons = mysqlTable('service_addons', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  serviceId: varchar('service_id', { length: 128 }).notNull().references(() => services.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type ServiceAddon = typeof serviceAddons.$inferSelect;
export type NewServiceAddon = typeof serviceAddons.$inferInsert;
