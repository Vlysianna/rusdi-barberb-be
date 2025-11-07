"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const serviceController_1 = require("../controllers/serviceController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const createServiceSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required().messages({
        "any.required": "Service name is required",
        "string.empty": "Service name cannot be empty",
        "string.min": "Service name must be at least 1 character",
        "string.max": "Service name cannot exceed 100 characters",
    }),
    description: joi_1.default.string().min(1).max(500).required().messages({
        "any.required": "Service description is required",
        "string.empty": "Service description cannot be empty",
        "string.max": "Service description cannot exceed 500 characters",
    }),
    price: joi_1.default.number().positive().required().messages({
        "any.required": "Service price is required",
        "number.positive": "Service price must be positive",
    }),
    duration: joi_1.default.number().integer().min(15).max(480).required().messages({
        "any.required": "Service duration is required",
        "number.integer": "Service duration must be an integer",
        "number.min": "Service duration must be at least 15 minutes",
        "number.max": "Service duration cannot exceed 8 hours",
    }),
    category: joi_1.default.string()
        .valid("haircut", "beard_trim", "hair_wash", "styling", "coloring", "treatment", "package")
        .required()
        .messages({
        "any.required": "Service category is required",
        "any.only": "Invalid service category",
    }),
    isActive: joi_1.default.boolean().optional().default(true),
    isPopular: joi_1.default.boolean().optional().default(false),
    requirements: joi_1.default.array().items(joi_1.default.string().max(200)).optional().default([]),
    instructions: joi_1.default.string().max(1000).optional(),
    image: joi_1.default.string().uri().optional(),
    tags: joi_1.default.array().items(joi_1.default.string().max(50)).optional().default([]),
});
const updateServiceSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).optional(),
    description: joi_1.default.string().min(1).max(500).optional(),
    price: joi_1.default.number().positive().optional(),
    duration: joi_1.default.number().integer().min(15).max(480).optional(),
    category: joi_1.default.string()
        .valid("haircut", "beard_trim", "hair_wash", "styling", "coloring", "treatment", "package")
        .optional(),
    isActive: joi_1.default.boolean().optional(),
    isPopular: joi_1.default.boolean().optional(),
    requirements: joi_1.default.array().items(joi_1.default.string().max(200)).optional(),
    instructions: joi_1.default.string().max(1000).optional(),
    image: joi_1.default.string().uri().optional(),
    tags: joi_1.default.array().items(joi_1.default.string().max(50)).optional(),
}).min(1);
const querySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(100).optional().default(10),
    search: joi_1.default.string().min(1).max(100).optional(),
    category: joi_1.default.string()
        .valid("haircut", "beard_trim", "hair_wash", "styling", "coloring", "treatment", "package")
        .optional(),
    isActive: joi_1.default.boolean().optional(),
    isPopular: joi_1.default.boolean().optional(),
    minPrice: joi_1.default.number().positive().optional(),
    maxPrice: joi_1.default.number().positive().optional(),
});
router.get("/", auth_1.authenticateToken, (0, validation_1.validateQuery)(querySchema), serviceController_1.serviceController.getAllServices);
router.post("/", auth_1.authenticateToken, auth_1.managerOrAdmin, (0, validation_1.validateBody)(createServiceSchema), serviceController_1.serviceController.createService);
router.get("/active", auth_1.authenticateToken, serviceController_1.serviceController.getActiveServices);
router.get("/popular", auth_1.authenticateToken, (0, validation_1.validateQuery)(joi_1.default.object({
    limit: joi_1.default.number().integer().min(1).max(50).optional().default(10),
})), serviceController_1.serviceController.getPopularServices);
router.get("/categories", auth_1.authenticateToken, serviceController_1.serviceController.getServiceCategories);
router.get("/category/:category", auth_1.authenticateToken, (0, validation_1.validateParams)(joi_1.default.object({
    category: joi_1.default.string()
        .valid("haircut", "beard_trim", "hair_wash", "styling", "coloring", "treatment", "package")
        .required(),
})), serviceController_1.serviceController.getServicesByCategory);
router.get("/recommended", auth_1.authenticateToken, (0, validation_1.validateQuery)(joi_1.default.object({
    customerId: joi_1.default.string().optional(),
})), serviceController_1.serviceController.getRecommendedServices);
router.get("/export", auth_1.authenticateToken, auth_1.managerOrAdmin, (0, validation_1.validateQuery)(joi_1.default.object({
    format: joi_1.default.string().valid("csv", "excel").optional().default("csv"),
})), serviceController_1.serviceController.exportServices);
router.get("/stylist/:stylistId", auth_1.authenticateToken, validation_1.validateId, serviceController_1.serviceController.getServicesByStylist);
router.get("/:id", auth_1.authenticateToken, validation_1.validateId, serviceController_1.serviceController.getServiceById);
router.put("/:id", auth_1.authenticateToken, auth_1.managerOrAdmin, validation_1.validateId, (0, validation_1.validateBody)(updateServiceSchema), serviceController_1.serviceController.updateService);
router.delete("/:id", auth_1.authenticateToken, auth_1.adminOnly, validation_1.validateId, serviceController_1.serviceController.deleteService);
router.patch("/:id/status", auth_1.authenticateToken, auth_1.managerOrAdmin, validation_1.validateId, (0, validation_1.validateBody)(joi_1.default.object({
    isActive: joi_1.default.boolean().required().messages({
        "any.required": "Status is required",
    }),
})), serviceController_1.serviceController.updateServiceStatus);
router.post("/:id/toggle-popular", auth_1.authenticateToken, auth_1.managerOrAdmin, validation_1.validateId, serviceController_1.serviceController.toggleServicePopularity);
router.get("/:id/analytics", auth_1.authenticateToken, auth_1.managerOrAdmin, validation_1.validateId, (0, validation_1.validateQuery)(joi_1.default.object({
    dateFrom: joi_1.default.string().isoDate().optional(),
    dateTo: joi_1.default.string().isoDate().optional(),
})), serviceController_1.serviceController.getServiceAnalytics);
router.get("/:id/availability", auth_1.authenticateToken, validation_1.validateId, (0, validation_1.validateQuery)(joi_1.default.object({
    date: joi_1.default.string().isoDate().required().messages({
        "any.required": "Date is required",
        "string.isoDate": "Date must be in ISO format (YYYY-MM-DD)",
    }),
    time: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
        "any.required": "Time is required",
        "string.pattern.base": "Time must be in HH:mm format",
    }),
})), serviceController_1.serviceController.getServiceAvailability);
router.get("/:id/reviews", auth_1.authenticateToken, validation_1.validateId, (0, validation_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(50).optional().default(20),
})), serviceController_1.serviceController.getServiceReviews);
router.get("/:id/pricing-history", auth_1.authenticateToken, auth_1.managerOrAdmin, validation_1.validateId, serviceController_1.serviceController.getServicePricingHistory);
router.patch("/bulk-update", auth_1.authenticateToken, auth_1.managerOrAdmin, (0, validation_1.validateBody)(joi_1.default.object({
    serviceIds: joi_1.default.array()
        .items(joi_1.default.string())
        .min(1)
        .required()
        .messages({
        "array.min": "At least one service ID is required",
        "any.required": "Service IDs array is required",
    }),
    updates: joi_1.default.object({
        isActive: joi_1.default.boolean().optional(),
        isPopular: joi_1.default.boolean().optional(),
        category: joi_1.default.string()
            .valid("haircut", "beard_trim", "hair_wash", "styling", "coloring", "treatment", "package")
            .optional(),
        tags: joi_1.default.array().items(joi_1.default.string().max(50)).optional(),
    })
        .min(1)
        .required()
        .messages({
        "object.min": "At least one field to update is required",
        "any.required": "Update data is required",
    }),
})), serviceController_1.serviceController.bulkUpdateServices);
exports.default = router;
//# sourceMappingURL=services.js.map