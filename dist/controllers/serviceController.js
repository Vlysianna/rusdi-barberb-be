"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceService_1 = __importDefault(require("../services/serviceService"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
class ServiceController {
    constructor() {
        this.getServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
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
            return response_1.ApiResponseUtil.success(res, "Services retrieved successfully", result);
        });
        this.getServiceById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Service ID is required");
            }
            const service = await serviceService_1.default.getServiceById(id);
            if (!service) {
                return response_1.ApiResponseUtil.notFound(res, "Service not found");
            }
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
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Service ID is required");
            }
            const service = await serviceService_1.default.updateService(id, updateData);
            return response_1.ApiResponseUtil.updated(res, service, "Service updated successfully");
        });
        this.deleteService = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Service ID is required");
            }
            await serviceService_1.default.deleteService(id);
            return response_1.ApiResponseUtil.deleted(res, "Service deleted successfully");
        });
        this.getCategories = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { page = 1, limit = 20, search, isActive, sortBy = "sortOrder", sortOrder = "asc", } = req.query;
            return response_1.ApiResponseUtil.success(res, "Categories endpoint not implemented", []);
        });
        this.createCategory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const categoryData = req.body;
            return response_1.ApiResponseUtil.success(res, "Category creation endpoint not implemented", null);
        });
        this.updateCategory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const updateData = req.body;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Category ID is required");
            }
            return response_1.ApiResponseUtil.success(res, "Category update endpoint not implemented", null);
        });
        this.deleteCategory = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Category ID is required");
            }
            return response_1.ApiResponseUtil.success(res, "Category deletion endpoint not implemented");
        });
        this.getServiceAddons = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { serviceId } = req.params;
            if (!serviceId) {
                return response_1.ApiResponseUtil.badRequest(res, "Service ID is required");
            }
            return response_1.ApiResponseUtil.success(res, "Service addons endpoint not implemented", []);
        });
        this.createServiceAddon = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { serviceId } = req.params;
            const addonData = req.body;
            if (!serviceId) {
                return response_1.ApiResponseUtil.badRequest(res, "Service ID is required");
            }
            return response_1.ApiResponseUtil.success(res, "Service addon creation endpoint not implemented", null);
        });
        this.updateServiceAddon = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { addonId } = req.params;
            const updateData = req.body;
            if (!addonId) {
                return response_1.ApiResponseUtil.badRequest(res, "Addon ID is required");
            }
            return response_1.ApiResponseUtil.success(res, "Service addon update endpoint not implemented", null);
        });
        this.deleteServiceAddon = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { addonId } = req.params;
            if (!addonId) {
                return response_1.ApiResponseUtil.badRequest(res, "Addon ID is required");
            }
            response_1.ApiResponseUtil.success(res, "Service addon deletion endpoint not implemented");
            return;
        });
        this.uploadServiceImage = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const file = req.file;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "Service ID is required");
            }
            if (!file) {
                return response_1.ApiResponseUtil.badRequest(res, "Image file is required");
            }
            return response_1.ApiResponseUtil.success(res, "Service image upload endpoint not implemented", null);
        });
        this.getServiceStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const stats = await serviceService_1.default.getServiceStats();
            return response_1.ApiResponseUtil.success(res, "Service statistics retrieved successfully", stats);
        });
        this.getPopularServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { limit = 10, period = "month" } = req.query;
            const services = await serviceService_1.default.getPopularServices(Number(limit));
            return response_1.ApiResponseUtil.success(res, "Popular services retrieved successfully", services);
        });
        this.searchServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { q: query, page = 1, limit = 10, category, minPrice, maxPrice, } = req.query;
            if (!query) {
                return response_1.ApiResponseUtil.badRequest(res, "Search query is required");
            }
            const result = await serviceService_1.default.searchServices(query, Number(limit));
            return response_1.ApiResponseUtil.success(res, "Search results retrieved successfully", result);
        });
        this.bulkUpdateServices = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { serviceIds, updateData } = req.body;
            if (!serviceIds ||
                !Array.isArray(serviceIds) ||
                serviceIds.length === 0) {
                return response_1.ApiResponseUtil.badRequest(res, "Service IDs array is required");
            }
            return response_1.ApiResponseUtil.success(res, "Bulk update endpoint not implemented", null);
        });
    }
}
exports.default = new ServiceController();
//# sourceMappingURL=serviceController.js.map