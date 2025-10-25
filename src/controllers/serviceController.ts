import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import serviceService from "../services/serviceService";
import { ApiResponseUtil } from "../utils/response";
import { asyncHandler } from "../middleware/errorHandler";

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
        minDuration,
        maxDuration,
      } = req.query;

      const result = await serviceService.getServices({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        category: category as string,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minDuration: minDuration ? Number(minDuration) : undefined,
        maxDuration: maxDuration ? Number(maxDuration) : undefined,
      });

      return ApiResponseUtil.paginated(
        res,
        result.services,
        result.total,
        Number(page),
        Number(limit),
        "Services retrieved successfully",
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

      const result = await serviceService.getCategories({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return ApiResponseUtil.paginated(
        res,
        result.categories,
        result.total,
        Number(page),
        Number(limit),
        "Categories retrieved successfully",
      );
    },
  );

  /**
   * Create service category (Admin only)
   */
  createCategory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const categoryData = req.body;

      const category = await serviceService.createCategory(categoryData);

      return ApiResponseUtil.created(
        res,
        category,
        "Category created successfully",
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

      const category = await serviceService.updateCategory(id, updateData);

      return ApiResponseUtil.updated(
        res,
        category,
        "Category updated successfully",
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

      await serviceService.deleteCategory(id);

      return ApiResponseUtil.deleted(res, "Category deleted successfully");
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

      const addons = await serviceService.getServiceAddons(serviceId);

      return ApiResponseUtil.success(
        res,
        "Service addons retrieved successfully",
        addons,
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

      const addon = await serviceService.createServiceAddon(
        serviceId,
        addonData,
      );

      return ApiResponseUtil.created(
        res,
        addon,
        "Service addon created successfully",
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

      const addon = await serviceService.updateServiceAddon(
        addonId,
        updateData,
      );

      return ApiResponseUtil.updated(
        res,
        addon,
        "Service addon updated successfully",
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

      await serviceService.deleteServiceAddon(addonId);

      return ApiResponseUtil.deleted(res, "Service addon deleted successfully");
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

      const service = await serviceService.uploadServiceImage(id, file);

      return ApiResponseUtil.success(
        res,
        "Service image uploaded successfully",
        service,
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

      const services = await serviceService.getPopularServices({
        limit: Number(limit),
        period: period as "week" | "month" | "year",
      });

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

      const result = await serviceService.searchServices({
        query: query as string,
        page: Number(page),
        limit: Number(limit),
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });

      return ApiResponseUtil.paginated(
        res,
        result.services,
        result.total,
        Number(page),
        Number(limit),
        "Search results retrieved successfully",
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

      const result = await serviceService.bulkUpdateServices(
        serviceIds,
        updateData,
      );

      return ApiResponseUtil.success(res, "Services updated successfully", {
        updatedCount: result,
      });
    },
  );
}

export default new ServiceController();
