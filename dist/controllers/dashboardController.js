"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const response_1 = require("../utils/response");
const database_1 = require("../config/database");
const booking_1 = require("../models/booking");
const payment_1 = require("../models/payment");
const user_1 = require("../models/user");
const stylist_1 = require("../models/stylist");
const service_1 = require("../models/service");
const review_1 = require("../models/review");
const drizzle_orm_1 = require("drizzle-orm");
class DashboardController {
    constructor() {
        this.getDashboardStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            const { dateFrom, dateTo } = req.query;
            let startDate;
            let endDate;
            if (dateFrom && dateTo) {
                startDate = new Date(dateFrom);
                endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
            }
            else {
                const now = new Date();
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            }
            const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const prevStartDate = new Date(startDate);
            prevStartDate.setDate(startDate.getDate() - periodDays);
            const prevEndDate = new Date(startDate);
            prevEndDate.setDate(startDate.getDate() - 1);
            prevEndDate.setHours(23, 59, 59, 999);
            const [currentRevenue] = await database_1.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${payment_1.payments.amount} AS DECIMAL(10,2))), 0)`,
            })
                .from(payment_1.payments)
                .innerJoin(booking_1.bookings, (0, drizzle_orm_1.eq)(payment_1.payments.bookingId, booking_1.bookings.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payment_1.payments.status, "paid"), (0, drizzle_orm_1.eq)(booking_1.bookings.status, "completed"), (0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, startDate), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, endDate)));
            const [previousRevenue] = await database_1.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${payment_1.payments.amount} AS DECIMAL(10,2))), 0)`,
            })
                .from(payment_1.payments)
                .innerJoin(booking_1.bookings, (0, drizzle_orm_1.eq)(payment_1.payments.bookingId, booking_1.bookings.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payment_1.payments.status, "paid"), (0, drizzle_orm_1.eq)(booking_1.bookings.status, "completed"), (0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, prevStartDate), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, prevEndDate)));
            const totalRevenue = Number(currentRevenue.total) || 0;
            const prevTotalRevenue = Number(previousRevenue.total) || 0;
            const revenueGrowth = prevTotalRevenue > 0
                ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
                : 0;
            const [currentBookingsCount] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(booking_1.bookings.createdAt, startDate), (0, drizzle_orm_1.lte)(booking_1.bookings.createdAt, endDate)));
            const [previousBookingsCount] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(booking_1.bookings.createdAt, prevStartDate), (0, drizzle_orm_1.lte)(booking_1.bookings.createdAt, prevEndDate)));
            const totalBookings = Number(currentBookingsCount.count) || 0;
            const prevTotalBookings = Number(previousBookingsCount.count) || 0;
            const bookingsGrowth = prevTotalBookings > 0
                ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100
                : 0;
            const [currentCustomersCount] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_1.users.role, "customer"), (0, drizzle_orm_1.gte)(user_1.users.createdAt, startDate), (0, drizzle_orm_1.lte)(user_1.users.createdAt, endDate)));
            const [previousCustomersCount] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_1.users.role, "customer"), (0, drizzle_orm_1.gte)(user_1.users.createdAt, prevStartDate), (0, drizzle_orm_1.lte)(user_1.users.createdAt, prevEndDate)));
            const [allCustomersCount] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.role, "customer"));
            const totalCustomers = Number(allCustomersCount.count) || 0;
            const newCustomers = Number(currentCustomersCount.count) || 0;
            const prevNewCustomers = Number(previousCustomersCount.count) || 0;
            const customersGrowth = prevNewCustomers > 0
                ? ((newCustomers - prevNewCustomers) / prevNewCustomers) * 100
                : 0;
            const [currentRating] = await database_1.db
                .select({
                avg: (0, drizzle_orm_1.sql) `COALESCE(AVG(${review_1.reviews.rating}), 0)`,
            })
                .from(review_1.reviews)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(review_1.reviews.createdAt, startDate), (0, drizzle_orm_1.lte)(review_1.reviews.createdAt, endDate)));
            const [previousRating] = await database_1.db
                .select({
                avg: (0, drizzle_orm_1.sql) `COALESCE(AVG(${review_1.reviews.rating}), 0)`,
            })
                .from(review_1.reviews)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(review_1.reviews.createdAt, prevStartDate), (0, drizzle_orm_1.lte)(review_1.reviews.createdAt, prevEndDate)));
            const averageRating = Number(currentRating.avg) || 0;
            const prevAverageRating = Number(previousRating.avg) || 0;
            const ratingChange = averageRating - prevAverageRating;
            const revenueByDay = await database_1.db
                .select({
                date: (0, drizzle_orm_1.sql) `DATE(COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate}))`,
                amount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${payment_1.payments.amount} AS DECIMAL(10,2))), 0)`,
            })
                .from(payment_1.payments)
                .innerJoin(booking_1.bookings, (0, drizzle_orm_1.eq)(payment_1.payments.bookingId, booking_1.bookings.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payment_1.payments.status, "paid"), (0, drizzle_orm_1.eq)(booking_1.bookings.status, "completed"), (0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, startDate), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, endDate)))
                .groupBy((0, drizzle_orm_1.sql) `DATE(COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate}))`)
                .orderBy((0, drizzle_orm_1.sql) `DATE(COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate}))`);
            const bookingsByStatus = await database_1.db
                .select({
                status: booking_1.bookings.status,
                count: (0, drizzle_orm_1.count)(),
            })
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(booking_1.bookings.createdAt, startDate), (0, drizzle_orm_1.lte)(booking_1.bookings.createdAt, endDate)))
                .groupBy(booking_1.bookings.status);
            const topServices = await database_1.db
                .select({
                id: service_1.services.id,
                name: service_1.services.name,
                bookings: (0, drizzle_orm_1.count)(),
                revenue: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${payment_1.payments.amount} AS DECIMAL(10,2))), 0)`,
            })
                .from(service_1.services)
                .innerJoin(booking_1.bookings, (0, drizzle_orm_1.eq)(service_1.services.id, booking_1.bookings.serviceId))
                .innerJoin(payment_1.payments, (0, drizzle_orm_1.eq)(booking_1.bookings.id, payment_1.payments.bookingId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payment_1.payments.status, "paid"), (0, drizzle_orm_1.eq)(booking_1.bookings.status, "completed"), (0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, startDate), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, endDate)))
                .groupBy(service_1.services.id, service_1.services.name)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${payment_1.payments.amount} AS DECIMAL(10,2))), 0)`))
                .limit(5);
            const topStylistsData = await database_1.db
                .select({
                id: stylist_1.stylists.id,
                userId: stylist_1.stylists.userId,
                bookings: (0, drizzle_orm_1.count)(),
                revenue: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${payment_1.payments.amount} AS DECIMAL(10,2))), 0)`,
                rating: stylist_1.stylists.rating,
            })
                .from(stylist_1.stylists)
                .innerJoin(booking_1.bookings, (0, drizzle_orm_1.eq)(stylist_1.stylists.id, booking_1.bookings.stylistId))
                .innerJoin(payment_1.payments, (0, drizzle_orm_1.eq)(booking_1.bookings.id, payment_1.payments.bookingId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(payment_1.payments.status, "paid"), (0, drizzle_orm_1.eq)(booking_1.bookings.status, "completed"), (0, drizzle_orm_1.gte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, startDate), (0, drizzle_orm_1.lte)((0, drizzle_orm_1.sql) `COALESCE(${booking_1.bookings.completedAt}, ${booking_1.bookings.appointmentDate})`, endDate)))
                .groupBy(stylist_1.stylists.id, stylist_1.stylists.userId, stylist_1.stylists.rating)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${payment_1.payments.amount} AS DECIMAL(10,2))), 0)`))
                .limit(5);
            const topStylists = await Promise.all(topStylistsData.map(async (stylist) => {
                const [user] = await database_1.db
                    .select({ fullName: user_1.users.fullName })
                    .from(user_1.users)
                    .where((0, drizzle_orm_1.eq)(user_1.users.id, stylist.userId))
                    .limit(1);
                return {
                    id: stylist.id,
                    name: user?.fullName || "Unknown",
                    bookings: Number(stylist.bookings),
                    revenue: Number(stylist.revenue),
                    rating: Number(stylist.rating) || 0,
                };
            }));
            const recentBookingsData = await database_1.db
                .select({
                id: booking_1.bookings.id,
                customerId: booking_1.bookings.customerId,
                stylistId: booking_1.bookings.stylistId,
                serviceId: booking_1.bookings.serviceId,
                appointmentDate: booking_1.bookings.appointmentDate,
                appointmentTime: booking_1.bookings.appointmentTime,
                status: booking_1.bookings.status,
                totalAmount: booking_1.bookings.totalAmount,
            })
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(booking_1.bookings.createdAt, startDate), (0, drizzle_orm_1.lte)(booking_1.bookings.createdAt, endDate)))
                .orderBy((0, drizzle_orm_1.desc)(booking_1.bookings.createdAt))
                .limit(10);
            const recentBookings = await Promise.all(recentBookingsData.map(async (booking) => {
                const [customer] = await database_1.db
                    .select({ fullName: user_1.users.fullName })
                    .from(user_1.users)
                    .where((0, drizzle_orm_1.eq)(user_1.users.id, booking.customerId))
                    .limit(1);
                const [stylist] = await database_1.db
                    .select({ userId: stylist_1.stylists.userId })
                    .from(stylist_1.stylists)
                    .where((0, drizzle_orm_1.eq)(stylist_1.stylists.id, booking.stylistId))
                    .limit(1);
                const [stylistUser] = stylist
                    ? await database_1.db
                        .select({ fullName: user_1.users.fullName })
                        .from(user_1.users)
                        .where((0, drizzle_orm_1.eq)(user_1.users.id, stylist.userId))
                        .limit(1)
                    : [null];
                const [service] = await database_1.db
                    .select({ name: service_1.services.name })
                    .from(service_1.services)
                    .where((0, drizzle_orm_1.eq)(service_1.services.id, booking.serviceId))
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
            }));
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
            return response_1.ApiResponseUtil.success(res, "Dashboard statistics retrieved successfully", dashboardStats);
        });
        this.getRevenueStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { period = "month" } = req.query;
            const revenueStats = {
                totalRevenue: 0,
                thisMonthRevenue: 0,
                lastMonthRevenue: 0,
                revenueGrowth: 0,
                revenueByService: [],
                revenueByPeriod: [],
            };
            return response_1.ApiResponseUtil.success(res, "Revenue statistics retrieved successfully", revenueStats);
        });
        this.getBookingTrends = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { period = "week", limit = "10" } = req.query;
            const trendStats = {
                period: period,
                trends: [],
                peakHours: [],
                popularServices: [],
            };
            return response_1.ApiResponseUtil.success(res, "Booking trends retrieved successfully", trendStats);
        });
    }
}
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboardController.js.map