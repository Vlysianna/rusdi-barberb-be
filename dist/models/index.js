"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tables = exports.schema = void 0;
__exportStar(require("./user"), exports);
__exportStar(require("./stylist"), exports);
__exportStar(require("./service"), exports);
__exportStar(require("./booking"), exports);
__exportStar(require("./payment"), exports);
__exportStar(require("./review"), exports);
const user_1 = require("./user");
const stylist_1 = require("./stylist");
const service_1 = require("./service");
const booking_1 = require("./booking");
const payment_1 = require("./payment");
const review_1 = require("./review");
exports.schema = {
    users: user_1.users,
    stylists: stylist_1.stylists,
    stylistSchedules: stylist_1.stylistSchedules,
    stylistLeaves: stylist_1.stylistLeaves,
    services: service_1.services,
    serviceCategories: service_1.serviceCategories,
    serviceAddons: service_1.serviceAddons,
    bookings: booking_1.bookings,
    bookingAddons: booking_1.bookingAddons,
    bookingHistory: booking_1.bookingHistory,
    payments: payment_1.payments,
    paymentMethods: payment_1.paymentMethods,
    paymentHistory: payment_1.paymentHistory,
    paymentWebhooks: payment_1.paymentWebhooks,
    reviews: review_1.reviews,
    reviewReactions: review_1.reviewReactions,
    reviewReports: review_1.reviewReports,
    notifications: review_1.notifications,
    notificationTemplates: review_1.notificationTemplates,
    notificationPreferences: review_1.notificationPreferences,
};
exports.tables = {
    users: user_1.users,
    stylists: stylist_1.stylists,
    stylistSchedules: stylist_1.stylistSchedules,
    stylistLeaves: stylist_1.stylistLeaves,
    services: service_1.services,
    serviceCategories: service_1.serviceCategories,
    serviceAddons: service_1.serviceAddons,
    bookings: booking_1.bookings,
    bookingAddons: booking_1.bookingAddons,
    bookingHistory: booking_1.bookingHistory,
    payments: payment_1.payments,
    paymentMethods: payment_1.paymentMethods,
    paymentHistory: payment_1.paymentHistory,
    paymentWebhooks: payment_1.paymentWebhooks,
    reviews: review_1.reviews,
    reviewReactions: review_1.reviewReactions,
    reviewReports: review_1.reviewReports,
    notifications: review_1.notifications,
    notificationTemplates: review_1.notificationTemplates,
    notificationPreferences: review_1.notificationPreferences,
};
exports.default = exports.schema;
//# sourceMappingURL=index.js.map