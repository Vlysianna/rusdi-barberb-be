// Export all database schemas
export * from './user';
export * from './stylist';
export * from './service';
export * from './booking';
export * from './payment';
export * from './review';

// Import all tables for migrations
import { users } from './user';
import {
  stylists,
  stylistSchedules,
  stylistLeaves
} from './stylist';
import {
  services,
  serviceCategories,
  serviceAddons
} from './service';
import {
  bookings,
  bookingAddons,
  bookingHistory
} from './booking';
import {
  payments,
  paymentMethods,
  paymentHistory,
  paymentWebhooks
} from './payment';
import {
  reviews,
  reviewReactions,
  reviewReports,
  notifications,
  notificationTemplates,
  notificationPreferences
} from './review';

// Export schema object for Drizzle Kit migrations
export const schema = {
  // User tables
  users,

  // Stylist tables
  stylists,
  stylistSchedules,
  stylistLeaves,

  // Service tables
  services,
  serviceCategories,
  serviceAddons,

  // Booking tables
  bookings,
  bookingAddons,
  bookingHistory,

  // Payment tables
  payments,
  paymentMethods,
  paymentHistory,
  paymentWebhooks,

  // Review and Notification tables
  reviews,
  reviewReactions,
  reviewReports,
  notifications,
  notificationTemplates,
  notificationPreferences,
};

// Table list for easier access
export const tables = {
  users,
  stylists,
  stylistSchedules,
  stylistLeaves,
  services,
  serviceCategories,
  serviceAddons,
  bookings,
  bookingAddons,
  bookingHistory,
  payments,
  paymentMethods,
  paymentHistory,
  paymentWebhooks,
  reviews,
  reviewReactions,
  reviewReports,
  notifications,
  notificationTemplates,
  notificationPreferences,
} as const;

export default schema;
