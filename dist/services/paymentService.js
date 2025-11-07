"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const payment_1 = require("../models/payment");
const booking_1 = require("../models/booking");
const user_1 = require("../models/user");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../utils/types");
class PaymentService {
    async getPayments(params) {
        try {
            const { page = 1, limit = 10, bookingId, customerId, status, method, startDate, endDate, sortBy = "createdAt", sortOrder = "desc", } = params;
            const offset = (page - 1) * limit;
            const whereConditions = [];
            if (bookingId) {
                whereConditions.push((0, drizzle_orm_1.eq)(payment_1.payments.bookingId, bookingId));
            }
            if (status) {
                whereConditions.push((0, drizzle_orm_1.eq)(payment_1.payments.status, status));
            }
            if (method) {
                whereConditions.push((0, drizzle_orm_1.eq)(payment_1.payments.method, method));
            }
            if (startDate) {
                whereConditions.push((0, drizzle_orm_1.gte)(payment_1.payments.createdAt, startDate));
            }
            if (endDate) {
                whereConditions.push((0, drizzle_orm_1.lte)(payment_1.payments.createdAt, endDate));
            }
            const query = database_1.db
                .select({
                payment: payment_1.payments,
                booking: {
                    id: booking_1.bookings.id,
                    appointmentDate: booking_1.bookings.appointmentDate,
                    appointmentTime: booking_1.bookings.appointmentTime,
                    totalAmount: booking_1.bookings.totalAmount,
                    status: booking_1.bookings.status,
                },
                customer: {
                    id: user_1.users.id,
                    fullName: user_1.users.fullName,
                    email: user_1.users.email,
                    phone: user_1.users.phone,
                },
            })
                .from(payment_1.payments)
                .innerJoin(booking_1.bookings, (0, drizzle_orm_1.eq)(payment_1.payments.bookingId, booking_1.bookings.id))
                .innerJoin(user_1.users, (0, drizzle_orm_1.eq)(booking_1.bookings.customerId, user_1.users.id))
                .limit(limit)
                .offset(offset);
            if (whereConditions.length > 0) {
                query.where((0, drizzle_orm_1.and)(...whereConditions));
            }
            if (sortOrder === "desc") {
                query.orderBy((0, drizzle_orm_1.desc)(payment_1.payments.createdAt));
            }
            else {
                query.orderBy(payment_1.payments.createdAt);
            }
            const results = await query;
            const countQuery = database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(payment_1.payments)
                .innerJoin(booking_1.bookings, (0, drizzle_orm_1.eq)(payment_1.payments.bookingId, booking_1.bookings.id))
                .innerJoin(user_1.users, (0, drizzle_orm_1.eq)(booking_1.bookings.customerId, user_1.users.id));
            if (whereConditions.length > 0) {
                countQuery.where((0, drizzle_orm_1.and)(...whereConditions));
            }
            const [{ count: total }] = await countQuery;
            const paymentsWithDetails = results.map((row) => ({
                ...row.payment,
                booking: {
                    ...row.booking,
                    totalAmount: parseFloat(row.booking.totalAmount),
                },
                customer: row.customer,
            }));
            return {
                payments: paymentsWithDetails,
                total,
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError(`Failed to fetch payments: ${error}`);
        }
    }
    async getPaymentById(paymentId) {
        try {
            const result = await database_1.db
                .select({
                payment: payment_1.payments,
                booking: {
                    id: booking_1.bookings.id,
                    appointmentDate: booking_1.bookings.appointmentDate,
                    appointmentTime: booking_1.bookings.appointmentTime,
                    totalAmount: booking_1.bookings.totalAmount,
                    status: booking_1.bookings.status,
                },
                customer: {
                    id: user_1.users.id,
                    fullName: user_1.users.fullName,
                    email: user_1.users.email,
                    phone: user_1.users.phone,
                },
            })
                .from(payment_1.payments)
                .innerJoin(booking_1.bookings, (0, drizzle_orm_1.eq)(payment_1.payments.bookingId, booking_1.bookings.id))
                .innerJoin(user_1.users, (0, drizzle_orm_1.eq)(booking_1.bookings.customerId, user_1.users.id))
                .where((0, drizzle_orm_1.eq)(payment_1.payments.id, paymentId))
                .limit(1);
            if (result.length === 0) {
                return null;
            }
            const row = result[0];
            return {
                ...row.payment,
                booking: {
                    ...row.booking,
                    totalAmount: parseFloat(row.booking.totalAmount),
                },
                customer: row.customer,
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError(`Failed to fetch payment: ${error}`);
        }
    }
    async createPayment(data) {
        try {
            const { bookingId, method, amount, customerId } = data;
            let finalCustomerId = customerId;
            if (!finalCustomerId) {
                const booking = await database_1.db
                    .select({ customerId: booking_1.bookings.customerId })
                    .from(booking_1.bookings)
                    .where((0, drizzle_orm_1.eq)(booking_1.bookings.id, bookingId))
                    .limit(1);
                if (booking.length === 0) {
                    throw new errorHandler_1.NotFoundError("Booking not found");
                }
                finalCustomerId = booking[0].customerId;
            }
            const existingPayment = await database_1.db
                .select()
                .from(payment_1.payments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payment_1.payments.bookingId, bookingId), (0, drizzle_orm_1.eq)(payment_1.payments.status, types_1.PaymentStatus.PAID)))
                .limit(1);
            if (existingPayment.length > 0) {
                throw new errorHandler_1.ConflictError("Booking already has a successful payment");
            }
            const newPayment = {
                bookingId,
                customerId: finalCustomerId,
                method,
                amount: amount.toString(),
                status: types_1.PaymentStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const [insertResult] = await database_1.db.insert(payment_1.payments).values(newPayment);
            const gatewayResponse = await this.processPaymentGateway({
                amount,
                method,
                bookingId,
            });
            const updatedStatus = gatewayResponse.success
                ? types_1.PaymentStatus.PAID
                : types_1.PaymentStatus.FAILED;
            await database_1.db
                .update(payment_1.payments)
                .set({
                status: updatedStatus,
                transactionId: gatewayResponse.transactionId,
                paymentGatewayResponse: gatewayResponse.gatewayResponse,
                paidAt: gatewayResponse.success ? new Date() : undefined,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(payment_1.payments.id, insertResult.insertId.toString()));
            const payment = await this.getPaymentById(insertResult.insertId.toString());
            if (!payment) {
                throw new errorHandler_1.DatabaseError("Failed to create payment");
            }
            return payment;
        }
        catch (error) {
            if (error instanceof errorHandler_1.ConflictError || error instanceof errorHandler_1.DatabaseError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError(`Failed to create payment: ${error}`);
        }
    }
    async updatePaymentStatus(paymentId, status, transactionId, gatewayResponse) {
        try {
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                throw new errorHandler_1.NotFoundError("Payment not found");
            }
            await database_1.db
                .update(payment_1.payments)
                .set({
                status,
                transactionId: transactionId || payment.transactionId,
                paymentGatewayResponse: gatewayResponse || payment.paymentGatewayResponse,
                paidAt: status === types_1.PaymentStatus.PAID ? new Date() : payment.paidAt,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(payment_1.payments.id, paymentId));
            const updatedPayment = await this.getPaymentById(paymentId);
            if (!updatedPayment) {
                throw new errorHandler_1.DatabaseError("Failed to update payment");
            }
            return updatedPayment;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError || error instanceof errorHandler_1.DatabaseError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError(`Failed to update payment status: ${error}`);
        }
    }
    async processRefund(paymentId, refundAmount, reason) {
        try {
            const payment = await this.getPaymentById(paymentId);
            if (!payment) {
                throw new errorHandler_1.NotFoundError("Payment not found");
            }
            if (payment.status !== types_1.PaymentStatus.PAID) {
                throw new errorHandler_1.BadRequestError("Can only refund paid payments");
            }
            const paymentAmount = parseFloat(payment.amount);
            const amountToRefund = refundAmount || paymentAmount;
            if (amountToRefund > paymentAmount) {
                throw new errorHandler_1.BadRequestError("Refund amount cannot exceed payment amount");
            }
            const refundResponse = await this.processRefundGateway({
                originalTransactionId: payment.transactionId || "",
                refundAmount: amountToRefund,
                reason: reason || "Customer requested refund",
            });
            if (!refundResponse.success) {
                throw new errorHandler_1.BadRequestError(refundResponse.message || "Refund processing failed");
            }
            return this.updatePaymentStatus(paymentId, types_1.PaymentStatus.REFUNDED, payment.transactionId, {
                ...payment.paymentGatewayResponse,
                refund: refundResponse,
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError ||
                error instanceof errorHandler_1.BadRequestError ||
                error instanceof errorHandler_1.DatabaseError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError(`Failed to process refund: ${error}`);
        }
    }
    async getPaymentStats(startDate, endDate) {
        try {
            const whereConditions = [];
            if (startDate) {
                whereConditions.push((0, drizzle_orm_1.gte)(payment_1.payments.createdAt, startDate));
            }
            if (endDate) {
                whereConditions.push((0, drizzle_orm_1.lte)(payment_1.payments.createdAt, endDate));
            }
            const [statusStats, methodStats, revenueStats] = await Promise.all([
                database_1.db
                    .select({
                    status: payment_1.payments.status,
                    count: (0, drizzle_orm_1.count)(),
                })
                    .from(payment_1.payments)
                    .where(whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined)
                    .groupBy(payment_1.payments.status),
                database_1.db
                    .select({
                    method: payment_1.payments.method,
                    count: (0, drizzle_orm_1.count)(),
                })
                    .from(payment_1.payments)
                    .where(whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined)
                    .groupBy(payment_1.payments.method),
                database_1.db
                    .select({
                    totalRevenue: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${payment_1.payments.amount} AS DECIMAL(10,2))), 0)`,
                    paidCount: (0, drizzle_orm_1.count)(),
                })
                    .from(payment_1.payments)
                    .where(whereConditions.length > 0
                    ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payment_1.payments.status, types_1.PaymentStatus.PAID), ...whereConditions)
                    : (0, drizzle_orm_1.eq)(payment_1.payments.status, types_1.PaymentStatus.PAID)),
            ]);
            return {
                statusBreakdown: statusStats,
                methodBreakdown: methodStats,
                totalRevenue: revenueStats[0]?.totalRevenue || 0,
                paidPaymentsCount: revenueStats[0]?.paidCount || 0,
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError(`Failed to get payment statistics: ${error}`);
        }
    }
    async processPaymentGateway(data) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const success = Math.random() > 0.1;
        if (success) {
            return {
                success: true,
                transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                gatewayResponse: {
                    status: "success",
                    amount: data.amount,
                    method: data.method,
                    processedAt: new Date().toISOString(),
                },
            };
        }
        else {
            return {
                success: false,
                message: "Payment declined by gateway",
                gatewayResponse: {
                    status: "failed",
                    errorCode: "DECLINED",
                    errorMessage: "Insufficient funds or invalid payment method",
                },
            };
        }
    }
    async processRefundGateway(data) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const success = Math.random() > 0.05;
        if (success) {
            return {
                success: true,
                transactionId: `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                gatewayResponse: {
                    status: "refunded",
                    refundAmount: data.refundAmount,
                    originalTransactionId: data.originalTransactionId,
                    reason: data.reason,
                    processedAt: new Date().toISOString(),
                },
            };
        }
        else {
            return {
                success: false,
                message: "Refund processing failed",
                gatewayResponse: {
                    status: "failed",
                    errorCode: "REFUND_FAILED",
                    errorMessage: "Unable to process refund at this time",
                },
            };
        }
    }
}
exports.default = new PaymentService();
//# sourceMappingURL=paymentService.js.map