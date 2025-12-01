"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylistController = void 0;
const stylistService_1 = __importDefault(require("../services/stylistService"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
class StylistController {
    constructor() {
        this.getAllStylists = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { page = 1, limit = 10, search, isAvailable, specialties, } = req.query;
            const result = await stylistService_1.default.getAllStylists({
                page: Number(page),
                limit: Number(limit),
                search: search,
                isAvailable: isAvailable === "true"
                    ? true
                    : isAvailable === "false"
                        ? false
                        : undefined,
                specialties: Array.isArray(specialties)
                    ? specialties
                    : specialties
                        ? [specialties]
                        : undefined,
            });
            return response_1.ApiResponseUtil.paginated(res, result.stylists, result.total, Number(page), Number(limit), "Stylists retrieved successfully");
        });
        this.getStylistById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const stylist = await stylistService_1.default.getStylistById(id);
            return response_1.ApiResponseUtil.success(res, "Stylist retrieved successfully", stylist);
        });
        this.createStylist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const stylistData = req.body;
            const stylist = await stylistService_1.default.createStylist(stylistData);
            return response_1.ApiResponseUtil.created(res, stylist, "Stylist created successfully");
        });
        this.updateStylist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const updateData = req.body;
            if (req.user?.role !== "admin" && req.user?.role !== "manager") {
                const stylist = await stylistService_1.default.getStylistById(id);
                if (stylist.userId !== req.user?.userId) {
                    return response_1.ApiResponseUtil.forbidden(res, "You can only update your own profile");
                }
            }
            const updatedStylist = await stylistService_1.default.updateStylist(id, updateData);
            return response_1.ApiResponseUtil.success(res, "Stylist updated successfully", updatedStylist);
        });
        this.deleteStylist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            await stylistService_1.default.deleteStylist(id);
            return response_1.ApiResponseUtil.success(res, "Stylist deleted successfully", null);
        });
        this.getAvailableStylists = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { date, time } = req.query;
            const stylists = await stylistService_1.default.getAvailableStylists(date, time);
            return response_1.ApiResponseUtil.success(res, "Available stylists retrieved successfully", stylists);
        });
        this.updateAvailability = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { isAvailable } = req.body;
            const updatedStylist = await stylistService_1.default.updateAvailability(id, isAvailable);
            return response_1.ApiResponseUtil.success(res, "Stylist availability updated successfully", updatedStylist);
        });
        this.updateSchedule = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { schedule } = req.body;
            const updatedStylist = await stylistService_1.default.updateSchedule(id, schedule);
            return response_1.ApiResponseUtil.success(res, "Stylist schedule updated successfully", updatedStylist);
        });
        this.getStylistBookings = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;
            if (req.user?.role !== "admin" && req.user?.role !== "manager") {
                const stylist = await stylistService_1.default.getStylistById(id);
                if (stylist.userId !== req.user?.userId) {
                    return response_1.ApiResponseUtil.forbidden(res, "You can only access your own bookings");
                }
            }
            const result = await stylistService_1.default.getStylistBookings(id, {
                page: Number(page),
                limit: Number(limit),
                status: status,
                dateFrom: dateFrom,
                dateTo: dateTo,
            });
            return response_1.ApiResponseUtil.paginated(res, result.bookings, result.total, Number(page), Number(limit), "Stylist bookings retrieved successfully");
        });
        this.getStylistPerformance = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { dateFrom, dateTo } = req.query;
            const performance = await stylistService_1.default.getStylistPerformance(id, dateFrom, dateTo);
            return response_1.ApiResponseUtil.success(res, "Stylist performance retrieved successfully", performance);
        });
        this.getStylistEarnings = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { dateFrom, dateTo } = req.query;
            if (req.user?.role !== "admin" && req.user?.role !== "manager") {
                const stylist = await stylistService_1.default.getStylistById(id);
                if (stylist.userId !== req.user?.userId) {
                    return response_1.ApiResponseUtil.forbidden(res, "You can only access your own earnings");
                }
            }
            const earnings = await stylistService_1.default.getStylistEarnings(id, dateFrom, dateTo);
            return response_1.ApiResponseUtil.success(res, "Stylist earnings retrieved successfully", earnings);
        });
        this.getStylistReviews = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const result = await stylistService_1.default.getStylistReviews(id, Number(page), Number(limit));
            return response_1.ApiResponseUtil.paginated(res, result.reviews, result.total, Number(page), Number(limit), "Stylist reviews retrieved successfully");
        });
        this.getStylistSpecialties = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const specialties = await stylistService_1.default.getStylistSpecialties();
            return response_1.ApiResponseUtil.success(res, "Stylist specialties retrieved successfully", specialties);
        });
        this.assignServiceToStylist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { serviceId } = req.body;
            await stylistService_1.default.assignServiceToStylist(id, serviceId);
            return response_1.ApiResponseUtil.success(res, "Service assigned to stylist successfully", null);
        });
        this.removeServiceFromStylist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id, serviceId } = req.params;
            await stylistService_1.default.removeServiceFromStylist(id, serviceId);
            return response_1.ApiResponseUtil.success(res, "Service removed from stylist successfully", null);
        });
        this.getStylistSchedules = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const schedules = await stylistService_1.default.getStylistSchedules(id);
            return response_1.ApiResponseUtil.success(res, "Stylist schedules retrieved successfully", schedules);
        });
        this.addStylistSchedule = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const scheduleData = req.body;
            const schedule = await stylistService_1.default.addStylistSchedule(id, scheduleData);
            return response_1.ApiResponseUtil.created(res, schedule, "Stylist schedule added successfully");
        });
        this.updateStylistScheduleEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id, scheduleId } = req.params;
            const scheduleData = req.body;
            const schedule = await stylistService_1.default.updateStylistScheduleEntry(id, scheduleId, scheduleData);
            return response_1.ApiResponseUtil.success(res, "Stylist schedule updated successfully", schedule);
        });
        this.deleteStylistScheduleEntry = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id, scheduleId } = req.params;
            await stylistService_1.default.deleteStylistScheduleEntry(id, scheduleId);
            return response_1.ApiResponseUtil.success(res, "Stylist schedule deleted successfully", null);
        });
    }
}
exports.stylistController = new StylistController();
exports.default = exports.stylistController;
//# sourceMappingURL=stylistController.js.map