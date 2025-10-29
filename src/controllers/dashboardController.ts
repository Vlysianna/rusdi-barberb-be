import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiResponseUtil } from "../utils/response";
import userService from "../services/userService";
import bookingService from "../services/bookingService";
import paymentService from "../services/paymentService";

class DashboardController {
  /**
   * Get dashboard statistics (Admin only)
   */
  getDashboardStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { dateFrom, dateTo } = req.query;

      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (dateFrom) {
        startDate = new Date(dateFrom as string);
      }

      if (dateTo) {
        endDate = new Date(dateTo as string);
      }

      // Get all statistics in parallel
      const [userStats, bookingStats, paymentStats] = await Promise.all([
        userService.getUserStats(),
        bookingService.getBookingStats(),
        paymentService.getPaymentStats(startDate, endDate),
      ]);

      const dashboardStats = {
        overview: {
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          totalBookings: bookingStats.totalBookings,
          todayBookings: bookingStats.todayBookings,
          thisWeekBookings: bookingStats.thisWeekBookings,
          thisMonthBookings: bookingStats.thisMonthBookings,
          averageBookingValue: bookingStats.averageBookingValue,
        },
        users: {
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          usersByRole: userStats.usersByRole,
          newUsersThisMonth: userStats.newUsersThisMonth,
          newUsersToday: userStats.newUsersToday,
          verifiedUsers: userStats.verifiedUsers,
        },
        bookings: {
          totalBookings: bookingStats.totalBookings,
          pendingBookings: bookingStats.pendingBookings,
          confirmedBookings: bookingStats.confirmedBookings,
          completedBookings: bookingStats.completedBookings,
          cancelledBookings: bookingStats.cancelledBookings,
          todayBookings: bookingStats.todayBookings,
          thisWeekBookings: bookingStats.thisWeekBookings,
          thisMonthBookings: bookingStats.thisMonthBookings,
          popularServices: bookingStats.popularServices,
        },
        payments: {
          statusBreakdown: paymentStats.statusBreakdown,
          methodBreakdown: paymentStats.methodBreakdown,
        },
        dateRange: {
          from: dateFrom ? new Date(dateFrom as string).toISOString() : null,
          to: dateTo ? new Date(dateTo as string).toISOString() : null,
        },
      };

      return ApiResponseUtil.success(
        res,
        "Dashboard statistics retrieved successfully",
        dashboardStats,
      );
    },
  );

  /**
   * Get revenue statistics (Admin only)
   */
  getRevenueStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { period = "month" } = req.query;

      // This is a placeholder - you'll need to implement revenue calculation
      // based on completed bookings and payments
      const revenueStats = {
        totalRevenue: 0,
        thisMonthRevenue: 0,
        lastMonthRevenue: 0,
        revenueGrowth: 0,
        revenueByService: [],
        revenueByPeriod: [],
      };

      return ApiResponseUtil.success(
        res,
        "Revenue statistics retrieved successfully",
        revenueStats,
      );
    },
  );

  /**
   * Get booking trends (Admin only)
   */
  getBookingTrends = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { period = "week", limit = "10" } = req.query;

      // This is a placeholder - you can implement more detailed trend analysis
      const trendStats = {
        period: period as string,
        trends: [],
        peakHours: [],
        popularServices: [],
      };

      return ApiResponseUtil.success(
        res,
        "Booking trends retrieved successfully",
        trendStats,
      );
    },
  );
}

export const dashboardController = new DashboardController();
