import { Router } from "express";
import bookingController from "../controllers/bookingController";
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
  bookingValidation,
  queryValidation,
} from "../middleware/validation";
import Joi from "joi";

const router = Router();

/**
 * Public/Customer routes
 */

// GET /bookings - Get bookings (filtered by user role)
router.get(
  "/",
  authenticateToken,
  validateQuery(
    queryValidation.pagination.keys({
      customerId: Joi.string().optional(),
      stylistId: Joi.string().optional(),
      serviceId: Joi.string().optional(),
      status: Joi.string()
        .valid("pending", "confirmed", "in_progress", "completed", "cancelled", "no_show")
        .optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional().min(Joi.ref("startDate")),
      sortBy: Joi.string()
        .valid("createdAt", "appointmentDate", "status", "totalAmount")
        .optional(),
    }),
  ),
  bookingController.getBookings,
);

// GET /bookings/time-slots - Get available time slots
router.get(
  "/time-slots",
  authenticateToken,
  validateQuery(
    Joi.object({
      stylistId: Joi.string().required().messages({
        "any.required": "Stylist ID is required",
      }),
      date: Joi.date().iso().min("now").required().messages({
        "any.required": "Date is required",
        "date.min": "Date cannot be in the past",
      }),
      serviceId: Joi.string().required().messages({
        "any.required": "Service ID is required",
      }),
    }),
  ),
  bookingController.getAvailableTimeSlots,
);

// POST /bookings - Create new booking
router.post(
  "/",
  authenticateToken,
  validateBody(bookingValidation.create),
  bookingController.createBooking,
);

// GET /bookings/:id - Get booking by ID
router.get(
  "/:id",
  authenticateToken,
  validateId,
  checkResourceOwnership('booking'),
  bookingController.getBookingById,
);

// PUT /bookings/:id - Update booking
router.put(
  "/:id",
  authenticateToken,
  validateId,
  checkResourceOwnership('booking'),
  validateBody(bookingValidation.update),
  bookingController.updateBooking,
);

// PUT /bookings/:id/reschedule - Reschedule booking
router.put(
  "/:id/reschedule",
  authenticateToken,
  validateId,
  checkResourceOwnership('booking'),
  validateBody(
    Joi.object({
      appointmentDate: Joi.date().iso().min("now").required().messages({
        "any.required": "New appointment date is required",
        "date.min": "Appointment date cannot be in the past",
      }),
      appointmentTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          "string.pattern.base": "Please provide a valid time in HH:MM format",
          "any.required": "New appointment time is required",
        }),
      reason: Joi.string().min(5).max(200).optional().messages({
        "string.min": "Reason must be at least 5 characters",
        "string.max": "Reason cannot exceed 200 characters",
      }),
    }),
  ),
  bookingController.rescheduleBooking,
);

// PUT /bookings/:id/cancel - Cancel booking
router.put(
  "/:id/cancel",
  authenticateToken,
  validateId,
  checkResourceOwnership('booking'),
  validateBody(
    Joi.object({
      reason: Joi.string().min(5).max(500).required().messages({
        "string.min": "Cancellation reason must be at least 5 characters",
        "string.max": "Cancellation reason cannot exceed 500 characters",
        "any.required": "Cancellation reason is required",
      }),
    }),
  ),
  bookingController.cancelBooking,
);

/**
 * Stylist/Admin routes
 */

// PUT /bookings/:id/confirm - Confirm booking (Stylist/Admin)
router.put(
  "/:id/confirm",
  authenticateToken,
  checkPermission('bookings', 'update'),
  validateId,
  bookingController.confirmBooking,
);

// PUT /bookings/:id/start - Start booking (Stylist/Admin)
router.put(
  "/:id/start",
  authenticateToken,
  checkPermission('bookings', 'update'),
  validateId,
  bookingController.startBooking,
);

// PUT /bookings/:id/complete - Complete booking (Stylist/Admin)
router.put(
  "/:id/complete",
  authenticateToken,
  checkPermission('bookings', 'update'),
  validateId,
  bookingController.completeBooking,
);

// PUT /bookings/:id/no-show - Mark as no-show (Stylist/Admin)
router.put(
  "/:id/no-show",
  authenticateToken,
  checkPermission('bookings', 'update'),
  validateId,
  validateBody(
    Joi.object({
      reason: Joi.string().max(200).optional().messages({
        "string.max": "Reason cannot exceed 200 characters",
      }),
    }),
  ),
  bookingController.markNoShow,
);

/**
 * Admin only routes
 */

// GET /bookings/stats - Get booking statistics (Admin)
router.get(
  "/stats",
  authenticateToken,
  checkPermission('reports', 'read'),
  bookingController.getBookingStats,
);

/**
 * Customer specific routes
 */

// GET /bookings/customer/:customerId/history - Get customer booking history
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
        .valid("pending", "confirmed", "in_progress", "completed", "cancelled", "no_show")
        .optional(),
    }),
  ),
  bookingController.getCustomerBookingHistory,
);

/**
 * Stylist specific routes
 */

// GET /bookings/stylist/:stylistId/schedule - Get stylist booking schedule
router.get(
  "/stylist/:stylistId/schedule",
  authenticateToken,
  checkResourceOwnership('stylist'),
  validateParams(
    Joi.object({
      stylistId: Joi.string().required(),
    }),
  ),
  validateQuery(
    Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
    }),
  ),
  bookingController.getStylistBookingSchedule,
);

export default router;
