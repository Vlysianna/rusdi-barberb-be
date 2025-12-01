"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stylistController_1 = require("../controllers/stylistController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const createStylistSchema = joi_1.default.object({
    userId: joi_1.default.string().required().messages({
        "any.required": "User ID is required",
        "string.empty": "User ID cannot be empty",
    }),
    specialties: joi_1.default.array().items(joi_1.default.string()).optional().default([]),
    experience: joi_1.default.number().integer().min(0).optional().default(0),
    commissionRate: joi_1.default.number().min(0).max(100).optional().default(15),
    isAvailable: joi_1.default.boolean().optional().default(true),
    schedule: joi_1.default.object({
        monday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        tuesday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        wednesday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        thursday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        friday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        saturday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        sunday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
    }).optional(),
    bio: joi_1.default.string().max(500).optional(),
});
const updateStylistSchema = joi_1.default.object({
    specialties: joi_1.default.array().items(joi_1.default.string()).optional(),
    experience: joi_1.default.number().integer().min(0).optional(),
    commissionRate: joi_1.default.number().min(0).max(100).optional(),
    isAvailable: joi_1.default.boolean().optional(),
    schedule: joi_1.default.object({
        monday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        tuesday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        wednesday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        thursday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        friday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        saturday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        sunday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
    }).optional(),
    bio: joi_1.default.string().max(500).optional(),
}).min(1);
const querySchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(100).optional().default(10),
    search: joi_1.default.string().min(1).max(100).optional(),
    isAvailable: joi_1.default.boolean().optional(),
    specialties: joi_1.default.alternatives()
        .try(joi_1.default.string(), joi_1.default.array().items(joi_1.default.string()))
        .optional(),
});
router.get("/", auth_1.authenticateToken, (0, validation_1.validateQuery)(querySchema), stylistController_1.stylistController.getAllStylists);
router.post("/", auth_1.authenticateToken, (0, auth_1.checkPermission)('stylists', 'create'), (0, validation_1.validateBody)(createStylistSchema), stylistController_1.stylistController.createStylist);
router.get("/available", auth_1.authenticateToken, (0, validation_1.validateQuery)(joi_1.default.object({
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
})), stylistController_1.stylistController.getAvailableStylists);
router.get("/specialties", auth_1.authenticateToken, stylistController_1.stylistController.getStylistSpecialties);
router.get("/:id", auth_1.authenticateToken, validation_1.validateId, stylistController_1.stylistController.getStylistById);
router.put("/:id", auth_1.authenticateToken, (0, auth_1.checkResourceOwnership)('stylist'), validation_1.validateId, (0, validation_1.validateBody)(updateStylistSchema), stylistController_1.stylistController.updateStylist);
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.checkPermission)('stylists', 'delete'), validation_1.validateId, stylistController_1.stylistController.deleteStylist);
router.patch("/:id/availability", auth_1.authenticateToken, (0, auth_1.checkResourceOwnership)('stylist'), validation_1.validateId, (0, validation_1.validateBody)(joi_1.default.object({
    isAvailable: joi_1.default.boolean().required().messages({
        "any.required": "Availability status is required",
    }),
})), stylistController_1.stylistController.updateAvailability);
router.patch("/:id/schedule", auth_1.authenticateToken, (0, auth_1.checkResourceOwnership)('stylist'), validation_1.validateId, (0, validation_1.validateBody)(joi_1.default.object({
    schedule: joi_1.default.object({
        monday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        tuesday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        wednesday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        thursday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        friday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        saturday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
        sunday: joi_1.default.object({
            isWorking: joi_1.default.boolean().required(),
            startTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
            endTime: joi_1.default.string()
                .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
                .required(),
        }).optional(),
    })
        .required()
        .messages({
        "any.required": "Schedule is required",
    }),
})), stylistController_1.stylistController.updateSchedule);
router.get("/:id/bookings", auth_1.authenticateToken, validation_1.validateId, (0, validation_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(100).optional().default(10),
    status: joi_1.default.string()
        .valid("pending", "confirmed", "in_progress", "completed", "cancelled", "no_show")
        .optional(),
    dateFrom: joi_1.default.string().isoDate().optional(),
    dateTo: joi_1.default.string().isoDate().optional(),
})), stylistController_1.stylistController.getStylistBookings);
router.get("/:id/performance", auth_1.authenticateToken, (0, auth_1.checkPermission)('reports', 'read'), validation_1.validateId, (0, validation_1.validateQuery)(joi_1.default.object({
    dateFrom: joi_1.default.string().isoDate().optional(),
    dateTo: joi_1.default.string().isoDate().optional(),
})), stylistController_1.stylistController.getStylistPerformance);
router.get("/:id/earnings", auth_1.authenticateToken, (0, auth_1.checkResourceOwnership)('stylist'), validation_1.validateId, (0, validation_1.validateQuery)(joi_1.default.object({
    dateFrom: joi_1.default.string().isoDate().optional(),
    dateTo: joi_1.default.string().isoDate().optional(),
})), stylistController_1.stylistController.getStylistEarnings);
router.get("/:id/reviews", auth_1.authenticateToken, validation_1.validateId, (0, validation_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(50).optional().default(20),
})), stylistController_1.stylistController.getStylistReviews);
router.post("/:id/services", auth_1.authenticateToken, (0, auth_1.checkPermission)('stylists', 'update'), validation_1.validateId, (0, validation_1.validateBody)(joi_1.default.object({
    serviceId: joi_1.default.string().required().messages({
        "any.required": "Service ID is required",
        "string.empty": "Service ID cannot be empty",
    }),
})), stylistController_1.stylistController.assignServiceToStylist);
router.delete("/:id/services/:serviceId", auth_1.authenticateToken, (0, auth_1.checkPermission)('stylists', 'update'), (0, validation_1.validateParams)(joi_1.default.object({
    id: joi_1.default.string().required(),
    serviceId: joi_1.default.string().required(),
})), stylistController_1.stylistController.removeServiceFromStylist);
router.get("/:id/schedules", auth_1.authenticateToken, validation_1.validateId, stylistController_1.stylistController.getStylistSchedules);
router.post("/:id/schedules", auth_1.authenticateToken, (0, auth_1.checkPermission)('stylists', 'update'), validation_1.validateId, (0, validation_1.validateBody)(joi_1.default.object({
    dayOfWeek: joi_1.default.string()
        .valid('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')
        .required()
        .messages({
        "any.required": "Day of week is required",
        "any.only": "Day of week must be a valid day name",
    }),
    startTime: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
        "any.required": "Start time is required",
        "string.pattern.base": "Start time must be in HH:mm format",
    }),
    endTime: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
        "any.required": "End time is required",
        "string.pattern.base": "End time must be in HH:mm format",
    }),
    isAvailable: joi_1.default.boolean().optional().default(true),
})), stylistController_1.stylistController.addStylistSchedule);
router.put("/:id/schedules/:scheduleId", auth_1.authenticateToken, (0, auth_1.checkPermission)('stylists', 'update'), (0, validation_1.validateParams)(joi_1.default.object({
    id: joi_1.default.string().required(),
    scheduleId: joi_1.default.string().required(),
})), (0, validation_1.validateBody)(joi_1.default.object({
    startTime: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
        "string.pattern.base": "Start time must be in HH:mm format",
    }),
    endTime: joi_1.default.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
        "string.pattern.base": "End time must be in HH:mm format",
    }),
    isAvailable: joi_1.default.boolean().optional(),
}).min(1)), stylistController_1.stylistController.updateStylistScheduleEntry);
router.delete("/:id/schedules/:scheduleId", auth_1.authenticateToken, (0, auth_1.checkPermission)('stylists', 'update'), (0, validation_1.validateParams)(joi_1.default.object({
    id: joi_1.default.string().required(),
    scheduleId: joi_1.default.string().required(),
})), stylistController_1.stylistController.deleteStylistScheduleEntry);
exports.default = router;
//# sourceMappingURL=stylists.js.map