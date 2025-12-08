import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiResponseUtil } from "../utils/response";
import { db } from "../config/database";
import { bookings } from "../models/booking";
import { payments } from "../models/payment";
import { users } from "../models/user";
import { stylists } from "../models/stylist";
import { services } from "../models/service";
import { reviews } from "../models/review";
import { eq, and, gte, lte, sql, count, sum, desc } from "drizzle-orm";

class DashboardController {
  /**
   * Get dashboard statistics (Admin only)
   */
  getDashboardStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { dateFrom, dateTo } = req.query;

      let startDate: Date;
      let endDate: Date;

      if (dateFrom && dateTo) {
        startDate = new Date(dateFrom as string);
        endDate = new Date(dateTo as string);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Default to current month
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // Calculate previous period for growth comparison
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(startDate.getDate() - periodDays);
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(startDate.getDate() - 1);
      prevEndDate.setHours(23, 59, 59, 999);

      // 1. Get total revenue from COMPLETED bookings with PAID payments
      const [currentRevenue] = await db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(10,2))), 0)`,
        })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.id))
        .where(
          and(
            eq(payments.status, "paid"),
            eq(bookings.status, "completed"),
            gte(bookings.completedAt, startDate),
            lte(bookings.completedAt, endDate)
          )
        );

      const [previousRevenue] = await db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(10,2))), 0)`,
        })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.id))
        .where(
          and(
            eq(payments.status, "paid"),
            eq(bookings.status, "completed"),
            gte(bookings.completedAt, prevStartDate),
            lte(bookings.completedAt, prevEndDate)
          )
        );

      const totalRevenue = Number(currentRevenue.total) || 0;
      const prevTotalRevenue = Number(previousRevenue.total) || 0;
      const revenueGrowth = prevTotalRevenue > 0 
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
        : 0;

      // 2. Get bookings count
      const [currentBookingsCount] = await db
        .select({ count: count() })
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        );

      const [previousBookingsCount] = await db
        .select({ count: count() })
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, prevStartDate),
            lte(bookings.createdAt, prevEndDate)
          )
        );

      const totalBookings = Number(currentBookingsCount.count) || 0;
      const prevTotalBookings = Number(previousBookingsCount.count) || 0;
      const bookingsGrowth = prevTotalBookings > 0
        ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100
        : 0;

      // 3. Get total customers
      const [currentCustomersCount] = await db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.role, "customer"),
            gte(users.createdAt, startDate),
            lte(users.createdAt, endDate)
          )
        );

      const [previousCustomersCount] = await db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.role, "customer"),
            gte(users.createdAt, prevStartDate),
            lte(users.createdAt, prevEndDate)
          )
        );

      const [allCustomersCount] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "customer"));

      const totalCustomers = Number(allCustomersCount.count) || 0;
      const newCustomers = Number(currentCustomersCount.count) || 0;
      const prevNewCustomers = Number(previousCustomersCount.count) || 0;
      const customersGrowth = prevNewCustomers > 0
        ? ((newCustomers - prevNewCustomers) / prevNewCustomers) * 100
        : 0;

      // 4. Get average rating
      const [currentRating] = await db
        .select({
          avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        })
        .from(reviews)
        .where(
          and(
            gte(reviews.createdAt, startDate),
            lte(reviews.createdAt, endDate)
          )
        );

      const [previousRating] = await db
        .select({
          avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        })
        .from(reviews)
        .where(
          and(
            gte(reviews.createdAt, prevStartDate),
            lte(reviews.createdAt, prevEndDate)
          )
        );

      const averageRating = Number(currentRating.avg) || 0;
      const prevAverageRating = Number(previousRating.avg) || 0;
      const ratingChange = averageRating - prevAverageRating;

      // 5. Get revenue by day
      const revenueByDay = await db
        .select({
          date: sql<string>`DATE(${bookings.completedAt})`,
          amount: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(10,2))), 0)`,
        })
        .from(payments)
        .innerJoin(bookings, eq(payments.bookingId, bookings.id))
        .where(
          and(
            eq(payments.status, "paid"),
            eq(bookings.status, "completed"),
            gte(bookings.completedAt, startDate),
            lte(bookings.completedAt, endDate)
          )
        )
        .groupBy(sql`DATE(${bookings.completedAt})`)
        .orderBy(sql`DATE(${bookings.completedAt})`);

      // 6. Get bookings by status
      const bookingsByStatus = await db
        .select({
          status: bookings.status,
          count: count(),
        })
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        )
        .groupBy(bookings.status);

      // 7. Get top services with revenue
      const topServices = await db
        .select({
          id: services.id,
          name: services.name,
          bookings: count(),
          revenue: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(10,2))), 0)`,
        })
        .from(services)
        .innerJoin(bookings, eq(services.id, bookings.serviceId))
        .innerJoin(payments, eq(bookings.id, payments.bookingId))
        .where(
          and(
            eq(payments.status, "paid"),
            eq(bookings.status, "completed"),
            gte(bookings.completedAt, startDate),
            lte(bookings.completedAt, endDate)
          )
        )
        .groupBy(services.id, services.name)
        .orderBy(desc(sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(10,2))), 0)`))
        .limit(5);

      // 8. Get top stylists
      const topStylistsData = await db
        .select({
          id: stylists.id,
          userId: stylists.userId,
          bookings: count(),
          revenue: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(10,2))), 0)`,
          rating: stylists.rating,
        })
        .from(stylists)
        .innerJoin(bookings, eq(stylists.id, bookings.stylistId))
        .innerJoin(payments, eq(bookings.id, payments.bookingId))
        .where(
          and(
            eq(payments.status, "paid"),
            eq(bookings.status, "completed"),
            gte(bookings.completedAt, startDate),
            lte(bookings.completedAt, endDate)
          )
        )
        .groupBy(stylists.id, stylists.userId, stylists.rating)
        .orderBy(desc(sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL(10,2))), 0)`))
        .limit(5);

      // Get user names for top stylists
      const topStylists = await Promise.all(
        topStylistsData.map(async (stylist) => {
          const [user] = await db
            .select({ fullName: users.fullName })
            .from(users)
            .where(eq(users.id, stylist.userId))
            .limit(1);
          
          return {
            id: stylist.id,
            name: user?.fullName || "Unknown",
            bookings: Number(stylist.bookings),
            revenue: Number(stylist.revenue),
            rating: Number(stylist.rating) || 0,
          };
        })
      );

      // 9. Get recent bookings
      const recentBookingsData = await db
        .select({
          id: bookings.id,
          customerId: bookings.customerId,
          stylistId: bookings.stylistId,
          serviceId: bookings.serviceId,
          appointmentDate: bookings.appointmentDate,
          appointmentTime: bookings.appointmentTime,
          status: bookings.status,
          totalAmount: bookings.totalAmount,
        })
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        )
        .orderBy(desc(bookings.createdAt))
        .limit(10);

      // Get related data for recent bookings
      const recentBookings = await Promise.all(
        recentBookingsData.map(async (booking) => {
          const [customer] = await db
            .select({ fullName: users.fullName })
            .from(users)
            .where(eq(users.id, booking.customerId))
            .limit(1);

          const [stylist] = await db
            .select({ userId: stylists.userId })
            .from(stylists)
            .where(eq(stylists.id, booking.stylistId))
            .limit(1);

          const [stylistUser] = stylist
            ? await db
                .select({ fullName: users.fullName })
                .from(users)
                .where(eq(users.id, stylist.userId))
                .limit(1)
            : [null];

          const [service] = await db
            .select({ name: services.name })
            .from(services)
            .where(eq(services.id, booking.serviceId))
            .limit(1);

          return {
            id: booking.id,
            customerName: customer?.fullName || "Unknown",
            serviceName: service?.name || "Unknown",
            stylistName: stylistUser?.fullName || "Unknown",
            appointmentDate: booking.appointmentDate.toISOString().split("T")[0],
            appointmentTime: booking.appointmentTime,
            status: booking.status,
            totalAmount: Number(booking.totalAmount),
          };
        })
      );

      const dashboardStats = {
        totalRevenue,
        totalBookings,
        totalCustomers,
        averageRating,
        revenueGrowth,
        bookingsGrowth,
        customersGrowth,
        ratingChange,
        revenueByDay: revenueByDay.map((item) => ({
          date: item.date,
          amount: Number(item.amount),
        })),
        bookingsByStatus: bookingsByStatus.map((item) => ({
          status: item.status,
          count: Number(item.count),
        })),
        topServices: topServices.map((item) => ({
          id: item.id,
          name: item.name,
          bookings: Number(item.bookings),
          revenue: Number(item.revenue),
        })),
        topStylists,
        recentBookings,
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
