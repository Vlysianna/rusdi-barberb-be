"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bookingService_1 = __importDefault(require("../services/bookingService"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
class BookingController {
    constructor() {
        this.getBookings = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { page = 1, limit = 10, customerId, stylistId, serviceId, status, startDate, endDate, sortBy = "createdAt", sortOrder = "desc", } = req.query;
            let finalCustomerId = customerId;
            if (req.user?.role === "customer") {
                finalCustomerId = req.user.userId;
            }
            let finalStylistId = stylistId;
            if (req.user?.role === "stylist") {
                finalStylistId = stylistId;
            }
            const result = await bookingService_1.default.getBookings({
                page: Number(page),
                limit: Number(limit),
                customerId: finalCustomerId,
                stylistId: finalStylistId,
                serviceId: serviceId,
                status: status,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                sortBy: sortBy,
                sortOrder: sortOrder,
            });
            return response_1.ApiResponseUtil.paginated(res, result.bookings, result.total, Number(page), Number(limit), "Bookings retrieved successfully");
        });
        this.getBookingById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Booking ID is required");
            }
            const booking = await bookingService_1.default.getBookingById(id);
            if (!booking) {
                return response_1.ApiResponseUtil.notFound(res, "Booking not found");
            }
            if (req.user?.role === "customer" &&
                booking.customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only view your own bookings");
            }
            if (req.user?.role === "stylist" &&
                booking.stylistId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only view bookings assigned to you");
            }
            return response_1.ApiResponseUtil.success(res, "Booking retrieved successfully", booking);
        });
        this.createBooking = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { stylistId, serviceId, appointmentDate, appointmentTime, notes } = req.body;
            const customerId = req.user.userId;
            const bookingData = {
                customerId,
                stylistId,
                serviceId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                notes,
            };
            const booking = await bookingService_1.default.createBooking(bookingData);
            return response_1.ApiResponseUtil.created(res, booking, "Booking created successfully");
        });
        this.updateBooking = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { appointmentDate, appointmentTime, notes } = req.body;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Booking ID is required");
            }
            const existingBooking = await bookingService_1.default.getBookingById(id);
            if (!existingBooking) {
                return response_1.ApiResponseUtil.notFound(res, "Booking not found");
            }
            if (req.user?.role === "customer" &&
                existingBooking.customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only update your own bookings");
            }
            const updateData = {
                performedBy: req.user.userId,
            };
            if (appointmentDate) {
                updateData.appointmentDate = new Date(appointmentDate);
            }
            if (appointmentTime) {
                updateData.appointmentTime = appointmentTime;
            }
            if (notes !== undefined) {
                updateData.notes = notes;
            }
            const booking = await bookingService_1.default.updateBooking(id, updateData);
            return response_1.ApiResponseUtil.updated(res, booking, "Booking updated successfully");
        });
        this.cancelBooking = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { reason } = req.body;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Booking ID is required");
            }
            if (!reason) {
                return response_1.ApiResponseUtil.badRequest(res, "Cancellation reason is required");
            }
            const existingBooking = await bookingService_1.default.getBookingById(id);
            if (!existingBooking) {
                return response_1.ApiResponseUtil.notFound(res, "Booking not found");
            }
            if (req.user?.role === "customer" &&
                existingBooking.customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only cancel your own bookings");
            }
            const booking = await bookingService_1.default.cancelBooking(id, reason, req.user.userId);
            return response_1.ApiResponseUtil.success(res, "Booking cancelled successfully", booking);
        });
        this.confirmBooking = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Booking ID is required");
            }
            const booking = await bookingService_1.default.updateBookingStatus(id, "confirmed", req.user.userId);
            return response_1.ApiResponseUtil.success(res, "Booking confirmed successfully", booking);
        });
        this.startBooking = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Booking ID is required");
            }
            const booking = await bookingService_1.default.updateBookingStatus(id, "in_progress", req.user.userId);
            return response_1.ApiResponseUtil.success(res, "Booking started successfully", booking);
        });
        this.completeBooking = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Booking ID is required");
            }
            const booking = await bookingService_1.default.updateBookingStatus(id, "completed", req.user.userId);
            return response_1.ApiResponseUtil.success(res, "Booking completed successfully", booking);
        });
        this.markNoShow = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { reason } = req.body;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Booking ID is required");
            }
            const booking = await bookingService_1.default.updateBookingStatus(id, "no_show", req.user.userId, reason || "Customer did not show up");
            return response_1.ApiResponseUtil.success(res, "Booking marked as no-show", booking);
        });
        this.getAvailableTimeSlots = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { stylistId, date, serviceId } = req.query;
            if (!stylistId || !date || !serviceId) {
                return response_1.ApiResponseUtil.badRequest(res, "Stylist ID, date, and service ID are required");
            }
            const service = await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.id, serviceId))
                .limit(1);
            if (service.length === 0) {
                return response_1.ApiResponseUtil.notFound(res, "Service not found");
            }
            const timeSlots = await bookingService_1.default.getAvailableTimeSlots(stylistId, new Date(date), service[0]?.duration || 60);
            return response_1.ApiResponseUtil.success(res, "Available time slots retrieved successfully", timeSlots);
        });
        this.getBookingStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const stats = await bookingService_1.default.getBookingStats();
            return response_1.ApiResponseUtil.success(res, "Booking statistics retrieved successfully", stats);
        });
        this.getCustomerBookingHistory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { customerId } = req.params;
            const { page = 1, limit = 10, status } = req.query;
            if (!customerId) {
                return response_1.ApiResponseUtil.badRequest(res, "Customer ID is required");
            }
            if (req.user?.role === "customer" && customerId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only view your own booking history");
            }
            const result = await bookingService_1.default.getBookings({
                page: Number(page),
                limit: Number(limit),
                customerId,
                status: status,
                sortBy: "appointmentDate",
                sortOrder: "desc",
            });
            return response_1.ApiResponseUtil.paginated(res, result.bookings, result.total, Number(page), Number(limit), "Customer booking history retrieved successfully");
        });
        this.getStylistBookingSchedule = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { stylistId } = req.params;
            const { startDate, endDate } = req.query;
            if (!stylistId) {
                return response_1.ApiResponseUtil.badRequest(res, "Stylist ID is required");
            }
            if (req.user?.role === "stylist" &&
                stylistId !== req.user.userId) {
                return response_1.ApiResponseUtil.forbidden(res, "You can only view your own schedule");
            }
            const result = await bookingService_1.default.getBookings({
                page: 1,
                limit: 1000,
                stylistId,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : undefined,
                sortBy: "appointmentDate",
                sortOrder: "asc",
            });
            const schedule = {};
            result.bookings.forEach((booking) => {
                const dateKey = booking.appointmentDate.toISOString().split("T")[0];
                if (dateKey && !schedule[dateKey]) {
                    schedule[dateKey] = [];
                }
                if (dateKey) {
                    schedule[dateKey]?.push({
                        id: booking.id,
                        time: booking.appointmentTime,
                        endTime: booking.endTime,
                        service: booking.service.name,
                        customer: booking.customer.fullName,
                        status: booking.status,
                        notes: booking.notes,
                    });
                }
            });
            return response_1.ApiResponseUtil.success(res, "Stylist booking schedule retrieved successfully", {
                stylistId,
                schedule,
                totalBookings: result.total,
            });
        });
        this.rescheduleBooking = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { appointmentDate, appointmentTime, reason } = req.body;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Booking ID is required");
            }
            if (!appointmentDate || !appointmentTime) {
                return response_1.ApiResponseUtil.badRequest(res, "New appointment date and time are required");
            }
            const booking = await bookingService_1.default.updateBooking(id, {
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                notes: reason ? `Rescheduled: ${reason}` : undefined,
                performedBy: req.user.userId,
            });
            return response_1.ApiResponseUtil.success(res, "Booking rescheduled successfully", booking);
        });
    }
}
exports.default = new BookingController();
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const service_1 = require("../models/service");
//# sourceMappingURL=bookingController.js.map