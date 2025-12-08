import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import paymentService from "../services/paymentService";
import { ApiResponseUtil } from "../utils/response";
import { asyncHandler } from "../middleware/errorHandler";
import { PaymentStatus, PaymentMethod } from "../utils/types";

class PaymentController {
  /**
   * Get all payments with pagination and filters
   */
  getPayments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        customerId,
        bookingId,
        status,
        method,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // For customers, only show their own payments
      let finalCustomerId = customerId as string;
      if (req.user?.role === "customer") {
        finalCustomerId = req.user.userId;
      }

      const result = await paymentService.getPayments({
        page: Number(page),
        limit: Number(limit),
        customerId: finalCustomerId,
        bookingId: bookingId as string,
        status: status as PaymentStatus,
        method: method as PaymentMethod,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return ApiResponseUtil.paginated(
        res,
        result.payments,
        result.total,
        Number(page),
        Number(limit),
        "Payments retrieved successfully",
      );
    },
  );

  /**
   * Get payment by ID
   */
  getPaymentById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Payment ID is required");
      }

      const payment = await paymentService.getPaymentById(id);

      if (!payment) {
        return ApiResponseUtil.notFound(res, "Payment not found");
      }

      // Check access permissions
      if (
        req.user?.role === "customer" &&
        payment.customerId !== req.user.userId
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only view your own payments",
        );
      }

      return ApiResponseUtil.success(
        res,
        "Payment retrieved successfully",
        payment,
      );
    },
  );

  /**
   * Create new payment
   */
  createPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { bookingId, amount, method, metadata } = req.body;

      // Customer ID comes from authenticated user
      const customerId = req.user!.userId;

      const paymentData = {
        bookingId,
        customerId,
        amount: parseFloat(amount),
        method,
        metadata,
      };

      const payment = await paymentService.createPayment(paymentData);

      return ApiResponseUtil.created(
        res,
        payment,
        "Payment created successfully",
      );
    },
  );

  /**
   * Process payment (Dummy implementation)
   */
  processPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { transactionId, gatewayResponse } = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Payment ID is required");
      }

      // Check if user can process this payment
      const existingPayment = await paymentService.getPaymentById(id);

      if (!existingPayment) {
        return ApiResponseUtil.notFound(res, "Payment not found");
      }

      if (
        req.user?.role === "customer" &&
        existingPayment.customerId !== req.user.userId
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only process your own payments",
        );
      }

      const payment = await paymentService.updatePaymentStatus(
        id,
        req.body.status || "paid",
        transactionId,
        gatewayResponse,
      );

      const message =
        payment.status === "paid"
          ? "Payment processed successfully"
          : "Payment processing failed";

      return ApiResponseUtil.success(res, message, payment);
    },
  );

  /**
   * Update payment method and process for a booking
   */
  updatePaymentMethod = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { bookingId } = req.params;
      const { paymentMethod, transactionId } = req.body;

      if (!bookingId) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      if (!paymentMethod) {
        return ApiResponseUtil.badRequest(res, "Payment method is required");
      }

      // Map frontend payment method to backend enum
      let method: PaymentMethod;
      switch (paymentMethod) {
        case 'cash':
          method = 'cash' as PaymentMethod;
          break;
        case 'bank_transfer':
          method = 'bank_transfer' as PaymentMethod;
          break;
        case 'ewallet':
        case 'digital_wallet':
          method = 'digital_wallet' as PaymentMethod;
          break;
        case 'credit_card':
          method = 'credit_card' as PaymentMethod;
          break;
        case 'debit_card':
          method = 'debit_card' as PaymentMethod;
          break;
        default:
          method = 'cash' as PaymentMethod;
      }

      const payment = await paymentService.updatePaymentMethodAndProcess(
        bookingId,
        method,
        transactionId,
      );

      return ApiResponseUtil.success(
        res,
        "Payment processed successfully",
        payment,
      );
    },
  );

  /**
   * Refund payment (Admin/Stylist only)
   */
  refundPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { reason, amount } = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Payment ID is required");
      }

      if (!reason) {
        return ApiResponseUtil.badRequest(res, "Refund reason is required");
      }

      const payment = await paymentService.processRefund(
        id,
        amount ? parseFloat(amount) : undefined,
        reason,
      );

      return ApiResponseUtil.success(
        res,
        "Payment refunded successfully",
        payment,
      );
    },
  );

  /**
   * Get payment statistics (Admin only)
   */
  getPaymentStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const stats = await paymentService.getPaymentStats();

      return ApiResponseUtil.success(
        res,
        "Payment statistics retrieved successfully",
        stats,
      );
    },
  );

  /**
   * Get customer's payment history
   */
  getCustomerPaymentHistory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { customerId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      if (!customerId) {
        return ApiResponseUtil.badRequest(res, "Customer ID is required");
      }

      // Customers can only view their own payment history
      if (req.user?.role === "customer" && customerId !== req.user.userId) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only view your own payment history",
        );
      }

      const result = await paymentService.getPayments({
        page: Number(page),
        limit: Number(limit),
        customerId,
        status: status as PaymentStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      return ApiResponseUtil.paginated(
        res,
        result.payments,
        result.total,
        Number(page),
        Number(limit),
        "Customer payment history retrieved successfully",
      );
    },
  );

  /**
   * Get payment methods (for customer convenience)
   */
  getPaymentMethods = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // Dummy payment methods
      const paymentMethods = [
        {
          id: "cash",
          name: "Cash",
          description: "Pay with cash at the salon",
          icon: "💵",
          isActive: true,
          processingTime: "Instant",
        },
        {
          id: "credit_card",
          name: "Credit Card",
          description: "Visa, MasterCard, American Express",
          icon: "💳",
          isActive: true,
          processingTime: "1-2 minutes",
        },
        {
          id: "debit_card",
          name: "Debit Card",
          description: "Bank debit cards",
          icon: "💳",
          isActive: true,
          processingTime: "1-2 minutes",
        },
        {
          id: "digital_wallet",
          name: "Digital Wallet",
          description: "GoPay, OVO, DANA, ShopeePay",
          icon: "📱",
          isActive: true,
          processingTime: "30 seconds",
        },
        {
          id: "bank_transfer",
          name: "Bank Transfer",
          description: "Direct bank transfer",
          icon: "🏦",
          isActive: true,
          processingTime: "5-10 minutes",
        },
      ];

      return ApiResponseUtil.success(
        res,
        "Payment methods retrieved successfully",
        paymentMethods,
      );
    },
  );

  /**
   * Simulate payment gateway callback/webhook
   */
  paymentWebhook = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { provider = "dummy-gateway" } = req.params;
      const webhookData = {
        provider,
        eventType: req.body.event_type || "payment.completed",
        eventId: req.body.event_id || `evt_${Date.now()}`,
        payload: req.body,
        signature: req.headers["x-signature"] as string,
      };

      // Dummy webhook handling - in real implementation you would process the webhook
      return ApiResponseUtil.success(res, "Webhook received and processed", {
        processed: true,
        eventType: webhookData.eventType,
        provider: webhookData.provider,
      });
    },
  );

  /**
   * Get payment receipt (generate dummy receipt)
   */
  getPaymentReceipt = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { format = "json" } = req.query;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Payment ID is required");
      }

      const payment = await paymentService.getPaymentById(id);

      if (!payment) {
        return ApiResponseUtil.notFound(res, "Payment not found");
      }

      // Check access permissions
      if (
        req.user?.role === "customer" &&
        payment.customerId !== req.user.userId
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only view your own payment receipts",
        );
      }

      if (payment.status !== "paid") {
        return ApiResponseUtil.badRequest(
          res,
          "Receipt is only available for paid payments",
        );
      }

      // Generate receipt data
      const receipt = {
        receiptId: `RC_${payment.id.substring(0, 8).toUpperCase()}`,
        paymentId: payment.id,
        transactionId: payment.transactionId,
        issuedAt: new Date(),
        customer: {
          name: payment.customer.fullName,
          email: payment.customer.email,
        },
        booking: {
          id: payment.booking.id,
          date: payment.booking.appointmentDate,
          time: payment.booking.appointmentTime,
          // service and stylist data not included in this payment response
        },
        payment: {
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          paidAt: payment.paidAt,
          fees: payment.fees || 0,
          netAmount: payment.netAmount || payment.amount,
        },
        business: {
          name: "Rusdi Barber",
          address: "Jl. Sudirman No. 123, Jakarta",
          phone: "+62 21 1234 5678",
          email: "info@rusdibarber.com",
        },
      };

      if (format === "pdf") {
        // In a real implementation, you would generate PDF here
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=receipt_${receipt.receiptId}.pdf`,
        );
        return res.send("PDF generation not implemented in this demo");
      }

      return ApiResponseUtil.success(
        res,
        "Payment receipt retrieved successfully",
        receipt,
      );
    },
  );

  /**
   * Retry failed payment
   */
  retryPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Payment ID is required");
      }

      const existingPayment = await paymentService.getPaymentById(id);

      if (!existingPayment) {
        return ApiResponseUtil.notFound(res, "Payment not found");
      }

      if (existingPayment.status !== "failed") {
        return ApiResponseUtil.badRequest(
          res,
          "Only failed payments can be retried",
        );
      }

      // Check access permissions
      if (
        req.user?.role === "customer" &&
        existingPayment.customerId !== req.user.userId
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only retry your own payments",
        );
      }

      // Reset payment to pending and process again
      const payment = await paymentService.updatePaymentStatus(
        id,
        PaymentStatus.PENDING,
      );

      const message =
        payment.status === "paid"
          ? "Payment retry successful"
          : "Payment retry failed";

      return ApiResponseUtil.success(res, message, payment);
    },
  );
}

export default new PaymentController();
