import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  text,
  int,
  decimal,
  json,
  mysqlEnum
} from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './user';

export const stylists = mysqlTable('stylists', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  specialties: json('specialties').$type<string[]>().notNull().default([]),
  experience: int('experience').notNull().default(0), // years of experience
  rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
  totalReviews: int('total_reviews').notNull().default(0),
  isAvailable: boolean('is_available').notNull().default(true),
  bio: text('bio'),
  portfolio: json('portfolio').$type<string[]>().default([]), // array of image URLs
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const stylistSchedules = mysqlTable('stylist_schedules', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  stylistId: varchar('stylist_id', { length: 128 }).notNull().references(() => stylists.id),
  dayOfWeek: int('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar('start_time', { length: 8 }).notNull(), // HH:MM:SS format
  endTime: varchar('end_time', { length: 8 }).notNull(), // HH:MM:SS format
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const stylistLeaves = mysqlTable('stylist_leaves', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  stylistId: varchar('stylist_id', { length: 128 }).notNull().references(() => stylists.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  reason: text('reason').notNull(),
  isApproved: boolean('is_approved').notNull().default(false),
  approvedBy: varchar('approved_by', { length: 128 }).references(() => users.id),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Stylist = typeof stylists.$inferSelect;
export type NewStylist = typeof stylists.$inferInsert;
export type StylistSchedule = typeof stylistSchedules.$inferSelect;
export type NewStylistSchedule = typeof stylistSchedules.$inferInsert;
export type StylistLeave = typeof stylistLeaves.$inferSelect;
export type NewStylistLeave = typeof stylistLeaves.$inferInsert;
