import { eq, and, desc, count, gte, lte, between, sql, sum } from "drizzle-orm";
import { db } from "../config/database";
import { payments, type Payment, type NewPayment } from "../models/payment";
import { bookings } from "../models/booking";
import { users } from "../models/user";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  DatabaseError,
} from "../middleware/errorHandler";
import { PaymentStatus, PaymentMethod } from "../utils/types";

interface GetPaymentsParams {
  page: number;
  limit: number;
  bookingId?: string;
  customerId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface PaymentWithDetails extends Payment {
  booking: {
    id: string;
    appointmentDate: Date;
    appointmentTime: string;
    totalAmount: number;
    status: string;
  };
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  gatewayResponse?: any;
  message?: string;
}

class PaymentService {
  /**
   * Get payments with pagination and filters
   */
  async getPayments(params: GetPaymentsParams): Promise<{
    payments: PaymentWithDetails[];
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        bookingId,
        customerId,
        status,
        method,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = params;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (bookingId) {
        whereConditions.push(eq(payments.bookingId, bookingId));
      }

      if (status) {
        whereConditions.push(eq(payments.status, status));
      }

      if (method) {
        whereConditions.push(eq(payments.method, method));
      }

      if (startDate) {
        whereConditions.push(gte(payments.createdAt, startDate));
      }

      if (endDate) {
        whereConditions.push(lte(payments.createdAt, endDate));
      }

      // Query for payments
      const query = db
        .select({
          payment: payments,
          booking: {
            id: bookings.id,
            appointmentDate: bookings.appointmentDate,
            appointmentTime: bookings.appointmentTime,
            totalAmount: bookings.totalAmount,
            status: bookings.status,
          },
          customer: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phone: users.phone,
          },
        })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.id))
        .innerJoin(users, eq(bookings.customerId, users.id))
        .limit(limit)
        .offset(offset);

      if (whereConditions.length > 0) {
        query.where(and(...whereConditions));
      }

      // Apply sorting
      if (sortOrder === "desc") {
        query.orderBy(desc(payments.createdAt));
      } else {
        query.orderBy(payments.createdAt);
      }

      const results = await query;

      // Get total count
      const countQuery = db
        .select({ count: count() })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.id))
        .innerJoin(users, eq(bookings.customerId, users.id));

      if (whereConditions.length > 0) {
        countQuery.where(and(...whereConditions));
      }

      const [{ count: total }] = await countQuery;

      // Format results
      const paymentsWithDetails: PaymentWithDetails[] = results.map((row) => ({
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
    } catch (error) {
      throw new DatabaseError(`Failed to fetch payments: ${error}`);
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentWithDetails | null> {
    try {
      const result = await db
        .select({
          payment: payments,
          booking: {
            id: bookings.id,
            appointmentDate: bookings.appointmentDate,
            appointmentTime: bookings.appointmentTime,
            totalAmount: bookings.totalAmount,
            status: bookings.status,
          },
          customer: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phone: users.phone,
          },
        })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.id))
        .innerJoin(users, eq(bookings.customerId, users.id))
        .where(eq(payments.id, paymentId))
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
    } catch (error) {
      throw new DatabaseError(`Failed to fetch payment: ${error}`);
    }
  }

  /**
   * Create a new payment
   */
  async createPayment(data: {
    bookingId: string;
    method: PaymentMethod;
    amount: number;
    customerId?: string;
  }): Promise<PaymentWithDetails> {
    try {
      const { bookingId, method, amount, customerId } = data;

      // Get booking details to extract customerId if not provided
      let finalCustomerId = customerId;
      if (!finalCustomerId) {
        const booking = await db
          .select({ customerId: bookings.customerId })
          .from(bookings)
          .where(eq(bookings.id, bookingId))
          .limit(1);

        if (booking.length === 0) {
          throw new NotFoundError("Booking not found");
        }
        finalCustomerId = booking[0].customerId;
      }

      // Verify booking doesn't already have a successful payment
      const existingPayment = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.bookingId, bookingId),
            eq(payments.status, PaymentStatus.PAID),
          ),
        )
        .limit(1);

      if (existingPayment.length > 0) {
        throw new ConflictError("Booking already has a successful payment");
      }

      // Create payment record
      const newPayment: NewPayment = {
        bookingId,
        customerId: finalCustomerId,
        method,
        amount: amount.toString(),
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [insertResult] = await db.insert(payments).values(newPayment);

      // Process payment through gateway (dummy implementation)
      const gatewayResponse = await this.processPaymentGateway({
        amount,
        method,
        bookingId,
      });

      // Update payment status based on gateway response
      const updatedStatus = gatewayResponse.success
        ? PaymentStatus.PAID
        : PaymentStatus.FAILED;

      await db
        .update(payments)
        .set({
          status: updatedStatus,
          transactionId: gatewayResponse.transactionId,
          paymentGatewayResponse: gatewayResponse.gatewayResponse,
          paidAt: gatewayResponse.success ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, insertResult.insertId.toString()));

      // Return the created payment with details
      const payment = await this.getPaymentById(
        insertResult.insertId.toString(),
      );

      if (!payment) {
        throw new DatabaseError("Failed to create payment");
      }

      return payment;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create payment: ${error}`);
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionId?: string,
    gatewayResponse?: any,
  ): Promise<PaymentWithDetails> {
    try {
      const payment = await this.getPaymentById(paymentId);

      if (!payment) {
        throw new NotFoundError("Payment not found");
      }

      // Update payment
      await db
        .update(payments)
        .set({
          status,
          transactionId: transactionId || payment.transactionId,
          paymentGatewayResponse:
            gatewayResponse || payment.paymentGatewayResponse,
          paidAt: status === PaymentStatus.PAID ? new Date() : payment.paidAt,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      // Return updated payment
      const updatedPayment = await this.getPaymentById(paymentId);

      if (!updatedPayment) {
        throw new DatabaseError("Failed to update payment");
      }

      return updatedPayment;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update payment status: ${error}`);
    }
  }

  /**
   * Update payment method and process payment
   */
  async updatePaymentMethodAndProcess(
    bookingId: string,
    method: PaymentMethod,
    transactionId?: string,
  ): Promise<PaymentWithDetails> {
    try {
      // Find existing payment for this booking
      const [existingPayment] = await db
        .select()
        .from(payments)
        .where(eq(payments.bookingId, bookingId))
        .limit(1);

      if (!existingPayment) {
        throw new NotFoundError("Payment not found for this booking");
      }

      // Process payment through gateway (dummy implementation)
      const gatewayResponse = await this.processPaymentGateway({
        amount: parseFloat(existingPayment.amount),
        method,
        bookingId,
      });

      // Update payment with new method and status
      const updatedStatus = gatewayResponse.success
        ? PaymentStatus.PAID
        : PaymentStatus.FAILED;

      await db
        .update(payments)
        .set({
          method,
          status: updatedStatus,
          transactionId: transactionId || gatewayResponse.transactionId,
          paymentGatewayResponse: gatewayResponse.gatewayResponse,
          paidAt: gatewayResponse.success ? new Date() : undefined,
          failedAt: !gatewayResponse.success ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id));

      // If payment successful, update booking status to confirmed
      if (gatewayResponse.success) {
        await db
          .update(bookings)
          .set({
            status: "confirmed",
            confirmedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, bookingId));
      }

      // Return updated payment
      const updatedPayment = await this.getPaymentById(existingPayment.id);

      if (!updatedPayment) {
        throw new DatabaseError("Failed to update payment");
      }

      return updatedPayment;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update payment method: ${error}`);
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentId: string,
    refundAmount?: number,
    reason?: string,
  ): Promise<PaymentWithDetails> {
    try {
      const payment = await this.getPaymentById(paymentId);

      if (!payment) {
        throw new NotFoundError("Payment not found");
      }

      if (payment.status !== PaymentStatus.PAID) {
        throw new BadRequestError("Can only refund paid payments");
      }

      const paymentAmount = parseFloat(payment.amount);
      const amountToRefund = refundAmount || paymentAmount;

      if (amountToRefund > paymentAmount) {
        throw new BadRequestError("Refund amount cannot exceed payment amount");
      }

      // Process refund through gateway (dummy implementation)
      const refundResponse = await this.processRefundGateway({
        originalTransactionId: payment.transactionId || "",
        refundAmount: amountToRefund,
        reason: reason || "Customer requested refund",
      });

      if (!refundResponse.success) {
        throw new BadRequestError(
          refundResponse.message || "Refund processing failed",
        );
      }

      // Update payment status
      return this.updatePaymentStatus(
        paymentId,
        PaymentStatus.REFUNDED,
        payment.transactionId,
        {
          ...payment.paymentGatewayResponse,
          refund: refundResponse,
        },
      );
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof BadRequestError ||
        error instanceof DatabaseError
      ) {
        throw error;
      }
      throw new DatabaseError(`Failed to process refund: ${error}`);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(startDate?: Date, endDate?: Date) {
    try {
      const whereConditions = [];

      if (startDate) {
        whereConditions.push(gte(payments.createdAt, startDate));
      }

      if (endDate) {
        whereConditions.push(lte(payments.createdAt, endDate));
      }

      // Get all stats in parallel
      const [statusStats, methodStats, revenueStats] = await Promise.all([
        // Total payments by status
        db
          .select({
            status: payments.status,
            count: count(),
          })
          .from(payments)
          .where(
            whereConditions.length > 0 ? and(...whereConditions) : undefined,
          )
          .groupBy(payments.status),

        // Payment methods breakdown
        db
          .select({
            method: payments.method,
            count: count(),
          })
          .from(payments)
          .where(
            whereConditions.length > 0 ? and(...whereConditions) : undefined,
          )
          .groupBy(payments.method),

        // Total revenue from paid payments
        db
          .select({
            totalRevenue: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(10,2))), 0)`,
            paidCount: count(),
          })
          .from(payments)
          .where(
            whereConditions.length > 0
              ? and(eq(payments.status, PaymentStatus.PAID), ...whereConditions)
              : eq(payments.status, PaymentStatus.PAID),
          ),
      ]);

      return {
        statusBreakdown: statusStats,
        methodBreakdown: methodStats,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        paidPaymentsCount: revenueStats[0]?.paidCount || 0,
      };
    } catch (error) {
      throw new DatabaseError(`Failed to get payment statistics: ${error}`);
    }
  }

  /**
   * Dummy payment gateway processor
   */
  private async processPaymentGateway(data: {
    amount: number;
    method: PaymentMethod;
    bookingId: string;
  }): Promise<PaymentGatewayResponse> {
    // Simulate gateway processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Dummy logic - simulate 90% success rate
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
    } else {
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

  /**
   * Dummy refund processor
   */
  private async processRefundGateway(data: {
    originalTransactionId: string;
    refundAmount: number;
    reason: string;
  }): Promise<PaymentGatewayResponse> {
    // Simulate gateway processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Dummy logic - simulate 95% success rate for refunds
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
    } else {
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

export default new PaymentService();
