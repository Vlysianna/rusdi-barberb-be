import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ApiResponseUtil } from "../utils/response";

/**
 * Generic validation middleware factory
 */
export const validate = (
  schema: Joi.ObjectSchema,
  source: "body" | "params" | "query" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      ApiResponseUtil.validationError(res, errors);
      return;
    }

    // Replace the original data with validated and sanitized data
    // Handle Express 5 read-only properties
    if (source === "query") {
      // For query parameters, we need to handle Express 5's read-only req.query
      Object.defineProperty(req, "query", {
        value: value,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    } else {
      req[source] = value;
    }
    next();
  };
};

/**
 * Common validation schemas
 */

// User validation schemas
export const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        "any.required": "Password is required",
      }),
    fullName: Joi.string().min(2).max(100).required().messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),
    phone: Joi.string()
      .pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)
      .optional()
      .messages({
        "string.pattern.base": "Please provide a valid Indonesian phone number",
      }),
    role: Joi.string()
      .valid("admin", "stylist", "customer")
      .optional()
      .default("customer"),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
    }),
    phone: Joi.string()
      .pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)
      .optional()
      .messages({
        "string.pattern.base": "Please provide a valid Indonesian phone number",
      }),
    dateOfBirth: Joi.date().iso().max("now").optional().messages({
      "date.max": "Date of birth cannot be in the future",
    }),
    gender: Joi.string().valid("male", "female").optional(),
    address: Joi.string().max(500).optional().messages({
      "string.max": "Address cannot exceed 500 characters",
    }),
    preferences: Joi.string().max(1000).optional().messages({
      "string.max": "Preferences cannot exceed 1000 characters",
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      "any.required": "Current password is required",
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.min": "New password must be at least 8 characters long",
        "string.pattern.base":
          "New password must contain at least one uppercase letter, one lowercase letter, and one number",
        "any.required": "New password is required",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Password confirmation does not match",
        "any.required": "Password confirmation is required",
      }),
  }),
};

// Service validation schemas
export const serviceValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
      "string.min": "Service name must be at least 2 characters long",
      "string.max": "Service name cannot exceed 255 characters",
      "any.required": "Service name is required",
    }),
    description: Joi.string().min(10).max(1000).required().messages({
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description cannot exceed 1000 characters",
      "any.required": "Description is required",
    }),
    category: Joi.string()
      .valid(
        "haircut",
        "beard_trim",
        "hair_wash",
        "styling",
        "coloring",
        "treatment",
        "package",
      )
      .required()
      .messages({
        "any.only": "Please select a valid category",
        "any.required": "Category is required",
      }),
    price: Joi.number().positive().precision(2).required().messages({
      "number.positive": "Price must be a positive number",
      "any.required": "Price is required",
    }),
    duration: Joi.number().integer().min(15).max(480).required().messages({
      "number.integer": "Duration must be a whole number",
      "number.min": "Duration must be at least 15 minutes",
      "number.max": "Duration cannot exceed 8 hours (480 minutes)",
      "any.required": "Duration is required",
    }),
    image: Joi.string().uri().optional().messages({
      "string.uri": "Please provide a valid image URL",
    }),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(255).optional().messages({
      "string.min": "Service name must be at least 2 characters long",
      "string.max": "Service name cannot exceed 255 characters",
    }),
    description: Joi.string().min(10).max(1000).optional().messages({
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description cannot exceed 1000 characters",
    }),
    category: Joi.string()
      .valid(
        "haircut",
        "beard_trim",
        "hair_wash",
        "styling",
        "coloring",
        "treatment",
        "package",
      )
      .optional()
      .messages({
        "any.only": "Please select a valid category",
      }),
    price: Joi.number().positive().precision(2).optional().messages({
      "number.positive": "Price must be a positive number",
    }),
    duration: Joi.number().integer().min(15).max(480).optional().messages({
      "number.integer": "Duration must be a whole number",
      "number.min": "Duration must be at least 15 minutes",
      "number.max": "Duration cannot exceed 8 hours (480 minutes)",
    }),
    image: Joi.string().uri().optional().messages({
      "string.uri": "Please provide a valid image URL",
    }),
    isActive: Joi.boolean().optional(),
  }),
};

// Booking validation schemas
export const bookingValidation = {
  create: Joi.object({
    stylistId: Joi.string().required().messages({
      "any.required": "Stylist selection is required",
    }),
    serviceId: Joi.string().required().messages({
      "any.required": "Service selection is required",
    }),
    appointmentDate: Joi.date().iso().required().messages({
      "any.required": "Appointment date is required",
    }),
    appointmentTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
      .required()
      .messages({
        "string.pattern.base": "Please provide a valid time in HH:MM or HH:MM:SS format",
        "any.required": "Appointment time is required",
      }),
    notes: Joi.string().max(500).optional().allow('', null).messages({
      "string.max": "Notes cannot exceed 500 characters",
    }),
    addons: Joi.array().items(Joi.string()).optional(),
  }),

  update: Joi.object({
    appointmentDate: Joi.date().iso().optional().messages({
      "date.base": "Please provide a valid date",
    }),
    appointmentTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
      .optional()
      .messages({
        "string.pattern.base": "Please provide a valid time in HH:MM or HH:MM:SS format",
      }),
    status: Joi.string()
      .valid(
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      )
      .optional()
      .messages({
        "any.only": "Please provide a valid status",
      }),
    notes: Joi.string().max(500).optional().messages({
      "string.max": "Notes cannot exceed 500 characters",
    }),
  }),
};

// Review validation schemas
export const reviewValidation = {
  create: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
      "number.integer": "Rating must be a whole number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5",
      "any.required": "Rating is required",
    }),
    comment: Joi.string().min(10).max(1000).optional().messages({
      "string.min": "Comment must be at least 10 characters long",
      "string.max": "Comment cannot exceed 1000 characters",
    }),
    isAnonymous: Joi.boolean().optional().default(false),
  }),
};

// Stylist validation schemas
export const stylistValidation = {
  create: Joi.object({
    userId: Joi.string().required().messages({
      "any.required": "User ID is required",
    }),
    specialties: Joi.array()
      .items(Joi.string().min(2).max(100))
      .min(1)
      .required()
      .messages({
        "array.min": "At least one specialty is required",
        "any.required": "Specialties are required",
      }),
    experience: Joi.number().integer().min(0).max(50).required().messages({
      "number.integer": "Experience must be a whole number",
      "number.min": "Experience cannot be negative",
      "number.max": "Experience cannot exceed 50 years",
      "any.required": "Experience is required",
    }),
    bio: Joi.string().min(50).max(1000).optional().messages({
      "string.min": "Bio must be at least 50 characters long",
      "string.max": "Bio cannot exceed 1000 characters",
    }),
    portfolio: Joi.array()
      .items(Joi.string().uri())
      .max(10)
      .optional()
      .messages({
        "string.uri": "Portfolio items must be valid URLs",
        "array.max": "Portfolio cannot have more than 10 items",
      }),
  }),

  updateSchedule: Joi.object({
    dayOfWeek: Joi.number().integer().min(0).max(6).required().messages({
      "number.integer": "Day of week must be a whole number",
      "number.min": "Day of week must be between 0 (Sunday) and 6 (Saturday)",
      "number.max": "Day of week must be between 0 (Sunday) and 6 (Saturday)",
      "any.required": "Day of week is required",
    }),
    startTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.pattern.base":
          "Please provide a valid start time in HH:MM format",
        "any.required": "Start time is required",
      }),
    endTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        "string.pattern.base":
          "Please provide a valid end time in HH:MM format",
        "any.required": "End time is required",
      }),
    isAvailable: Joi.boolean().required().messages({
      "any.required": "Availability status is required",
    }),
  })
    .custom((value, helpers) => {
      const start = value.startTime.split(":").map(Number);
      const end = value.endTime.split(":").map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];

      if (startMinutes >= endMinutes) {
        return helpers.error("custom.timeRange");
      }

      return value;
    })
    .messages({
      "custom.timeRange": "End time must be after start time",
    }),
};

// Payment validation schemas
export const paymentValidation = {
  create: Joi.object({
    bookingId: Joi.string().required().messages({
      "any.required": "Booking ID is required",
    }),
    method: Joi.string()
      .valid(
        "cash",
        "credit_card",
        "debit_card",
        "digital_wallet",
        "bank_transfer",
      )
      .required()
      .messages({
        "any.only": "Please select a valid payment method",
        "any.required": "Payment method is required",
      }),
    amount: Joi.number().positive().precision(2).required().messages({
      "number.positive": "Amount must be a positive number",
      "any.required": "Amount is required",
    }),
  }),
};

// Common parameter validation schemas
export const paramValidation = {
  id: Joi.object({
    id: Joi.string().required().messages({
      "any.required": "ID parameter is required",
    }),
  }),
};

// Query parameter validation schemas
export const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1).messages({
      "number.integer": "Page must be a whole number",
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .messages({
        "number.integer": "Limit must be a whole number",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100",
      }),
    sortBy: Joi.string().optional().messages({
      "string.base": "Sort by must be a string",
    }),
    sortOrder: Joi.string()
      .valid("asc", "desc")
      .optional()
      .default("desc")
      .messages({
        "any.only": 'Sort order must be either "asc" or "desc"',
      }),
    search: Joi.string().min(1).max(100).optional().messages({
      "string.min": "Search term must be at least 1 character long",
      "string.max": "Search term cannot exceed 100 characters",
    }),
  }),

  dateRange: Joi.object({
    startDate: Joi.date().iso().optional().messages({
      "date.base": "Start date must be a valid date",
    }),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).optional().messages({
      "date.base": "End date must be a valid date",
      "date.min": "End date must be after start date",
    }),
  }),

  bookingFilter: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      )
      .optional()
      .messages({
        "any.only": "Please provide a valid booking status",
      }),
    stylistId: Joi.string().optional(),
    customerId: Joi.string().optional(),
    serviceId: Joi.string().optional(),
  }),
};

// Convenience validation middleware functions
export const validateBody = (schema: Joi.ObjectSchema) =>
  validate(schema, "body");
export const validateParams = (schema: Joi.ObjectSchema) =>
  validate(schema, "params");
export const validateQuery = (schema: Joi.ObjectSchema) =>
  validate(schema, "query");

// Pre-built validation middleware
export const validatePagination = validateQuery(queryValidation.pagination);
export const validateId = validateParams(paramValidation.id);
export const validateUserRegistration = validateBody(userValidation.register);
export const validateUserLogin = validateBody(userValidation.login);
export const validateServiceCreation = validateBody(serviceValidation.create);
export const validateBookingCreation = validateBody(bookingValidation.create);
export const validateReviewCreation = validateBody(reviewValidation.create);
