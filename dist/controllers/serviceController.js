"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceController = void 0;
const serviceService_1 = __importDefault(require("../services/serviceService"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
class ServiceController {
    constructor() {
        this.getAllServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { page = 1, limit = 10, search, category, isActive, sortBy = "createdAt", sortOrder = "desc", minPrice, maxPrice, } = req.query;
            const result = await serviceService_1.default.getServices({
                page: Number(page),
                limit: Number(limit),
                search: search,
                category: category,
                isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
                sortBy: sortBy,
                sortOrder: sortOrder,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
            });
            return response_1.ApiResponseUtil.paginated(res, result.services, result.total, Number(page), Number(limit), "Services retrieved successfully");
        });
        this.getServiceById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const service = await serviceService_1.default.getServiceById(id);
            return response_1.ApiResponseUtil.success(res, "Service retrieved successfully", service);
        });
        this.createService = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const serviceData = req.body;
            const service = await serviceService_1.default.createService(serviceData);
            return response_1.ApiResponseUtil.created(res, service, "Service created successfully");
        });
        this.updateService = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const updateData = req.body;
            const updatedService = await serviceService_1.default.updateService(id, updateData);
            return response_1.ApiResponseUtil.success(res, "Service updated successfully", updatedService);
        });
        this.deleteService = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            await serviceService_1.default.deleteService(id);
            return response_1.ApiResponseUtil.success(res, "Service deleted successfully", null);
        });
        this.getActiveServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const services = await serviceService_1.default.getActiveServices();
            return response_1.ApiResponseUtil.success(res, "Active services retrieved successfully", services);
        });
        this.getPopularServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { limit = 10 } = req.query;
            const services = await serviceService_1.default.getPopularServices(Number(limit));
            return response_1.ApiResponseUtil.success(res, "Popular services retrieved successfully", services);
        });
        this.getServicesByCategory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { category } = req.params;
            const services = await serviceService_1.default.getServicesByCategory(category);
            return response_1.ApiResponseUtil.success(res, "Services by category retrieved successfully", services);
        });
        this.getServiceCategories = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const categories = await serviceService_1.default.getServiceCategories();
            return response_1.ApiResponseUtil.success(res, "Service categories retrieved successfully", categories);
        });
        this.updateServiceStatus = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { isActive } = req.body;
            const updatedService = await serviceService_1.default.updateServiceStatus(id, isActive);
            return response_1.ApiResponseUtil.success(res, "Service status updated successfully", updatedService);
        });
        this.toggleServicePopularity = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const updatedService = await serviceService_1.default.toggleServicePopularity(id);
            return response_1.ApiResponseUtil.success(res, "Service popularity toggled successfully", updatedService);
        });
        this.getServiceAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { dateFrom, dateTo } = req.query;
            const analytics = await serviceService_1.default.getServiceAnalytics(id, dateFrom, dateTo);
            return response_1.ApiResponseUtil.success(res, "Service analytics retrieved successfully", analytics);
        });
        this.getServiceAvailability = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { date, time } = req.query;
            const availability = await serviceService_1.default.getServiceAvailability(id, date, time);
            return response_1.ApiResponseUtil.success(res, "Service availability retrieved successfully", availability);
        });
        this.getRecommendedServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { customerId } = req.query;
            const services = await serviceService_1.default.getRecommendedServices(customerId);
            return response_1.ApiResponseUtil.success(res, "Recommended services retrieved successfully", services);
        });
        this.exportServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { format = "csv" } = req.query;
            const data = await serviceService_1.default.exportServices(format);
            res.setHeader("Content-Disposition", `attachment; filename=services.${format}`);
            res.setHeader("Content-Type", format === "csv"
                ? "text/csv"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            return res.send(data);
        });
        this.getServicesByStylist = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { stylistId } = req.params;
            const services = await serviceService_1.default.getServicesByStylist(stylistId);
            return response_1.ApiResponseUtil.success(res, "Services by stylist retrieved successfully", services);
        });
        this.getServiceReviews = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const result = await serviceService_1.default.getServiceReviews(id, Number(page), Number(limit));
            return response_1.ApiResponseUtil.paginated(res, result.reviews, result.total, Number(page), Number(limit), "Service reviews retrieved successfully");
        });
        this.getServicePricingHistory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const history = await serviceService_1.default.getServicePricingHistory(id);
            return response_1.ApiResponseUtil.success(res, "Service pricing history retrieved successfully", history);
        });
        this.bulkUpdateServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { serviceIds, updates } = req.body;
            const updatedServices = await serviceService_1.default.bulkUpdateServices(serviceIds, updates);
            return response_1.ApiResponseUtil.success(res, "Services updated successfully", updatedServices);
        });
    }
}
exports.serviceController = new ServiceController();
exports.default = exports.serviceController;
//# sourceMappingURL=serviceController.js.map