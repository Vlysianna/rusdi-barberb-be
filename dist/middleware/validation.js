"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReviewCreation = exports.validateBookingCreation = exports.validateServiceCreation = exports.validateUserLogin = exports.validateUserRegistration = exports.validateId = exports.validatePagination = exports.validateQuery = exports.validateParams = exports.validateBody = exports.queryValidation = exports.paramValidation = exports.paymentValidation = exports.stylistValidation = exports.reviewValidation = exports.bookingValidation = exports.serviceValidation = exports.userValidation = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const response_1 = require("../utils/response");
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: false
        });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            response_1.ApiResponseUtil.validationError(res, errors);
            return;
        }
        req[source] = value;
        next();
    };
};
exports.validate = validate;
exports.userValidation = {
    register: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        }),
        fullName: joi_1.default.string().min(2).max(100).required().messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 100 characters',
            'any.required': 'Full name is required'
        }),
        phone: joi_1.default.string().pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/).optional().messages({
            'string.pattern.base': 'Please provide a valid Indonesian phone number'
        }),
        role: joi_1.default.string().valid('admin', 'stylist', 'customer').optional().default('customer')
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: joi_1.default.string().required().messages({
            'any.required': 'Password is required'
        })
    }),
    updateProfile: joi_1.default.object({
        fullName: joi_1.default.string().min(2).max(100).optional().messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 100 characters'
        }),
        phone: joi_1.default.string().pattern(/^(\+62|62|0)8[1-9][0-9]{6,9}$/).optional().messages({
            'string.pattern.base': 'Please provide a valid Indonesian phone number'
        }),
        dateOfBirth: joi_1.default.date().iso().max('now').optional().messages({
            'date.max': 'Date of birth cannot be in the future'
        }),
        gender: joi_1.default.string().valid('male', 'female').optional(),
        address: joi_1.default.string().max(500).optional().messages({
            'string.max': 'Address cannot exceed 500 characters'
        }),
        preferences: joi_1.default.string().max(1000).optional().messages({
            'string.max': 'Preferences cannot exceed 1000 characters'
        })
    }),
    changePassword: joi_1.default.object({
        currentPassword: joi_1.default.string().required().messages({
            'any.required': 'Current password is required'
        }),
        newPassword: joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
            'string.min': 'New password must be at least 8 characters long',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'New password is required'
        }),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref('newPassword')).required().messages({
            'any.only': 'Password confirmation does not match',
            'any.required': 'Password confirmation is required'
        })
    })
};
exports.serviceValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).required().messages({
            'string.min': 'Service name must be at least 2 characters long',
            'string.max': 'Service name cannot exceed 255 characters',
            'any.required': 'Service name is required'
        }),
        description: joi_1.default.string().min(10).max(1000).required().messages({
            'string.min': 'Description must be at least 10 characters long',
            'string.max': 'Description cannot exceed 1000 characters',
            'any.required': 'Description is required'
        }),
        category: joi_1.default.string().valid('haircut', 'beard_trim', 'hair_wash', 'styling', 'coloring', 'treatment', 'package').required().messages({
            'any.only': 'Please select a valid category',
            'any.required': 'Category is required'
        }),
        price: joi_1.default.number().positive().precision(2).required().messages({
            'number.positive': 'Price must be a positive number',
            'any.required': 'Price is required'
        }),
        duration: joi_1.default.number().integer().min(15).max(480).required().messages({
            'number.integer': 'Duration must be a whole number',
            'number.min': 'Duration must be at least 15 minutes',
            'number.max': 'Duration cannot exceed 8 hours (480 minutes)',
            'any.required': 'Duration is required'
        }),
        image: joi_1.default.string().uri().optional().messages({
            'string.uri': 'Please provide a valid image URL'
        })
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(255).optional().messages({
            'string.min': 'Service name must be at least 2 characters long',
            'string.max': 'Service name cannot exceed 255 characters'
        }),
        description: joi_1.default.string().min(10).max(1000).optional().messages({
            'string.min': 'Description must be at least 10 characters long',
            'string.max': 'Description cannot exceed 1000 characters'
        }),
        category: joi_1.default.string().valid('haircut', 'beard_trim', 'hair_wash', 'styling', 'coloring', 'treatment', 'package').optional().messages({
            'any.only': 'Please select a valid category'
        }),
        price: joi_1.default.number().positive().precision(2).optional().messages({
            'number.positive': 'Price must be a positive number'
        }),
        duration: joi_1.default.number().integer().min(15).max(480).optional().messages({
            'number.integer': 'Duration must be a whole number',
            'number.min': 'Duration must be at least 15 minutes',
            'number.max': 'Duration cannot exceed 8 hours (480 minutes)'
        }),
        image: joi_1.default.string().uri().optional().messages({
            'string.uri': 'Please provide a valid image URL'
        }),
        isActive: joi_1.default.boolean().optional()
    })
};
exports.bookingValidation = {
    create: joi_1.default.object({
        stylistId: joi_1.default.string().required().messages({
            'any.required': 'Stylist selection is required'
        }),
        serviceId: joi_1.default.string().required().messages({
            'any.required': 'Service selection is required'
        }),
        appointmentDate: joi_1.default.date().iso().min('now').required().messages({
            'date.min': 'Appointment date cannot be in the past',
            'any.required': 'Appointment date is required'
        }),
        appointmentTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
            'string.pattern.base': 'Please provide a valid time in HH:MM format',
            'any.required': 'Appointment time is required'
        }),
        notes: joi_1.default.string().max(500).optional().messages({
            'string.max': 'Notes cannot exceed 500 characters'
        })
    }),
    update: joi_1.default.object({
        appointmentDate: joi_1.default.date().iso().min('now').optional().messages({
            'date.min': 'Appointment date cannot be in the past'
        }),
        appointmentTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
            'string.pattern.base': 'Please provide a valid time in HH:MM format'
        }),
        status: joi_1.default.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show').optional().messages({
            'any.only': 'Please provide a valid status'
        }),
        notes: joi_1.default.string().max(500).optional().messages({
            'string.max': 'Notes cannot exceed 500 characters'
        })
    })
};
exports.reviewValidation = {
    create: joi_1.default.object({
        rating: joi_1.default.number().integer().min(1).max(5).required().messages({
            'number.integer': 'Rating must be a whole number',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
            'any.required': 'Rating is required'
        }),
        comment: joi_1.default.string().min(10).max(1000).optional().messages({
            'string.min': 'Comment must be at least 10 characters long',
            'string.max': 'Comment cannot exceed 1000 characters'
        }),
        isAnonymous: joi_1.default.boolean().optional().default(false)
    })
};
exports.stylistValidation = {
    create: joi_1.default.object({
        userId: joi_1.default.string().required().messages({
            'any.required': 'User ID is required'
        }),
        specialties: joi_1.default.array().items(joi_1.default.string().min(2).max(100)).min(1).required().messages({
            'array.min': 'At least one specialty is required',
            'any.required': 'Specialties are required'
        }),
        experience: joi_1.default.number().integer().min(0).max(50).required().messages({
            'number.integer': 'Experience must be a whole number',
            'number.min': 'Experience cannot be negative',
            'number.max': 'Experience cannot exceed 50 years',
            'any.required': 'Experience is required'
        }),
        bio: joi_1.default.string().min(50).max(1000).optional().messages({
            'string.min': 'Bio must be at least 50 characters long',
            'string.max': 'Bio cannot exceed 1000 characters'
        }),
        portfolio: joi_1.default.array().items(joi_1.default.string().uri()).max(10).optional().messages({
            'string.uri': 'Portfolio items must be valid URLs',
            'array.max': 'Portfolio cannot have more than 10 items'
        })
    }),
    updateSchedule: joi_1.default.object({
        dayOfWeek: joi_1.default.number().integer().min(0).max(6).required().messages({
            'number.integer': 'Day of week must be a whole number',
            'number.min': 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
            'number.max': 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
            'any.required': 'Day of week is required'
        }),
        startTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
            'string.pattern.base': 'Please provide a valid start time in HH:MM format',
            'any.required': 'Start time is required'
        }),
        endTime: joi_1.default.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
            'string.pattern.base': 'Please provide a valid end time in HH:MM format',
            'any.required': 'End time is required'
        }),
        isAvailable: joi_1.default.boolean().required().messages({
            'any.required': 'Availability status is required'
        })
    }).custom((value, helpers) => {
        const start = value.startTime.split(':').map(Number);
        const end = value.endTime.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        if (startMinutes >= endMinutes) {
            return helpers.error('custom.timeRange');
        }
        return value;
    }).messages({
        'custom.timeRange': 'End time must be after start time'
    })
};
exports.paymentValidation = {
    create: joi_1.default.object({
        bookingId: joi_1.default.string().required().messages({
            'any.required': 'Booking ID is required'
        }),
        method: joi_1.default.string().valid('cash', 'credit_card', 'debit_card', 'digital_wallet', 'bank_transfer').required().messages({
            'any.only': 'Please select a valid payment method',
            'any.required': 'Payment method is required'
        }),
        amount: joi_1.default.number().positive().precision(2).required().messages({
            'number.positive': 'Amount must be a positive number',
            'any.required': 'Amount is required'
        })
    })
};
exports.paramValidation = {
    id: joi_1.default.object({
        id: joi_1.default.string().required().messages({
            'any.required': 'ID parameter is required'
        })
    })
};
exports.queryValidation = {
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).optional().default(1).messages({
            'number.integer': 'Page must be a whole number',
            'number.min': 'Page must be at least 1'
        }),
        limit: joi_1.default.number().integer().min(1).max(100).optional().default(10).messages({
            'number.integer': 'Limit must be a whole number',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),
        sortBy: joi_1.default.string().optional().messages({
            'string.base': 'Sort by must be a string'
        }),
        sortOrder: joi_1.default.string().valid('asc', 'desc').optional().default('desc').messages({
            'any.only': 'Sort order must be either "asc" or "desc"'
        }),
        search: joi_1.default.string().min(1).max(100).optional().messages({
            'string.min': 'Search term must be at least 1 character long',
            'string.max': 'Search term cannot exceed 100 characters'
        })
    }),
    dateRange: joi_1.default.object({
        startDate: joi_1.default.date().iso().optional().messages({
            'date.base': 'Start date must be a valid date'
        }),
        endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')).optional().messages({
            'date.base': 'End date must be a valid date',
            'date.min': 'End date must be after start date'
        })
    }),
    bookingFilter: joi_1.default.object({
        status: joi_1.default.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show').optional().messages({
            'any.only': 'Please provide a valid booking status'
        }),
        stylistId: joi_1.default.string().optional(),
        customerId: joi_1.default.string().optional(),
        serviceId: joi_1.default.string().optional()
    })
};
const validateBody = (schema) => (0, exports.validate)(schema, 'body');
exports.validateBody = validateBody;
const validateParams = (schema) => (0, exports.validate)(schema, 'params');
exports.validateParams = validateParams;
const validateQuery = (schema) => (0, exports.validate)(schema, 'query');
exports.validateQuery = validateQuery;
exports.validatePagination = (0, exports.validateQuery)(exports.queryValidation.pagination);
exports.validateId = (0, exports.validateParams)(exports.paramValidation.id);
exports.validateUserRegistration = (0, exports.validateBody)(exports.userValidation.register);
exports.validateUserLogin = (0, exports.validateBody)(exports.userValidation.login);
exports.validateServiceCreation = (0, exports.validateBody)(exports.serviceValidation.create);
exports.validateBookingCreation = (0, exports.validateBody)(exports.bookingValidation.create);
exports.validateReviewCreation = (0, exports.validateBody)(exports.reviewValidation.create);
//# sourceMappingURL=validation.js.map