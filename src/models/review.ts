import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  text,
  int,
  decimal,
  mysqlEnum,
  json
} from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';
import { bookings } from './booking';
import { users } from './user';
import { stylists } from './stylist';

export const reviews = mysqlTable('reviews', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  bookingId: varchar('booking_id', { length: 128 }).notNull().references(() => bookings.id).unique(),
  customerId: varchar('customer_id', { length: 128 }).notNull().references(() => users.id),
  stylistId: varchar('stylist_id', { length: 128 }).notNull().references(() => stylists.id),
  rating: int('rating').notNull(), // 1-5
  comment: text('comment'),
  photos: json('photos').$type<string[]>().default([]), // array of photo URLs
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  isVisible: boolean('is_visible').notNull().default(true),
  adminNotes: text('admin_notes'), // internal notes by admin
  likes: int('likes').notNull().default(0),
  dislikes: int('dislikes').notNull().default(0),
  reportedCount: int('reported_count').notNull().default(0),
  isReported: boolean('is_reported').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const reviewReactions = mysqlTable('review_reactions', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  reviewId: varchar('review_id', { length: 128 }).notNull().references(() => reviews.id),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  type: mysqlEnum('type', ['like', 'dislike']).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reviewReports = mysqlTable('review_reports', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  reviewId: varchar('review_id', { length: 128 }).notNull().references(() => reviews.id),
  reportedBy: varchar('reported_by', { length: 128 }).notNull().references(() => users.id),
  reason: mysqlEnum('reason', [
    'inappropriate_content',
    'spam',
    'fake_review',
    'harassment',
    'off_topic',
    'other'
  ]).notNull(),
  description: text('description'),
  status: mysqlEnum('status', [
    'pending',
    'reviewed',
    'resolved',
    'dismissed'
  ]).notNull().default('pending'),
  reviewedBy: varchar('reviewed_by', { length: 128 }).references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  type: mysqlEnum('type', [
    'booking_confirmation',
    'booking_reminder',
    'booking_cancelled',
    'booking_completed',
    'payment_success',
    'payment_failed',
    'review_request',
    'review_received',
    'promotion',
    'system_maintenance',
    'account_update',
    'security_alert'
  ]).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  data: json('data').$type<Record<string, any>>(), // additional data like booking_id, etc.
  priority: mysqlEnum('priority', ['low', 'normal', 'high', 'urgent']).notNull().default('normal'),
  channel: mysqlEnum('channel', ['in_app', 'email', 'sms', 'push']).notNull().default('in_app'),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  scheduledFor: timestamp('scheduled_for'), // for scheduled notifications
  sentAt: timestamp('sent_at'),
  deliveryStatus: mysqlEnum('delivery_status', [
    'pending',
    'sent',
    'delivered',
    'failed',
    'bounced'
  ]).default('pending'),
  errorMessage: text('error_message'),
  retryCount: int('retry_count').notNull().default(0),
  expiresAt: timestamp('expires_at'), // when notification should be considered expired
  actionUrl: text('action_url'), // URL to redirect when notification is clicked
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const notificationTemplates = mysqlTable('notification_templates', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull().unique(),
  type: mysqlEnum('type', [
    'booking_confirmation',
    'booking_reminder',
    'booking_cancelled',
    'booking_completed',
    'payment_success',
    'payment_failed',
    'review_request',
    'review_received',
    'promotion',
    'system_maintenance',
    'account_update',
    'security_alert'
  ]).notNull(),
  channel: mysqlEnum('channel', ['in_app', 'email', 'sms', 'push']).notNull(),
  subject: varchar('subject', { length: 255 }), // for email notifications
  title: varchar('title', { length: 255 }).notNull(),
  template: text('template').notNull(), // HTML template with placeholders
  variables: json('variables').$type<string[]>().default([]), // list of available variables
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const notificationPreferences = mysqlTable('notification_preferences', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 }).notNull().references(() => users.id),
  type: mysqlEnum('type', [
    'booking_confirmation',
    'booking_reminder',
    'booking_cancelled',
    'booking_completed',
    'payment_success',
    'payment_failed',
    'review_request',
    'review_received',
    'promotion',
    'system_maintenance',
    'account_update',
    'security_alert'
  ]).notNull(),
  inApp: boolean('in_app').notNull().default(true),
  email: boolean('email').notNull().default(true),
  sms: boolean('sms').notNull().default(false),
  push: boolean('push').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewReaction = typeof reviewReactions.$inferSelect;
export type NewReviewReaction = typeof reviewReactions.$inferInsert;
export type ReviewReport = typeof reviewReports.$inferSelect;
export type NewReviewReport = typeof reviewReports.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
