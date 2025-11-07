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
  getAllServices = asyncHandler(
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

      const service = await serviceService.getServiceById(id);

      return ApiResponseUtil.success(
        res,
        "Service retrieved successfully",
        service,
      );
    },
  );

  /**
   * Create new service (Admin/Manager only)
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
   * Update service (Admin/Manager only)
   */
  updateService = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updateData = req.body;

      const updatedService = await serviceService.updateService(id, updateData);

      return ApiResponseUtil.success(
        res,
        "Service updated successfully",
        updatedService,
      );
    },
  );

  /**
   * Delete service (Admin only)
   */
  deleteService = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      await serviceService.deleteService(id);

      return ApiResponseUtil.success(res, "Service deleted successfully", null);
    },
  );

  /**
   * Get active services only (for booking)
   */
  getActiveServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const services = await serviceService.getActiveServices();

      return ApiResponseUtil.success(
        res,
        "Active services retrieved successfully",
        services,
      );
    },
  );

  /**
   * Get popular services
   */
  getPopularServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { limit = 10 } = req.query;

      const services = await serviceService.getPopularServices(Number(limit));

      return ApiResponseUtil.success(
        res,
        "Popular services retrieved successfully",
        services,
      );
    },
  );

  /**
   * Get services by category
   */
  getServicesByCategory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { category } = req.params;

      const services = await serviceService.getServicesByCategory(category);

      return ApiResponseUtil.success(
        res,
        "Services by category retrieved successfully",
        services,
      );
    },
  );

  /**
   * Get service categories
   */
  getServiceCategories = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const categories = await serviceService.getServiceCategories();

      return ApiResponseUtil.success(
        res,
        "Service categories retrieved successfully",
        categories,
      );
    },
  );

  /**
   * Update service status
   */
  updateServiceStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { isActive } = req.body;

      const updatedService = await serviceService.updateServiceStatus(
        id,
        isActive,
      );

      return ApiResponseUtil.success(
        res,
        "Service status updated successfully",
        updatedService,
      );
    },
  );

  /**
   * Toggle service popularity
   */
  toggleServicePopularity = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const updatedService = await serviceService.toggleServicePopularity(id);

      return ApiResponseUtil.success(
        res,
        "Service popularity toggled successfully",
        updatedService,
      );
    },
  );

  /**
   * Get service analytics
   */
  getServiceAnalytics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { dateFrom, dateTo } = req.query;

      const analytics = await serviceService.getServiceAnalytics(
        id,
        dateFrom as string,
        dateTo as string,
      );

      return ApiResponseUtil.success(
        res,
        "Service analytics retrieved successfully",
        analytics,
      );
    },
  );

  /**
   * Get service availability
   */
  getServiceAvailability = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { date, time } = req.query;

      const availability = await serviceService.getServiceAvailability(
        id,
        date as string,
        time as string,
      );

      return ApiResponseUtil.success(
        res,
        "Service availability retrieved successfully",
        availability,
      );
    },
  );

  /**
   * Get recommended services
   */
  getRecommendedServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { customerId } = req.query;

      const services = await serviceService.getRecommendedServices(
        customerId as string,
      );

      return ApiResponseUtil.success(
        res,
        "Recommended services retrieved successfully",
        services,
      );
    },
  );

  /**
   * Export services data
   */
  exportServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { format = "csv" } = req.query;

      const data = await serviceService.exportServices(
        format as "csv" | "excel",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=services.${format}`,
      );
      res.setHeader(
        "Content-Type",
        format === "csv"
          ? "text/csv"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      return res.send(data);
    },
  );

  /**
   * Get services for specific stylist
   */
  getServicesByStylist = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { stylistId } = req.params;

      const services = await serviceService.getServicesByStylist(stylistId);

      return ApiResponseUtil.success(
        res,
        "Services by stylist retrieved successfully",
        services,
      );
    },
  );

  /**
   * Get service reviews
   */
  getServiceReviews = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await serviceService.getServiceReviews(
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
        "Service reviews retrieved successfully",
      );
    },
  );

  /**
   * Get service pricing history
   */
  getServicePricingHistory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const history = await serviceService.getServicePricingHistory(id);

      return ApiResponseUtil.success(
        res,
        "Service pricing history retrieved successfully",
        history,
      );
    },
  );

  /**
   * Bulk update services
   */
  bulkUpdateServices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { serviceIds, updates } = req.body;

      const updatedServices = await serviceService.bulkUpdateServices(
        serviceIds,
        updates,
      );

      return ApiResponseUtil.success(
        res,
        "Services updated successfully",
        updatedServices,
      );
    },
  );
}

export const serviceController = new ServiceController();
export default serviceController;
