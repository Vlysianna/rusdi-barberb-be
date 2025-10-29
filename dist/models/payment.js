"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentWebhooks = exports.paymentHistory = exports.paymentMethods = exports.payments = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const cuid2_1 = require("@paralleldrive/cuid2");
const booking_1 = require("./booking");
const user_1 = require("./user");
exports.payments = (0, mysql_core_1.mysqlTable)("payments", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    bookingId: (0, mysql_core_1.varchar)("booking_id", { length: 128 })
        .notNull()
        .references(() => booking_1.bookings.id),
    customerId: (0, mysql_core_1.varchar)("customer_id", { length: 128 })
        .notNull()
        .references(() => user_1.users.id),
    amount: (0, mysql_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    method: (0, mysql_core_1.mysqlEnum)("method", [
        "cash",
        "credit_card",
        "debit_card",
        "digital_wallet",
        "bank_transfer",
    ]).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", [
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled",
    ])
        .notNull()
        .default("pending"),
    transactionId: (0, mysql_core_1.varchar)("transaction_id", { length: 255 }).unique(),
    paymentGatewayResponse: (0, mysql_core_1.json)("payment_gateway_response").$type(),
    gatewayProvider: (0, mysql_core_1.varchar)("gateway_provider", { length: 100 }),
    currency: (0, mysql_core_1.varchar)("currency", { length: 3 }).notNull().default("IDR"),
    exchangeRate: (0, mysql_core_1.decimal)("exchange_rate", { precision: 10, scale: 4 }).default("1.0000"),
    fees: (0, mysql_core_1.decimal)("fees", { precision: 10, scale: 2 }).default("0.00"),
    netAmount: (0, mysql_core_1.decimal)("net_amount", { precision: 10, scale: 2 }),
    refundedAmount: (0, mysql_core_1.decimal)("refunded_amount", {
        precision: 10,
        scale: 2,
    }).default("0.00"),
    refundReason: (0, mysql_core_1.text)("refund_reason"),
    notes: (0, mysql_core_1.text)("notes"),
    metadata: (0, mysql_core_1.json)("metadata").$type(),
    paidAt: (0, mysql_core_1.timestamp)("paid_at"),
    failedAt: (0, mysql_core_1.timestamp)("failed_at"),
    refundedAt: (0, mysql_core_1.timestamp)("refunded_at"),
    expiresAt: (0, mysql_core_1.timestamp)("expires_at"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").notNull().defaultNow().onUpdateNow(),
});
exports.paymentMethods = (0, mysql_core_1.mysqlTable)("payment_methods", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    userId: (0, mysql_core_1.varchar)("user_id", { length: 128 })
        .notNull()
        .references(() => user_1.users.id),
    type: (0, mysql_core_1.mysqlEnum)("type", [
        "credit_card",
        "debit_card",
        "digital_wallet",
        "bank_account",
    ]).notNull(),
    provider: (0, mysql_core_1.varchar)("provider", { length: 100 }).notNull(),
    last4Digits: (0, mysql_core_1.varchar)("last_4_digits", { length: 4 }),
    expiryMonth: (0, mysql_core_1.varchar)("expiry_month", { length: 2 }),
    expiryYear: (0, mysql_core_1.varchar)("expiry_year", { length: 4 }),
    holderName: (0, mysql_core_1.varchar)("holder_name", { length: 255 }),
    isDefault: (0, mysql_core_1.boolean)("is_default").notNull().default(false),
    isActive: (0, mysql_core_1.boolean)("is_active").notNull().default(true),
    gatewayToken: (0, mysql_core_1.text)("gateway_token"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").notNull().defaultNow().onUpdateNow(),
});
exports.paymentHistory = (0, mysql_core_1.mysqlTable)("payment_history", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    paymentId: (0, mysql_core_1.varchar)("payment_id", { length: 128 })
        .notNull()
        .references(() => exports.payments.id),
    action: (0, mysql_core_1.varchar)("action", { length: 100 }).notNull(),
    previousStatus: (0, mysql_core_1.mysqlEnum)("previous_status", [
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled",
    ]),
    newStatus: (0, mysql_core_1.mysqlEnum)("new_status", [
        "pending",
        "paid",
        "failed",
        "refunded",
        "cancelled",
    ]),
    amount: (0, mysql_core_1.decimal)("amount", { precision: 10, scale: 2 }),
    notes: (0, mysql_core_1.text)("notes"),
    gatewayResponse: (0, mysql_core_1.json)("gateway_response").$type(),
    performedBy: (0, mysql_core_1.varchar)("performed_by", { length: 128 }).references(() => user_1.users.id),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
});
exports.paymentWebhooks = (0, mysql_core_1.mysqlTable)("payment_webhooks", {
    id: (0, mysql_core_1.varchar)("id", { length: 128 })
        .primaryKey()
        .$defaultFn(() => (0, cuid2_1.createId)()),
    provider: (0, mysql_core_1.varchar)("provider", { length: 100 }).notNull(),
    eventType: (0, mysql_core_1.varchar)("event_type", { length: 100 }).notNull(),
    eventId: (0, mysql_core_1.varchar)("event_id", { length: 255 }).notNull().unique(),
    paymentId: (0, mysql_core_1.varchar)("payment_id", { length: 128 }).references(() => exports.payments.id),
    payload: (0, mysql_core_1.json)("payload").$type().notNull(),
    signature: (0, mysql_core_1.text)("signature"),
    processed: (0, mysql_core_1.boolean)("processed").notNull().default(false),
    processedAt: (0, mysql_core_1.timestamp)("processed_at"),
    errorMessage: (0, mysql_core_1.text)("error_message"),
    retryCount: (0, mysql_core_1.varchar)("retry_count", { length: 3 }).default("0"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").notNull().defaultNow().onUpdateNow(),
});
//# sourceMappingURL=payment.js.map