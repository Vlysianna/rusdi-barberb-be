"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationPreferences = exports.notificationTemplates = exports.notifications = exports.reviewReports = exports.reviewReactions = exports.reviews = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const cuid2_1 = require("@paralleldrive/cuid2");
const booking_1 = require("./booking");
const user_1 = require("./user");
const stylist_1 = require("./stylist");
exports.reviews = (0, mysql_core_1.mysqlTable)('reviews', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    bookingId: (0, mysql_core_1.varchar)('booking_id', { length: 128 }).notNull().references(() => booking_1.bookings.id).unique(),
    customerId: (0, mysql_core_1.varchar)('customer_id', { length: 128 }).notNull().references(() => user_1.users.id),
    stylistId: (0, mysql_core_1.varchar)('stylist_id', { length: 128 }).notNull().references(() => stylist_1.stylists.id),
    rating: (0, mysql_core_1.int)('rating').notNull(),
    comment: (0, mysql_core_1.text)('comment'),
    photos: (0, mysql_core_1.json)('photos').$type().default([]),
    isAnonymous: (0, mysql_core_1.boolean)('is_anonymous').notNull().default(false),
    isVisible: (0, mysql_core_1.boolean)('is_visible').notNull().default(true),
    adminNotes: (0, mysql_core_1.text)('admin_notes'),
    likes: (0, mysql_core_1.int)('likes').notNull().default(0),
    dislikes: (0, mysql_core_1.int)('dislikes').notNull().default(0),
    reportedCount: (0, mysql_core_1.int)('reported_count').notNull().default(0),
    isReported: (0, mysql_core_1.boolean)('is_reported').notNull().default(false),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow().onUpdateNow(),
});
exports.reviewReactions = (0, mysql_core_1.mysqlTable)('review_reactions', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    reviewId: (0, mysql_core_1.varchar)('review_id', { length: 128 }).notNull().references(() => exports.reviews.id),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 128 }).notNull().references(() => user_1.users.id),
    type: (0, mysql_core_1.mysqlEnum)('type', ['like', 'dislike']).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.reviewReports = (0, mysql_core_1.mysqlTable)('review_reports', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    reviewId: (0, mysql_core_1.varchar)('review_id', { length: 128 }).notNull().references(() => exports.reviews.id),
    reportedBy: (0, mysql_core_1.varchar)('reported_by', { length: 128 }).notNull().references(() => user_1.users.id),
    reason: (0, mysql_core_1.mysqlEnum)('reason', [
        'inappropriate_content',
        'spam',
        'fake_review',
        'harassment',
        'off_topic',
        'other'
    ]).notNull(),
    description: (0, mysql_core_1.text)('description'),
    status: (0, mysql_core_1.mysqlEnum)('status', [
        'pending',
        'reviewed',
        'resolved',
        'dismissed'
    ]).notNull().default('pending'),
    reviewedBy: (0, mysql_core_1.varchar)('reviewed_by', { length: 128 }).references(() => user_1.users.id),
    reviewedAt: (0, mysql_core_1.timestamp)('reviewed_at'),
    adminNotes: (0, mysql_core_1.text)('admin_notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow().onUpdateNow(),
});
exports.notifications = (0, mysql_core_1.mysqlTable)('notifications', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 128 }).notNull().references(() => user_1.users.id),
    type: (0, mysql_core_1.mysqlEnum)('type', [
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
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    message: (0, mysql_core_1.text)('message').notNull(),
    data: (0, mysql_core_1.json)('data').$type(),
    priority: (0, mysql_core_1.mysqlEnum)('priority', ['low', 'normal', 'high', 'urgent']).notNull().default('normal'),
    channel: (0, mysql_core_1.mysqlEnum)('channel', ['in_app', 'email', 'sms', 'push']).notNull().default('in_app'),
    isRead: (0, mysql_core_1.boolean)('is_read').notNull().default(false),
    readAt: (0, mysql_core_1.timestamp)('read_at'),
    scheduledFor: (0, mysql_core_1.timestamp)('scheduled_for'),
    sentAt: (0, mysql_core_1.timestamp)('sent_at'),
    deliveryStatus: (0, mysql_core_1.mysqlEnum)('delivery_status', [
        'pending',
        'sent',
        'delivered',
        'failed',
        'bounced'
    ]).default('pending'),
    errorMessage: (0, mysql_core_1.text)('error_message'),
    retryCount: (0, mysql_core_1.int)('retry_count').notNull().default(0),
    expiresAt: (0, mysql_core_1.timestamp)('expires_at'),
    actionUrl: (0, mysql_core_1.text)('action_url'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow().onUpdateNow(),
});
exports.notificationTemplates = (0, mysql_core_1.mysqlTable)('notification_templates', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull().unique(),
    type: (0, mysql_core_1.mysqlEnum)('type', [
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
    channel: (0, mysql_core_1.mysqlEnum)('channel', ['in_app', 'email', 'sms', 'push']).notNull(),
    subject: (0, mysql_core_1.varchar)('subject', { length: 255 }),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    template: (0, mysql_core_1.text)('template').notNull(),
    variables: (0, mysql_core_1.json)('variables').$type().default([]),
    isActive: (0, mysql_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow().onUpdateNow(),
});
exports.notificationPreferences = (0, mysql_core_1.mysqlTable)('notification_preferences', {
    id: (0, mysql_core_1.varchar)('id', { length: 128 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 128 }).notNull().references(() => user_1.users.id),
    type: (0, mysql_core_1.mysqlEnum)('type', [
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
    inApp: (0, mysql_core_1.boolean)('in_app').notNull().default(true),
    email: (0, mysql_core_1.boolean)('email').notNull().default(true),
    sms: (0, mysql_core_1.boolean)('sms').notNull().default(false),
    push: (0, mysql_core_1.boolean)('push').notNull().default(true),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow().onUpdateNow(),
});
//# sourceMappingURL=review.js.map