"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentService_1 = __importDefault(require("../services/paymentService"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../utils/types");
class PaymentController {
    constructor() {
        this.getPayments = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { page = 1, limit = 10, customerId, bookingId, status, method, startDate, endDate, sortBy = "createdAt", sortOrder = "desc", } = req.query;
            let finalCustomerId = customerId;
            if (req.user?.role === "customer") {
                finalCustomerId = req.user.userId;
            }
            const result = await paymentService_1.default.getPayments({
                page: Number(page),
                limit: Number(limit),
                customerId: finalCustomerId,
                bookingId: bookingId,
                status: status,
                method: method,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                sortBy: sortBy,
                sortOrder: sortOrder,
            });
            return response_1.ApiResponseUtil.paginated(res, result.payments, result.total, Number(page), Number(limit), "Payments retrieved successfully");
        });
        this.getPaymentById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Payment ID is required");
            }
            const payment = await paymentService_1.default.getPaymentById(id);
            if (!payment) {
                return response_1.ApiResponseUtil.notFound(res, "Payment not found");
            }
            if (req.user?.role === "customer" &&
                payment.customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only view your own payments");
            }
            return response_1.ApiResponseUtil.success(res, "Payment retrieved successfully", payment);
        });
        this.createPayment = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { bookingId, amount, method, metadata } = req.body;
            const customerId = req.user.userId;
            const paymentData = {
                bookingId,
                customerId,
                amount: parseFloat(amount),
                method,
                metadata,
            };
            const payment = await paymentService_1.default.createPayment(paymentData);
            return response_1.ApiResponseUtil.created(res, payment, "Payment created successfully");
        });
        this.processPayment = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { transactionId, gatewayResponse } = req.body;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Payment ID is required");
            }
            const existingPayment = await paymentService_1.default.getPaymentById(id);
            if (!existingPayment) {
                return response_1.ApiResponseUtil.notFound(res, "Payment not found");
            }
            if (req.user?.role === "customer" &&
                existingPayment.customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only process your own payments");
            }
            const payment = await paymentService_1.default.updatePaymentStatus(id, req.body.status || "paid", transactionId, gatewayResponse);
            const message = payment.status === "paid"
                ? "Payment processed successfully"
                : "Payment processing failed";
            return response_1.ApiResponseUtil.success(res, message, payment);
        });
        this.refundPayment = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { reason, amount } = req.body;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Payment ID is required");
            }
            if (!reason) {
                return response_1.ApiResponseUtil.badRequest(res, "Refund reason is required");
            }
            const payment = await paymentService_1.default.processRefund(id, amount ? parseFloat(amount) : undefined, reason);
            return response_1.ApiResponseUtil.success(res, "Payment refunded successfully", payment);
        });
        this.getPaymentStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const stats = await paymentService_1.default.getPaymentStats();
            return response_1.ApiResponseUtil.success(res, "Payment statistics retrieved successfully", stats);
        });
        this.getCustomerPaymentHistory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { customerId } = req.params;
            const { page = 1, limit = 10, status } = req.query;
            if (!customerId) {
                return response_1.ApiResponseUtil.badRequest(res, "Customer ID is required");
            }
            if (req.user?.role === "customer" && customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only view your own payment history");
            }
            const result = await paymentService_1.default.getPayments({
                page: Number(page),
                limit: Number(limit),
                customerId,
                status: status,
                sortBy: "createdAt",
                sortOrder: "desc",
            });
            return response_1.ApiResponseUtil.paginated(res, result.payments, result.total, Number(page), Number(limit), "Customer payment history retrieved successfully");
        });
        this.getPaymentMethods = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
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
            return response_1.ApiResponseUtil.success(res, "Payment methods retrieved successfully", paymentMethods);
        });
        this.paymentWebhook = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { provider = "dummy-gateway" } = req.params;
            const webhookData = {
                provider,
                eventType: req.body.event_type || "payment.completed",
                eventId: req.body.event_id || `evt_${Date.now()}`,
                payload: req.body,
                signature: req.headers["x-signature"],
            };
            return response_1.ApiResponseUtil.success(res, "Webhook received and processed", {
                processed: true,
                eventType: webhookData.eventType,
                provider: webhookData.provider,
            });
        });
        this.getPaymentReceipt = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { format = "json" } = req.query;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Payment ID is required");
            }
            const payment = await paymentService_1.default.getPaymentById(id);
            if (!payment) {
                return response_1.ApiResponseUtil.notFound(res, "Payment not found");
            }
            if (req.user?.role === "customer" &&
                payment.customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only view your own payment receipts");
            }
            if (payment.status !== "paid") {
                return response_1.ApiResponseUtil.badRequest(res, "Receipt is only available for paid payments");
            }
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
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename=receipt_${receipt.receiptId}.pdf`);
                return res.send("PDF generation not implemented in this demo");
            }
            return response_1.ApiResponseUtil.success(res, "Payment receipt retrieved successfully", receipt);
        });
        this.retryPayment = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Payment ID is required");
            }
            const existingPayment = await paymentService_1.default.getPaymentById(id);
            if (!existingPayment) {
                return response_1.ApiResponseUtil.notFound(res, "Payment not found");
            }
            if (existingPayment.status !== "failed") {
                return response_1.ApiResponseUtil.badRequest(res, "Only failed payments can be retried");
            }
            if (req.user?.role === "customer" &&
                existingPayment.customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only retry your own payments");
            }
            const payment = await paymentService_1.default.updatePaymentStatus(id, types_1.PaymentStatus.PENDING);
            const message = payment.status === "paid"
                ? "Payment retry successful"
                : "Payment retry failed";
            return response_1.ApiResponseUtil.success(res, message, payment);
        });
    }
}
exports.default = new PaymentController();
//# sourceMappingURL=paymentController.js.map