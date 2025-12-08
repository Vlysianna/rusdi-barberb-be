"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = __importDefault(require("../controllers/paymentController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticateToken, (0, validation_1.validateQuery)(validation_1.queryValidation.pagination.keys({
    customerId: joi_1.default.string().optional(),
    bookingId: joi_1.default.string().optional(),
    status: joi_1.default.string()
        .valid("pending", "paid", "failed", "refunded", "cancelled")
        .optional(),
    method: joi_1.default.string()
        .valid("cash", "credit_card", "debit_card", "digital_wallet", "bank_transfer")
        .optional(),
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().optional().min(joi_1.default.ref("startDate")),
    sortBy: joi_1.default.string()
        .valid("createdAt", "amount", "status", "paidAt")
        .optional(),
})), paymentController_1.default.getPayments);
router.get("/methods", auth_1.authenticateToken, paymentController_1.default.getPaymentMethods);
router.post("/booking/:bookingId/pay", auth_1.authenticateToken, (0, validation_1.validateParams)(joi_1.default.object({
    bookingId: joi_1.default.string().required(),
})), (0, validation_1.validateBody)(joi_1.default.object({
    paymentMethod: joi_1.default.string()
        .valid("cash", "credit_card", "debit_card", "digital_wallet", "bank_transfer", "ewallet")
        .required(),
    transactionId: joi_1.default.string().optional(),
})), paymentController_1.default.updatePaymentMethod);
router.post("/", auth_1.authenticateToken, (0, validation_1.validateBody)(validation_1.paymentValidation.create), paymentController_1.default.createPayment);
router.get("/:id", auth_1.authenticateToken, validation_1.validateId, paymentController_1.default.getPaymentById);
router.post("/:id/process", auth_1.authenticateToken, validation_1.validateId, (0, validation_1.validateBody)(joi_1.default.object({
    transactionId: joi_1.default.string().optional(),
    gatewayResponse: joi_1.default.object().optional(),
})), paymentController_1.default.processPayment);
router.post("/:id/retry", auth_1.authenticateToken, validation_1.validateId, paymentController_1.default.retryPayment);
router.get("/:id/receipt", auth_1.authenticateToken, validation_1.validateId, (0, validation_1.validateQuery)(joi_1.default.object({
    format: joi_1.default.string().valid("json", "pdf").optional().default("json"),
})), paymentController_1.default.getPaymentReceipt);
router.post("/:id/refund", auth_1.authenticateToken, (0, auth_1.checkPermission)('payments', 'update'), validation_1.validateId, (0, validation_1.validateBody)(joi_1.default.object({
    reason: joi_1.default.string().min(5).max(500).required().messages({
        "string.min": "Refund reason must be at least 5 characters",
        "string.max": "Refund reason cannot exceed 500 characters",
        "any.required": "Refund reason is required",
    }),
    amount: joi_1.default.number().positive().precision(2).optional().messages({
        "number.positive": "Refund amount must be positive",
    }),
})), paymentController_1.default.refundPayment);
router.get("/stats", auth_1.authenticateToken, (0, auth_1.checkPermission)('reports', 'read'), paymentController_1.default.getPaymentStats);
router.get("/customer/:customerId/history", auth_1.authenticateToken, (0, validation_1.validateParams)(joi_1.default.object({
    customerId: joi_1.default.string().required(),
})), (0, validation_1.validateQuery)(validation_1.queryValidation.pagination.keys({
    status: joi_1.default.string()
        .valid("pending", "paid", "failed", "refunded", "cancelled")
        .optional(),
})), (0, auth_1.checkResourceOwnership)('customer'), paymentController_1.default.getCustomerPaymentHistory);
router.post("/webhooks/:provider", (0, validation_1.validateParams)(joi_1.default.object({
    provider: joi_1.default.string().required(),
})), paymentController_1.default.paymentWebhook);
exports.default = router;
//# sourceMappingURL=payments.js.map