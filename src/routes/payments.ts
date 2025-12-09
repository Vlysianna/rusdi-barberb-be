import { Router } from "express";
import paymentController from "../controllers/paymentController";
import {
  authenticateToken,
  checkPermission,
  checkResourceOwnership,
  restrictTo,
} from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
  validateId,
  paymentValidation,
  queryValidation,
} from "../middleware/validation";
import Joi from "joi";

const router = Router();

/**
 * Customer routes
 */

// GET /payments - Get payments (filtered by user role)
router.get(
  "/",
  authenticateToken,
  validateQuery(
    queryValidation.pagination.keys({
      customerId: Joi.string().optional(),
      bookingId: Joi.string().optional(),
      status: Joi.string()
        .valid("pending", "paid", "failed", "refunded", "cancelled")
        .optional(),
      method: Joi.string()
        .valid("cash", "credit_card", "debit_card", "digital_wallet", "bank_transfer")
        .optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional().min(Joi.ref("startDate")),
      sortBy: Joi.string()
        .valid("createdAt", "amount", "status", "paidAt")
        .optional(),
    }),
  ),
  paymentController.getPayments,
);

// GET /payments/methods - Get available payment methods
router.get(
  "/methods",
  authenticateToken,
  paymentController.getPaymentMethods,
);

// GET /payments/stats - Get payment statistics (Admin)
// MUST BE BEFORE /:id routes to avoid collision
router.get(
  "/stats",
  authenticateToken,
  checkPermission('reports', 'read'),
  paymentController.getPaymentStats,
);

// POST /payments/:bookingId/checkout - Update payment method and process for booking
// MUST BE BEFORE other /:id routes to avoid collision
router.post(
  "/:bookingId/checkout",
  authenticateToken,
  validateBody(
    Joi.object({
      paymentMethod: Joi.string()
        .valid("cash", "credit_card", "debit_card", "digital_wallet", "bank_transfer", "ewallet")
        .required(),
      transactionId: Joi.string().optional(),
    }),
  ),
  paymentController.updatePaymentMethod,
);

// POST /payments - Create new payment
router.post(
  "/",
  authenticateToken,
  validateBody(paymentValidation.create),
  paymentController.createPayment,
);

// GET /payments/:id - Get payment by ID
router.get(
  "/:id",
  authenticateToken,
  validateId,
  paymentController.getPaymentById,
);

// POST /payments/:id/process - Process payment (Dummy gateway)
router.post(
  "/:id/process",
  authenticateToken,
  validateId,
  validateBody(
    Joi.object({
      transactionId: Joi.string().optional(),
      gatewayResponse: Joi.object().optional(),
    }),
  ),
  paymentController.processPayment,
);

// POST /payments/:id/retry - Retry failed payment
router.post(
  "/:id/retry",
  authenticateToken,
  validateId,
  paymentController.retryPayment,
);

// GET /payments/:id/receipt - Get payment receipt
router.get(
  "/:id/receipt",
  authenticateToken,
  validateId,
  validateQuery(
    Joi.object({
      format: Joi.string().valid("json", "pdf").optional().default("json"),
    }),
  ),
  paymentController.getPaymentReceipt,
);

/**
 * Admin/Stylist routes
 */

// POST /payments/:id/refund - Refund payment (Admin/Stylist)
router.post(
  "/:id/refund",
  authenticateToken,
  checkPermission('payments', 'update'),
  validateId,
  validateBody(
    Joi.object({
      reason: Joi.string().min(5).max(500).required().messages({
        "string.min": "Refund reason must be at least 5 characters",
        "string.max": "Refund reason cannot exceed 500 characters",
        "any.required": "Refund reason is required",
      }),
      amount: Joi.number().positive().precision(2).optional().messages({
        "number.positive": "Refund amount must be positive",
      }),
    }),
  ),
  paymentController.refundPayment,
);

/**
 * Customer specific routes
 */

// GET /payments/customer/:customerId/history - Get customer payment history
router.get(
  "/customer/:customerId/history",
  authenticateToken,
  validateParams(
    Joi.object({
      customerId: Joi.string().required(),
    }),
  ),
  validateQuery(
    queryValidation.pagination.keys({
      status: Joi.string()
        .valid("pending", "paid", "failed", "refunded", "cancelled")
        .optional(),
    }),
  ),
  checkResourceOwnership('customer'),
  paymentController.getCustomerPaymentHistory,
);

/**
 * Webhook routes (for payment gateway callbacks)
 */

// POST /payments/webhooks/:provider - Handle payment webhooks
router.post(
  "/webhooks/:provider",
  validateParams(
    Joi.object({
      provider: Joi.string().required(),
    }),
  ),
  paymentController.paymentWebhook,
);

export default router;
