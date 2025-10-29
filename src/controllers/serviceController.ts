import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import serviceService from "../services/serviceService";
import { ApiResponseUtil } from "../utils/response";
import { asyncHandler } from "../middleware/errorHandler";
import { ServiceCategory } from "../utils/types";

class ServiceController {
  /**
   * Get all services with pagination and filters
   */
  getServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        isActive,
        sortBy = "createdAt",
        sortOrder = "desc",
        minPrice,
        maxPrice,
      } = req.query;

      const result = await serviceService.getServices({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        category: category as ServiceCategory,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });

      return ApiResponseUtil.success(
        res,
        "Services retrieved successfully",
        result,
      );
    },
  );

  /**
   * Get service by ID
   */
  getServiceById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Service ID is required");
      }

      const service = await serviceService.getServiceById(id);

      if (!service) {
        return ApiResponseUtil.notFound(res, "Service not found");
      }

      return ApiResponseUtil.success(
        res,
        "Service retrieved successfully",
        service,
      );
    },
  );

  /**
   * Create new service (Admin/Stylist)
   */
  createService = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const serviceData = req.body;

      const service = await serviceService.createService(serviceData);

      return ApiResponseUtil.created(
        res,
        service,
        "Service created successfully",
      );
    },
  );

  /**
   * Update service (Admin/Stylist)
   */
  updateService = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Service ID is required");
      }

      const service = await serviceService.updateService(id, updateData);

      return ApiResponseUtil.updated(
        res,
        service,
        "Service updated successfully",
      );
    },
  );

  /**
   * Delete service (Admin only)
   */
  deleteService = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Service ID is required");
      }

      await serviceService.deleteService(id);

      return ApiResponseUtil.deleted(res, "Service deleted successfully");
    },
  );

  /**
   * Get all service categories
   */
  getCategories = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const {
        page = 1,
        limit = 20,
        search,
        isActive,
        sortBy = "sortOrder",
        sortOrder = "asc",
      } = req.query;

      // Categories functionality not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Categories endpoint not implemented",
        [],
      );
    },
  );

  /**
   * Create service category (Admin only)
   */
  createCategory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const categoryData = req.body;

      // Category creation not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Category creation endpoint not implemented",
        null,
      );
    },
  );

  /**
   * Update service category (Admin only)
   */
  updateCategory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Category ID is required");
      }

      // Category update not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Category update endpoint not implemented",
        null,
      );
    },
  );

  /**
   * Delete service category (Admin only)
   */
  deleteCategory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Category ID is required");
      }

      // Category deletion not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Category deletion endpoint not implemented",
      );
    },
  );

  /**
   * Get service addons
   */
  getServiceAddons = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { serviceId } = req.params;

      if (!serviceId) {
        return ApiResponseUtil.badRequest(res, "Service ID is required");
      }

      // Service addons not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Service addons endpoint not implemented",
        [],
      );
    },
  );

  /**
   * Create service addon (Admin/Stylist)
   */
  createServiceAddon = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { serviceId } = req.params;
      const addonData = req.body;

      if (!serviceId) {
        return ApiResponseUtil.badRequest(res, "Service ID is required");
      }

      // Service addon creation not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Service addon creation endpoint not implemented",
        null,
      );
    },
  );

  /**
   * Update service addon (Admin/Stylist)
   */
  updateServiceAddon = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { addonId } = req.params;
      const updateData = req.body;

      if (!addonId) {
        return ApiResponseUtil.badRequest(res, "Addon ID is required");
      }

      // Service addon update not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Service addon update endpoint not implemented",
        null,
      );
    },
  );

  /**
   * Delete service addon (Admin/Stylist)
   */
  deleteServiceAddon = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { addonId } = req.params;

      if (!addonId) {
        return ApiResponseUtil.badRequest(res, "Addon ID is required");
      }

      // Service addon deletion not implemented in serviceService yet
      ApiResponseUtil.success(
        res,
        "Service addon deletion endpoint not implemented",
      );

      return;
    },
  );

  /**
   * Upload service image (Admin/Stylist)
   */
  uploadServiceImage = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const file = req.file;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "Service ID is required");
      }

      if (!file) {
        return ApiResponseUtil.badRequest(res, "Image file is required");
      }

      // Service image upload not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Service image upload endpoint not implemented",
        null,
      );
    },
  );

  /**
   * Get service statistics (Admin only)
   */
  getServiceStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const stats = await serviceService.getServiceStats();

      return ApiResponseUtil.success(
        res,
        "Service statistics retrieved successfully",
        stats,
      );
    },
  );

  /**
   * Get popular services
   */
  getPopularServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { limit = 10, period = "month" } = req.query;

      const services = await serviceService.getPopularServices(Number(limit));

      return ApiResponseUtil.success(
        res,
        "Popular services retrieved successfully",
        services,
      );
    },
  );

  /**
   * Search services
   */
  searchServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const {
        q: query,
        page = 1,
        limit = 10,
        category,
        minPrice,
        maxPrice,
      } = req.query;

      if (!query) {
        return ApiResponseUtil.badRequest(res, "Search query is required");
      }

      const result = await serviceService.searchServices(
        query as string,
        Number(limit),
      );

      return ApiResponseUtil.success(
        res,
        "Search results retrieved successfully",
        result,
      );
    },
  );

  /**
   * Bulk update services (Admin only)
   */
  bulkUpdateServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { serviceIds, updateData } = req.body;

      if (
        !serviceIds ||
        !Array.isArray(serviceIds) ||
        serviceIds.length === 0
      ) {
        return ApiResponseUtil.badRequest(res, "Service IDs array is required");
      }

      // Bulk update not implemented in serviceService yet
      return ApiResponseUtil.success(
        res,
        "Bulk update endpoint not implemented",
        null,
      );
    },
  );
}

export default new ServiceController();
