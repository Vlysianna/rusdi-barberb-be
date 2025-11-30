import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import stylistService from "../services/stylistService";
import { ApiResponseUtil } from "../utils/response";
import { asyncHandler } from "../middleware/errorHandler";

class StylistController {
  /**
   * Get all stylists with pagination and filters
   */
  getAllStylists = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        search,
        isAvailable,
        specialties,
      } = req.query;

      const result = await stylistService.getAllStylists({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        isAvailable:
          isAvailable === "true"
            ? true
            : isAvailable === "false"
              ? false
              : undefined,
        specialties: Array.isArray(specialties)
          ? (specialties as string[])
          : specialties
            ? [specialties as string]
            : undefined,
      });

      return ApiResponseUtil.paginated(
        res,
        result.stylists,
        result.total,
        Number(page),
        Number(limit),
        "Stylists retrieved successfully",
      );
    },
  );

  /**
   * Get stylist by ID
   */
  getStylistById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const stylist = await stylistService.getStylistById(id);

      return ApiResponseUtil.success(
        res,
        "Stylist retrieved successfully",
        stylist,
      );
    },
  );

  /**
   * Create new stylist (Admin/Manager only)
   */
  createStylist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const stylistData = req.body;

      const stylist = await stylistService.createStylist(stylistData);

      return ApiResponseUtil.created(
        res,
        stylist,
        "Stylist created successfully",
      );
    },
  );

  /**
   * Update stylist
   */
  updateStylist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user can update this stylist
      // Admin/Manager can update any stylist
      // Stylist can only update their own profile
      if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        // Check if the stylist belongs to the authenticated user
        const stylist = await stylistService.getStylistById(id);
        if (stylist.userId !== req.user?.userId) {
          return ApiResponseUtil.forbidden(
            res,
            "You can only update your own profile",
          );
        }
      }

      const updatedStylist = await stylistService.updateStylist(id, updateData);

      return ApiResponseUtil.success(
        res,
        "Stylist updated successfully",
        updatedStylist,
      );
    },
  );

  /**
   * Delete stylist (Admin only)
   */
  deleteStylist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      await stylistService.deleteStylist(id);

      return ApiResponseUtil.success(res, "Stylist deleted successfully", null);
    },
  );

  /**
   * Get available stylists for specific date/time
   */
  getAvailableStylists = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { date, time } = req.query;

      const stylists = await stylistService.getAvailableStylists(
        date as string,
        time as string,
      );

      return ApiResponseUtil.success(
        res,
        "Available stylists retrieved successfully",
        stylists,
      );
    },
  );

  /**
   * Update stylist availability
   */
  updateAvailability = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { isAvailable } = req.body;

      const updatedStylist = await stylistService.updateAvailability(
        id,
        isAvailable,
      );

      return ApiResponseUtil.success(
        res,
        "Stylist availability updated successfully",
        updatedStylist,
      );
    },
  );

  /**
   * Update stylist schedule
   */
  updateSchedule = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { schedule } = req.body;

      const updatedStylist = await stylistService.updateSchedule(id, schedule);

      return ApiResponseUtil.success(
        res,
        "Stylist schedule updated successfully",
        updatedStylist,
      );
    },
  );

  /**
   * Get stylist bookings
   */
  getStylistBookings = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;

      // Check if user can access this stylist's bookings
      if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        const stylist = await stylistService.getStylistById(id);
        if (stylist.userId !== req.user?.userId) {
          return ApiResponseUtil.forbidden(
            res,
            "You can only access your own bookings",
          );
        }
      }

      const result = await stylistService.getStylistBookings(id, {
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });

      return ApiResponseUtil.paginated(
        res,
        result.bookings,
        result.total,
        Number(page),
        Number(limit),
        "Stylist bookings retrieved successfully",
      );
    },
  );

  /**
   * Get stylist performance metrics (Admin/Manager only)
   */
  getStylistPerformance = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { dateFrom, dateTo } = req.query;

      const performance = await stylistService.getStylistPerformance(
        id,
        dateFrom as string,
        dateTo as string,
      );

      return ApiResponseUtil.success(
        res,
        "Stylist performance retrieved successfully",
        performance,
      );
    },
  );

  /**
   * Get stylist earnings
   */
  getStylistEarnings = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { dateFrom, dateTo } = req.query;

      // Check if user can access this stylist's earnings
      if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        const stylist = await stylistService.getStylistById(id);
        if (stylist.userId !== req.user?.userId) {
          return ApiResponseUtil.forbidden(
            res,
            "You can only access your own earnings",
          );
        }
      }

      const earnings = await stylistService.getStylistEarnings(
        id,
        dateFrom as string,
        dateTo as string,
      );

      return ApiResponseUtil.success(
        res,
        "Stylist earnings retrieved successfully",
        earnings,
      );
    },
  );

  /**
   * Get stylist reviews
   */
  getStylistReviews = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await stylistService.getStylistReviews(
        id,
        Number(page),
        Number(limit),
      );

      return ApiResponseUtil.paginated(
        res,
        result.reviews,
        result.total,
        Number(page),
        Number(limit),
        "Stylist reviews retrieved successfully",
      );
    },
  );

  /**
   * Get stylist specialties
   */
  getStylistSpecialties = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const specialties = await stylistService.getStylistSpecialties();

      return ApiResponseUtil.success(
        res,
        "Stylist specialties retrieved successfully",
        specialties,
      );
    },
  );

  /**
   * Assign service to stylist (Admin/Manager only)
   */
  assignServiceToStylist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { serviceId } = req.body;

      await stylistService.assignServiceToStylist(id, serviceId);

      return ApiResponseUtil.success(
        res,
        "Service assigned to stylist successfully",
        null,
      );
    },
  );

  /**
   * Remove service from stylist (Admin/Manager only)
   */
  removeServiceFromStylist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id, serviceId } = req.params;

      await stylistService.removeServiceFromStylist(id, serviceId);

      return ApiResponseUtil.success(
        res,
        "Service removed from stylist successfully",
        null,
      );
    },
  );

  /**
   * Get stylist schedules
   */
  getStylistSchedules = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const schedules = await stylistService.getStylistSchedules(id);

      return ApiResponseUtil.success(
        res,
        "Stylist schedules retrieved successfully",
        schedules,
      );
    },
  );

  /**
   * Add stylist schedule
   */
  addStylistSchedule = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const scheduleData = req.body;

      const schedule = await stylistService.addStylistSchedule(id, scheduleData);

      return ApiResponseUtil.created(
        res,
        schedule,
        "Stylist schedule added successfully",
      );
    },
  );

  /**
   * Update stylist schedule entry
   */
  updateStylistScheduleEntry = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id, scheduleId } = req.params;
      const scheduleData = req.body;

      const schedule = await stylistService.updateStylistScheduleEntry(
        id,
        scheduleId,
        scheduleData,
      );

      return ApiResponseUtil.success(
        res,
        "Stylist schedule updated successfully",
        schedule,
      );
    },
  );

  /**
   * Delete stylist schedule entry
   */
  deleteStylistScheduleEntry = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id, scheduleId } = req.params;

      await stylistService.deleteStylistScheduleEntry(id, scheduleId);

      return ApiResponseUtil.success(
        res,
        "Stylist schedule deleted successfully",
        null,
      );
    },
  );
}

export const stylistController = new StylistController();
export default stylistController;
