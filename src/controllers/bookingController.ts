import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import bookingService from "../services/bookingService";
import { ApiResponseUtil } from "../utils/response";
import { asyncHandler } from "../middleware/errorHandler";
import { BookingStatus } from "../utils/types";

class BookingController {
  /**
   * Get all bookings with pagination and filters
   */
  getBookings = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        customerId,
        stylistId,
        serviceId,
        status,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // For customers, only show their own bookings
      let finalCustomerId = customerId as string;
      if (req.user?.role === "customer") {
        finalCustomerId = req.user.userId;
      }

      // For stylists, only show bookings assigned to them
      let finalStylistId = stylistId as string;
      if (req.user?.role === "stylist") {
        // Note: In real implementation, you'd get stylist ID from user ID
        finalStylistId = stylistId as string;
      }

      const result = await bookingService.getBookings({
        page: Number(page),
        limit: Number(limit),
        customerId: finalCustomerId,
        stylistId: finalStylistId,
        serviceId: serviceId as string,
        status: status as BookingStatus,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return ApiResponseUtil.paginated(
        res,
        result.bookings,
        result.total,
        Number(page),
        Number(limit),
        "Bookings retrieved successfully",
      );
    },
  );

  /**
   * Get booking by ID
   */
  getBookingById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      const booking = await bookingService.getBookingById(id);

      if (!booking) {
        return ApiResponseUtil.notFound(res, "Booking not found");
      }

      // Check access permissions
      if (
        req.user?.role === "customer" &&
        booking.customerId !== req.user.userId
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only view your own bookings",
        );
      }

      if (
        req.user?.role === "stylist" &&
        booking.stylistId !== req.user.userId // Note: This needs proper implementation
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only view bookings assigned to you",
        );
      }

      return ApiResponseUtil.success(
        res,
        "Booking retrieved successfully",
        booking,
      );
    },
  );

  /**
   * Create new booking
   */
  createBooking = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { stylistId, serviceId, appointmentDate, appointmentTime, notes } =
        req.body;

      // Customer ID comes from authenticated user
      const customerId = req.user!.userId;

      const bookingData = {
        customerId,
        stylistId,
        serviceId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        notes,
      };

      const booking = await bookingService.createBooking(bookingData);

      return ApiResponseUtil.created(
        res,
        booking,
        "Booking created successfully",
      );
    },
  );

  /**
   * Update booking
   */
  updateBooking = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { appointmentDate, appointmentTime, notes } = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      // Check if booking exists and user has permission
      const existingBooking = await bookingService.getBookingById(id);

      if (!existingBooking) {
        return ApiResponseUtil.notFound(res, "Booking not found");
      }

      // Only customer who made the booking can update it (before confirmation)
      if (
        req.user?.role === "customer" &&
        existingBooking.customerId !== req.user.userId
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only update your own bookings",
        );
      }

      const updateData: any = {
        performedBy: req.user!.userId,
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

      const booking = await bookingService.updateBooking(id, updateData);

      return ApiResponseUtil.updated(
        res,
        booking,
        "Booking updated successfully",
      );
    },
  );

  /**
   * Cancel booking
   */
  cancelBooking = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      if (!reason) {
        return ApiResponseUtil.badRequest(
          res,
          "Cancellation reason is required",
        );
      }

      // Check if booking exists and user has permission
      const existingBooking = await bookingService.getBookingById(id);

      if (!existingBooking) {
        return ApiResponseUtil.notFound(res, "Booking not found");
      }

      // Customer can cancel their own bookings, admin/stylist can cancel any
      if (
        req.user?.role === "customer" &&
        existingBooking.customerId !== req.user.userId
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only cancel your own bookings",
        );
      }

      const booking = await bookingService.cancelBooking(
        id,
        reason,
        req.user!.userId,
      );

      return ApiResponseUtil.success(
        res,
        "Booking cancelled successfully",
        booking,
      );
    },
  );

  /**
   * Confirm booking (Stylist/Admin only)
   */
  confirmBooking = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      const booking = await bookingService.updateBookingStatus(
        id,
        "confirmed" as BookingStatus,
        req.user!.userId,
      );

      return ApiResponseUtil.success(
        res,
        "Booking confirmed successfully",
        booking,
      );
    },
  );

  /**
   * Start booking (change to in_progress) (Stylist only)
   */
  startBooking = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      const booking = await bookingService.updateBookingStatus(
        id,
        "in_progress" as BookingStatus,
        req.user!.userId,
      );

      return ApiResponseUtil.success(
        res,
        "Booking started successfully",
        booking,
      );
    },
  );

  /**
   * Complete booking (Stylist/Admin only)
   */
  completeBooking = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      const booking = await bookingService.updateBookingStatus(
        id,
        "completed" as BookingStatus,
        req.user!.userId,
      );

      return ApiResponseUtil.success(
        res,
        "Booking completed successfully",
        booking,
      );
    },
  );

  /**
   * Mark booking as no-show (Stylist/Admin only)
   */
  markNoShow = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      const booking = await bookingService.updateBookingStatus(
        id,
        "no_show" as BookingStatus,
        req.user!.userId,
        reason || "Customer did not show up",
      );

      return ApiResponseUtil.success(res, "Booking marked as no-show", booking);
    },
  );

  /**
   * Get available time slots for a stylist and date
   */
  getAvailableTimeSlots = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { stylistId, date, serviceId } = req.query;

      if (!stylistId || !date || !serviceId) {
        return ApiResponseUtil.badRequest(
          res,
          "Stylist ID, date, and service ID are required",
        );
      }

      // Get service duration
      const service = await db
        .select()
        .from(services)
        .where(eq(services.id, serviceId as string))
        .limit(1);

      if (service.length === 0) {
        return ApiResponseUtil.notFound(res, "Service not found");
      }

      const timeSlots = await bookingService.getAvailableTimeSlots(
        stylistId as string,
        new Date(date as string),
        service[0]?.duration || 60,
      );

      return ApiResponseUtil.success(
        res,
        "Available time slots retrieved successfully",
        timeSlots,
      );
    },
  );

  /**
   * Get booking statistics (Admin/Stylist only)
   */
  getBookingStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const stats = await bookingService.getBookingStats();

      return ApiResponseUtil.success(
        res,
        "Booking statistics retrieved successfully",
        stats,
      );
    },
  );

  /**
   * Get customer's booking history
   */
  getCustomerBookingHistory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { customerId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      if (!customerId) {
        return ApiResponseUtil.badRequest(res, "Customer ID is required");
      }

      // Customers can only view their own history
      if (req.user?.role === "customer" && customerId !== req.user.userId) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only view your own booking history",
        );
      }

      const result = await bookingService.getBookings({
        page: Number(page),
        limit: Number(limit),
        customerId,
        status: status as BookingStatus,
        sortBy: "appointmentDate",
        sortOrder: "desc",
      });

      return ApiResponseUtil.paginated(
        res,
        result.bookings,
        result.total,
        Number(page),
        Number(limit),
        "Customer booking history retrieved successfully",
      );
    },
  );

  /**
   * Get stylist's booking schedule
   */
  getStylistBookingSchedule = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { stylistId } = req.params;
      const { startDate, endDate } = req.query;

      if (!stylistId) {
        return ApiResponseUtil.badRequest(res, "Stylist ID is required");
      }

      // Stylists can only view their own schedule
      if (
        req.user?.role === "stylist" &&
        stylistId !== req.user.userId // Note: This needs proper stylist-user mapping
      ) {
        return ApiResponseUtil.forbidden(
          res,
          "You can only view your own schedule",
        );
      }

      const result = await bookingService.getBookings({
        page: 1,
        limit: 1000, // Get all bookings for the period
        stylistId,
        startDate: startDate ? new Date(startDate as string) : new Date(),
        endDate: endDate ? new Date(endDate as string) : undefined,
        sortBy: "appointmentDate",
        sortOrder: "asc",
      });

      // Group bookings by date
      const schedule: Record<string, any[]> = {};
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

      return ApiResponseUtil.success(
        res,
        "Stylist booking schedule retrieved successfully",
        {
          stylistId,
          schedule,
          totalBookings: result.total,
        },
      );
    },
  );

  /**
   * Reschedule booking
   */
  rescheduleBooking = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { appointmentDate, appointmentTime, reason } = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Booking ID is required");
      }

      if (!appointmentDate || !appointmentTime) {
        return ApiResponseUtil.badRequest(
          res,
          "New appointment date and time are required",
        );
      }

      const booking = await bookingService.updateBooking(id, {
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        notes: reason ? `Rescheduled: ${reason}` : undefined,
        performedBy: req.user!.userId,
      });

      return ApiResponseUtil.success(
        res,
        "Booking rescheduled successfully",
        booking,
      );
    },
  );
}

export default new BookingController();

// Import services for availability check
import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { services } from "../models/service";
