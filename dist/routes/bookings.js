"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = __importDefault(require("../controllers/bookingController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticateToken, (0, validation_1.validateQuery)(validation_1.queryValidation.pagination.keys({
    customerId: joi_1.default.string().optional(),
    stylistId: joi_1.default.string().optional(),
    serviceId: joi_1.default.string().optional(),
    status: joi_1.default.string()
        .valid("pending", "confirmed", "in_progress", "completed", "cancelled", "no_show")
        .optional(),
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().optional().min(joi_1.default.ref("startDate")),
    sortBy: joi_1.default.string()
        .valid("createdAt", "appointmentDate", "status", "totalAmount")
        .optional(),
})), bookingController_1.default.getBookings);
router.get("/time-slots", auth_1.authenticateToken, (0, validation_1.validateQuery)(joi_1.default.object({
    stylistId: joi_1.default.string().required().messages({
        "any.required": "Stylist ID is required",
    }),
    date: joi_1.default.date().iso().required().messages({
        "any.required": "Date is required",
    }),
    serviceId: joi_1.default.string().required().messages({
        "any.required": "Service ID is required",
    }),
})), bookingController_1.default.getAvailableTimeSlots);
router.post("/", auth_1.authenticateToken, (0, validation_1.validateBody)(validation_1.bookingValidation.create), bookingController_1.default.createBooking);
router.get("/:id", auth_1.authenticateToken, validation_1.validateId, (0, auth_1.checkResourceOwnership)('booking'), bookingController_1.default.getBookingById);
router.put("/:id", auth_1.authenticateToken, validation_1.validateId, (0, auth_1.checkResourceOwnership)('booking'), (0, validation_1.validateBody)(validation_1.bookingValidation.update), bookingController_1.default.updateBooking);
router.put("/:id/reschedule", auth_1.authenticateToken, validation_1.validateId, (0, auth_1.checkResourceOwnership)('booking'), (0, validation_1.validateBody)(joi_1.default.object({
    appointmentDate: joi_1.default.date().iso().min("now").required().messages({
        "any.required": "New appointment date is required",
        "date.min": "Appointment date cannot be in the past",
    }),
    appointmentTime: joi_1.default.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
        "string.pattern.base": "Please provide a valid time in HH:MM format",
        "any.required": "New appointment time is required",
    }),
    reason: joi_1.default.string().min(5).max(200).optional().messages({
        "string.min": "Reason must be at least 5 characters",
        "string.max": "Reason cannot exceed 200 characters",
    }),
})), bookingController_1.default.rescheduleBooking);
router.put("/:id/cancel", auth_1.authenticateToken, validation_1.validateId, (0, auth_1.checkResourceOwnership)('booking'), (0, validation_1.validateBody)(joi_1.default.object({
    reason: joi_1.default.string().max(500).optional().allow('', null).messages({
        "string.max": "Cancellation reason cannot exceed 500 characters",
    }),
    cancelReason: joi_1.default.string().max(500).optional().allow('', null).messages({
        "string.max": "Cancellation reason cannot exceed 500 characters",
    }),
})), bookingController_1.default.cancelBooking);
router.put("/:id/confirm", auth_1.authenticateToken, (0, auth_1.checkPermission)('bookings', 'update'), validation_1.validateId, bookingController_1.default.confirmBooking);
router.put("/:id/start", auth_1.authenticateToken, (0, auth_1.checkPermission)('bookings', 'update'), validation_1.validateId, bookingController_1.default.startBooking);
router.put("/:id/complete", auth_1.authenticateToken, (0, auth_1.checkPermission)('bookings', 'update'), validation_1.validateId, bookingController_1.default.completeBooking);
router.put("/:id/no-show", auth_1.authenticateToken, (0, auth_1.checkPermission)('bookings', 'update'), validation_1.validateId, (0, validation_1.validateBody)(joi_1.default.object({
    reason: joi_1.default.string().max(200).optional().messages({
        "string.max": "Reason cannot exceed 200 characters",
    }),
})), bookingController_1.default.markNoShow);
router.get("/stats", auth_1.authenticateToken, (0, auth_1.checkPermission)('reports', 'read'), bookingController_1.default.getBookingStats);
router.get("/customer/:customerId/history", auth_1.authenticateToken, (0, validation_1.validateParams)(joi_1.default.object({
    customerId: joi_1.default.string().required(),
})), (0, validation_1.validateQuery)(validation_1.queryValidation.pagination.keys({
    status: joi_1.default.string()
        .valid("pending", "confirmed", "in_progress", "completed", "cancelled", "no_show")
        .optional(),
})), bookingController_1.default.getCustomerBookingHistory);
router.get("/stylist/:stylistId/schedule", auth_1.authenticateToken, (0, auth_1.checkResourceOwnership)('stylist'), (0, validation_1.validateParams)(joi_1.default.object({
    stylistId: joi_1.default.string().required(),
})), (0, validation_1.validateQuery)(joi_1.default.object({
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().min(joi_1.default.ref("startDate")).optional(),
})), bookingController_1.default.getStylistBookingSchedule);
exports.default = router;
//# sourceMappingURL=bookings.js.map