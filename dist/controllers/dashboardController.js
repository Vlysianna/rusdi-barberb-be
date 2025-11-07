"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const response_1 = require("../utils/response");
const userService_1 = __importDefault(require("../services/userService"));
const bookingService_1 = __importDefault(require("../services/bookingService"));
const paymentService_1 = __importDefault(require("../services/paymentService"));
const reviewService_1 = __importDefault(require("../services/reviewService"));
class DashboardController {
    constructor() {
        this.getDashboardStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { dateFrom, dateTo } = req.query;
            let startDate;
            let endDate;
            if (dateFrom) {
                startDate = new Date(dateFrom);
            }
            if (dateTo) {
                endDate = new Date(dateTo);
            }
            const [userStats, bookingStats, paymentStats, reviewStats] = await Promise.all([
                userService_1.default.getUserStats(),
                bookingService_1.default.getBookingStats(),
                paymentService_1.default.getPaymentStats(startDate, endDate),
                reviewService_1.default.getReviewStats(),
            ]);
            const dashboardStats = {
                totalCustomers: userStats.totalUsers || 0,
                totalBookings: bookingStats.totalBookings || 0,
                totalRevenue: paymentStats.totalRevenue?.toString() || "0",
                averageRating: reviewStats.averageRating || 0,
                todayBookings: bookingStats.todayBookings || 0,
                monthlyBookings: bookingStats.thisMonthBookings || 0,
                pendingBookings: bookingStats.pendingBookings || 0,
                completedBookings: bookingStats.completedBookings || 0,
                cancelledBookings: bookingStats.cancelledBookings || 0,
                topStylists: [],
                recentBookings: [],
                monthlyRevenue: [],
                bookingsByStatus: [
                    {
                        status: "pending",
                        count: bookingStats.pendingBookings || 0,
                        percentage: bookingStats.totalBookings > 0
                            ? ((bookingStats.pendingBookings || 0) /
                                bookingStats.totalBookings) *
                                100
                            : 0,
                    },
                    {
                        status: "confirmed",
                        count: bookingStats.confirmedBookings || 0,
                        percentage: bookingStats.totalBookings > 0
                            ? ((bookingStats.confirmedBookings || 0) /
                                bookingStats.totalBookings) *
                                100
                            : 0,
                    },
                    {
                        status: "completed",
                        count: bookingStats.completedBookings || 0,
                        percentage: bookingStats.totalBookings > 0
                            ? ((bookingStats.completedBookings || 0) /
                                bookingStats.totalBookings) *
                                100
                            : 0,
                    },
                    {
                        status: "cancelled",
                        count: bookingStats.cancelledBookings || 0,
                        percentage: bookingStats.totalBookings > 0
                            ? ((bookingStats.cancelledBookings || 0) /
                                bookingStats.totalBookings) *
                                100
                            : 0,
                    },
                ],
                _detailed: {
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
                        averageBookingValue: bookingStats.averageBookingValue,
                    },
                    payments: {
                        statusBreakdown: paymentStats.statusBreakdown,
                        methodBreakdown: paymentStats.methodBreakdown,
                        totalRevenue: paymentStats.totalRevenue,
                    },
                    reviews: reviewStats,
                    dateRange: {
                        from: dateFrom ? new Date(dateFrom).toISOString() : null,
                        to: dateTo ? new Date(dateTo).toISOString() : null,
                    },
                },
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