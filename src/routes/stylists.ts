import { Router } from "express";
import { stylistController } from "../controllers/stylistController";
import {
  authenticateToken,
  checkPermission,
  checkResourceOwnership,
  restrictTo,
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
const createStylistSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.empty": "User ID cannot be empty",
  }),
  specialties: Joi.array().items(Joi.string()).optional().default([]),
  experience: Joi.number().integer().min(0).optional().default(0),
  commissionRate: Joi.number().min(0).max(100).optional().default(15),
  isAvailable: Joi.boolean().optional().default(true),
  schedule: Joi.object({
    monday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    tuesday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    wednesday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    thursday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    friday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    saturday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    sunday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
  }).optional(),
  bio: Joi.string().max(500).optional(),
});

const updateStylistSchema = Joi.object({
  specialties: Joi.array().items(Joi.string()).optional(),
  experience: Joi.number().integer().min(0).optional(),
  commissionRate: Joi.number().min(0).max(100).optional(),
  isAvailable: Joi.boolean().optional(),
  schedule: Joi.object({
    monday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    tuesday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    wednesday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    thursday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    friday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    saturday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
    sunday: Joi.object({
      isWorking: Joi.boolean().required(),
      startTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).optional(),
  }).optional(),
  bio: Joi.string().max(500).optional(),
}).min(1);

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().min(1).max(100).optional(),
  isAvailable: Joi.boolean().optional(),
  specialties: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),
});

/**
 * Stylist Routes
 */

// GET /stylists - Get all stylists
router.get(
  "/",
  authenticateToken,
  validateQuery(querySchema),
  stylistController.getAllStylists,
);

// POST /stylists - Create new stylist (Admin/Manager only)
router.post(
  "/",
  authenticateToken,
  checkPermission('stylists', 'create'),
  validateBody(createStylistSchema),
  stylistController.createStylist,
);

// GET /stylists/available - Get available stylists for specific date/time
router.get(
  "/available",
  authenticateToken,
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
    }),
  ),
  stylistController.getAvailableStylists,
);

// GET /stylists/specialties - Get all available specialties
router.get(
  "/specialties",
  authenticateToken,
  stylistController.getStylistSpecialties,
);

// GET /stylists/:id - Get stylist by ID
router.get(
  "/:id",
  authenticateToken,
  validateId,
  stylistController.getStylistById,
);

// PUT /stylists/:id - Update stylist (Admin/Manager or stylist themselves)
router.put(
  "/:id",
  authenticateToken,
  checkResourceOwnership('stylist'),
  validateId,
  validateBody(updateStylistSchema),
  stylistController.updateStylist,
);

// DELETE /stylists/:id - Delete stylist (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  checkPermission('stylists', 'delete'),
  validateId,
  stylistController.deleteStylist,
);

// PATCH /stylists/:id/availability - Update stylist availability
router.patch(
  "/:id/availability",
  authenticateToken,
  checkResourceOwnership('stylist'),
  validateId,
  validateBody(
    Joi.object({
      isAvailable: Joi.boolean().required().messages({
        "any.required": "Availability status is required",
      }),
    }),
  ),
  stylistController.updateAvailability,
);

// PATCH /stylists/:id/schedule - Update stylist schedule
router.patch(
  "/:id/schedule",
  authenticateToken,
  checkResourceOwnership('stylist'),
  validateId,
  validateBody(
    Joi.object({
      schedule: Joi.object({
        monday: Joi.object({
          isWorking: Joi.boolean().required(),
          startTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }).optional(),
        tuesday: Joi.object({
          isWorking: Joi.boolean().required(),
          startTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }).optional(),
        wednesday: Joi.object({
          isWorking: Joi.boolean().required(),
          startTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }).optional(),
        thursday: Joi.object({
          isWorking: Joi.boolean().required(),
          startTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }).optional(),
        friday: Joi.object({
          isWorking: Joi.boolean().required(),
          startTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }).optional(),
        saturday: Joi.object({
          isWorking: Joi.boolean().required(),
          startTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }).optional(),
        sunday: Joi.object({
          isWorking: Joi.boolean().required(),
          startTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .required(),
        }).optional(),
      })
        .required()
        .messages({
          "any.required": "Schedule is required",
        }),
    }),
  ),
  stylistController.updateSchedule,
);

// GET /stylists/:id/bookings - Get stylist bookings
router.get(
  "/:id/bookings",
  authenticateToken,
  validateId,
  validateQuery(
    Joi.object({
      page: Joi.number().integer().min(1).optional().default(1),
      limit: Joi.number().integer().min(1).max(100).optional().default(10),
      status: Joi.string()
        .valid(
          "pending",
          "confirmed",
          "in_progress",
          "completed",
          "cancelled",
          "no_show",
        )
        .optional(),
      dateFrom: Joi.string().isoDate().optional(),
      dateTo: Joi.string().isoDate().optional(),
    }),
  ),
  stylistController.getStylistBookings,
);

// GET /stylists/:id/performance - Get stylist performance metrics
router.get(
  "/:id/performance",
  authenticateToken,
  checkPermission('reports', 'read'),
  validateId,
  validateQuery(
    Joi.object({
      dateFrom: Joi.string().isoDate().optional(),
      dateTo: Joi.string().isoDate().optional(),
    }),
  ),
  stylistController.getStylistPerformance,
);

// GET /stylists/:id/earnings - Get stylist earnings
router.get(
  "/:id/earnings",
  authenticateToken,
  checkResourceOwnership('stylist'),
  validateId,
  validateQuery(
    Joi.object({
      dateFrom: Joi.string().isoDate().optional(),
      dateTo: Joi.string().isoDate().optional(),
    }),
  ),
  stylistController.getStylistEarnings,
);

// GET /stylists/:id/reviews - Get stylist reviews
router.get(
  "/:id/reviews",
  authenticateToken,
  validateId,
  validateQuery(
    Joi.object({
      page: Joi.number().integer().min(1).optional().default(1),
      limit: Joi.number().integer().min(1).max(50).optional().default(20),
    }),
  ),
  stylistController.getStylistReviews,
);

// POST /stylists/:id/services - Assign service to stylist
router.post(
  "/:id/services",
  authenticateToken,
  checkPermission('stylists', 'update'),
  validateId,
  validateBody(
    Joi.object({
      serviceId: Joi.string().required().messages({
        "any.required": "Service ID is required",
        "string.empty": "Service ID cannot be empty",
      }),
    }),
  ),
  stylistController.assignServiceToStylist,
);

// DELETE /stylists/:id/services/:serviceId - Remove service from stylist
router.delete(
  "/:id/services/:serviceId",
  authenticateToken,
  checkPermission('stylists', 'update'),
  validateParams(
    Joi.object({
      id: Joi.string().required(),
      serviceId: Joi.string().required(),
    }),
  ),
  stylistController.removeServiceFromStylist,
);

export default router;
