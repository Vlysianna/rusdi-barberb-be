import { Router } from "express";
import { serviceController } from "../controllers/serviceController";
import {
  authenticateToken,
  adminOnly,
  managerOrAdmin,
  authenticatedUser,
} from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
  validateId,
} from "../middleware/validation";
import Joi from "joi";

const router = Router();

/**
 * Validation schemas
 */
const createServiceSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "any.required": "Service name is required",
    "string.empty": "Service name cannot be empty",
    "string.min": "Service name must be at least 1 character",
    "string.max": "Service name cannot exceed 100 characters",
  }),
  description: Joi.string().min(1).max(500).required().messages({
    "any.required": "Service description is required",
    "string.empty": "Service description cannot be empty",
    "string.max": "Service description cannot exceed 500 characters",
  }),
  price: Joi.number().positive().required().messages({
    "any.required": "Service price is required",
    "number.positive": "Service price must be positive",
  }),
  duration: Joi.number().integer().min(15).max(480).required().messages({
    "any.required": "Service duration is required",
    "number.integer": "Service duration must be an integer",
    "number.min": "Service duration must be at least 15 minutes",
    "number.max": "Service duration cannot exceed 8 hours",
  }),
  category: Joi.string()
    .valid(
      "haircut",
      "beard_trim",
      "hair_wash",
      "styling",
      "coloring",
      "treatment",
      "package"
    )
    .required()
    .messages({
      "any.required": "Service category is required",
      "any.only": "Invalid service category",
    }),
  isActive: Joi.boolean().optional().default(true),
  isPopular: Joi.boolean().optional().default(false),
  requirements: Joi.array().items(Joi.string().max(200)).optional().default([]),
  instructions: Joi.string().max(1000).optional(),
  image: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional().default([]),
});

const updateServiceSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().min(1).max(500).optional(),
  price: Joi.number().positive().optional(),
  duration: Joi.number().integer().min(15).max(480).optional(),
  category: Joi.string()
    .valid(
      "haircut",
      "beard_trim",
      "hair_wash",
      "styling",
      "coloring",
      "treatment",
      "package"
    )
    .optional(),
  isActive: Joi.boolean().optional(),
  isPopular: Joi.boolean().optional(),
  requirements: Joi.array().items(Joi.string().max(200)).optional(),
  instructions: Joi.string().max(1000).optional(),
  image: Joi.string().uri().optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
}).min(1);

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().min(1).max(100).optional(),
  category: Joi.string()
    .valid(
      "haircut",
      "beard_trim",
      "hair_wash",
      "styling",
      "coloring",
      "treatment",
      "package"
    )
    .optional(),
  isActive: Joi.boolean().optional(),
  isPopular: Joi.boolean().optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
});

/**
 * Service Routes
 */

// GET /services - Get all services (with filters)
router.get(
  "/",
  authenticateToken,
  validateQuery(querySchema),
  serviceController.getAllServices,
);

// POST /services - Create new service (Admin/Manager only)
router.post(
  "/",
  authenticateToken,
  managerOrAdmin,
  validateBody(createServiceSchema),
  serviceController.createService,
);

// GET /services/active - Get active services only (for booking)
router.get(
  "/active",
  authenticateToken,
  serviceController.getActiveServices,
);

// GET /services/popular - Get popular services
router.get(
  "/popular",
  authenticateToken,
  validateQuery(
    Joi.object({
      limit: Joi.number().integer().min(1).max(50).optional().default(10),
    })
  ),
  serviceController.getPopularServices,
);

// GET /services/categories - Get service categories with counts
router.get(
  "/categories",
  authenticateToken,
  serviceController.getServiceCategories,
);

// GET /services/category/:category - Get services by category
router.get(
  "/category/:category",
  authenticateToken,
  validateParams(
    Joi.object({
      category: Joi.string()
        .valid(
          "haircut",
          "beard_trim",
          "hair_wash",
          "styling",
          "coloring",
          "treatment",
          "package"
        )
        .required(),
    })
  ),
  serviceController.getServicesByCategory,
);

// GET /services/recommended - Get recommended services
router.get(
  "/recommended",
  authenticateToken,
  validateQuery(
    Joi.object({
      customerId: Joi.string().optional(),
    })
  ),
  serviceController.getRecommendedServices,
);

// GET /services/export - Export services data (Admin/Manager only)
router.get(
  "/export",
  authenticateToken,
  managerOrAdmin,
  validateQuery(
    Joi.object({
      format: Joi.string().valid("csv", "excel").optional().default("csv"),
    })
  ),
  serviceController.exportServices,
);

// GET /services/stylist/:stylistId - Get services for specific stylist
router.get(
  "/stylist/:stylistId",
  authenticateToken,
  validateId,
  serviceController.getServicesByStylist,
);

// GET /services/:id - Get service by ID
router.get(
  "/:id",
  authenticateToken,
  validateId,
  serviceController.getServiceById,
);

// PUT /services/:id - Update service (Admin/Manager only)
router.put(
  "/:id",
  authenticateToken,
  managerOrAdmin,
  validateId,
  validateBody(updateServiceSchema),
  serviceController.updateService,
);

// DELETE /services/:id - Delete service (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  adminOnly,
  validateId,
  serviceController.deleteService,
);

// PATCH /services/:id/status - Update service status (Admin/Manager only)
router.patch(
  "/:id/status",
  authenticateToken,
  managerOrAdmin,
  validateId,
  validateBody(
    Joi.object({
      isActive: Joi.boolean().required().messages({
        "any.required": "Status is required",
      }),
    })
  ),
  serviceController.updateServiceStatus,
);

// POST /services/:id/toggle-popular - Toggle service popularity (Admin/Manager only)
router.post(
  "/:id/toggle-popular",
  authenticateToken,
  managerOrAdmin,
  validateId,
  serviceController.toggleServicePopularity,
);

// GET /services/:id/analytics - Get service analytics (Admin/Manager only)
router.get(
  "/:id/analytics",
  authenticateToken,
  managerOrAdmin,
  validateId,
  validateQuery(
    Joi.object({
      dateFrom: Joi.string().isoDate().optional(),
      dateTo: Joi.string().isoDate().optional(),
    })
  ),
  serviceController.getServiceAnalytics,
);

// GET /services/:id/availability - Check service availability
router.get(
  "/:id/availability",
  authenticateToken,
  validateId,
  validateQuery(
    Joi.object({
      date: Joi.string().isoDate().required().messages({
        "any.required": "Date is required",
        "string.isoDate": "Date must be in ISO format (YYYY-MM-DD)",
      }),
      time: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
          "any.required": "Time is required",
          "string.pattern.base": "Time must be in HH:mm format",
        }),
    })
  ),
  serviceController.getServiceAvailability,
);

// GET /services/:id/reviews - Get service reviews
router.get(
  "/:id/reviews",
  authenticateToken,
  validateId,
  validateQuery(
    Joi.object({
      page: Joi.number().integer().min(1).optional().default(1),
      limit: Joi.number().integer().min(1).max(50).optional().default(20),
    })
  ),
  serviceController.getServiceReviews,
);

// GET /services/:id/pricing-history - Get service pricing history (Admin/Manager only)
router.get(
  "/:id/pricing-history",
  authenticateToken,
  managerOrAdmin,
  validateId,
  serviceController.getServicePricingHistory,
);

// PATCH /services/bulk-update - Bulk update services (Admin/Manager only)
router.patch(
  "/bulk-update",
  authenticateToken,
  managerOrAdmin,
  validateBody(
    Joi.object({
      serviceIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .required()
        .messages({
          "array.min": "At least one service ID is required",
          "any.required": "Service IDs array is required",
        }),
      updates: Joi.object({
        isActive: Joi.boolean().optional(),
        isPopular: Joi.boolean().optional(),
        category: Joi.string()
          .valid(
            "haircut",
            "beard_trim",
            "hair_wash",
            "styling",
            "coloring",
            "treatment",
            "package"
          )
          .optional(),
        tags: Joi.array().items(Joi.string().max(50)).optional(),
      })
        .min(1)
        .required()
        .messages({
          "object.min": "At least one field to update is required",
          "any.required": "Update data is required",
        }),
    })
  ),
  serviceController.bulkUpdateServices,
);

export default router;
