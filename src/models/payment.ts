import {
  mysqlTable,
  varchar,
  boolean,
  timestamp,
  text,
  decimal,
  mysqlEnum,
  json,
} from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
import { bookings } from "./booking";
import { users } from "./user";

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  bookingId: varchar("booking_id", { length: 128 })
    .notNull()
    .references(() => bookings.id),
  customerId: varchar("customer_id", { length: 128 })
    .notNull()
    .references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: mysqlEnum("method", [
    "cash",
    "credit_card",
    "debit_card",
    "digital_wallet",
    "bank_transfer",
  ]).notNull(),
  status: mysqlEnum("status", [
    "pending",
    "paid",
    "failed",
    "refunded",
    "cancelled",
  ])
    .notNull()
    .default("pending"),
  transactionId: varchar("transaction_id", { length: 255 }).unique(),
  paymentGatewayResponse: json("payment_gateway_response").$type<
    Record<string, any>
  >(),
  gatewayProvider: varchar("gateway_provider", { length: 100 }), // stripe, paypal, midtrans, etc.
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default(
    "1.0000",
  ),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0.00"), // transaction fees
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }), // amount - fees
  refundedAmount: decimal("refunded_amount", {
    precision: 10,
    scale: 2,
  }).default("0.00"),
  refundReason: text("refund_reason"),
  notes: text("notes"),
  metadata: json("metadata").$type<Record<string, any>>(), // additional data
  paidAt: timestamp("paid_at"),
  failedAt: timestamp("failed_at"),
  refundedAt: timestamp("refunded_at"),
  expiresAt: timestamp("expires_at"), // payment link expiration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const paymentMethods = mysqlTable("payment_methods", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 128 })
    .notNull()
    .references(() => users.id),
  type: mysqlEnum("type", [
    "credit_card",
    "debit_card",
    "digital_wallet",
    "bank_account",
  ]).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(), // visa, mastercard, gopay, ovo, etc.
  last4Digits: varchar("last_4_digits", { length: 4 }),
  expiryMonth: varchar("expiry_month", { length: 2 }),
  expiryYear: varchar("expiry_year", { length: 4 }),
  holderName: varchar("holder_name", { length: 255 }),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  gatewayToken: text("gateway_token"), // encrypted token from payment gateway
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const paymentHistory = mysqlTable("payment_history", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  paymentId: varchar("payment_id", { length: 128 })
    .notNull()
    .references(() => payments.id),
  action: varchar("action", { length: 100 }).notNull(), // created, paid, failed, refunded, etc.
  previousStatus: mysqlEnum("previous_status", [
    "pending",
    "paid",
    "failed",
    "refunded",
    "cancelled",
  ]),
  newStatus: mysqlEnum("new_status", [
    "pending",
    "paid",
    "failed",
    "refunded",
    "cancelled",
  ]),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  gatewayResponse: json("gateway_response").$type<Record<string, any>>(),
  performedBy: varchar("performed_by", { length: 128 }).references(
    () => users.id,
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentWebhooks = mysqlTable("payment_webhooks", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  provider: varchar("provider", { length: 100 }).notNull(), // stripe, midtrans, etc.
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventId: varchar("event_id", { length: 255 }).notNull().unique(),
  paymentId: varchar("payment_id", { length: 128 }).references(
    () => payments.id,
  ),
  payload: json("payload").$type<Record<string, any>>().notNull(),
  signature: text("signature"), // webhook signature for verification
  processed: boolean("processed").notNull().default(false),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: varchar("retry_count", { length: 3 }).default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type PaymentMethodRecord = typeof paymentMethods.$inferSelect;
export type NewPaymentMethodRecord = typeof paymentMethods.$inferInsert;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type NewPaymentHistory = typeof paymentHistory.$inferInsert;
export type PaymentWebhook = typeof paymentWebhooks.$inferSelect;
export type NewPaymentWebhook = typeof paymentWebhooks.$inferInsert;
