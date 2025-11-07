"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRateLimit = exports.requireEmailVerification = exports.requireActiveAccount = exports.addUserToBody = exports.bookingAccess = exports.stylistResourceAccess = exports.customerResourceAccess = exports.resourceOwnerOrAdmin = exports.authenticatedUser = exports.stylistOrAdmin = exports.managerOrAdmin = exports.adminOnly = exports.authorizeRoles = exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = __importDefault(require("../config/jwt"));
const response_1 = require("../utils/response");
const types_1 = require("../utils/types");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwt_1.default.extractTokenFromHeader(authHeader);
        if (!token) {
            response_1.ApiResponseUtil.unauthorized(res, "Access token required");
            return;
        }
        const decoded = jwt_1.default.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "Token expired") {
                response_1.ApiResponseUtil.unauthorized(res, "Token has expired");
                return;
            }
            if (error.message === "Invalid token") {
                response_1.ApiResponseUtil.unauthorized(res, "Invalid access token");
                return;
            }
        }
        response_1.ApiResponseUtil.unauthorized(res, "Authentication failed");
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwt_1.default.extractTokenFromHeader(authHeader);
        if (token) {
            const decoded = jwt_1.default.verifyToken(token);
            req.user = decoded;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            response_1.ApiResponseUtil.unauthorized(res, "Authentication required");
            return;
        }
        const allowedRoles = roles.map((role) => role.toLowerCase());
        if (!allowedRoles.includes(req.user.role)) {
            response_1.ApiResponseUtil.forbidden(res, "Insufficient permissions");
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
exports.adminOnly = (0, exports.authorizeRoles)(types_1.UserRole.ADMIN);
exports.managerOrAdmin = (0, exports.authorizeRoles)(types_1.UserRole.MANAGER, types_1.UserRole.ADMIN);
exports.stylistOrAdmin = (0, exports.authorizeRoles)(types_1.UserRole.STYLIST, types_1.UserRole.MANAGER, types_1.UserRole.ADMIN);
exports.authenticatedUser = (0, exports.authorizeRoles)(types_1.UserRole.CUSTOMER, types_1.UserRole.STYLIST, types_1.UserRole.MANAGER, types_1.UserRole.ADMIN);
const resourceOwnerOrAdmin = (resourceUserIdField = "userId") => {
    return (req, res, next) => {
        if (!req.user) {
            response_1.ApiResponseUtil.unauthorized(res, "Authentication required");
            return;
        }
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        if (req.user.role === "admin" || req.user.role === "manager") {
            next();
            return;
        }
        if (req.user.userId === resourceUserId) {
            next();
            return;
        }
        response_1.ApiResponseUtil.forbidden(res, "You can only access your own resources");
    };
};
exports.resourceOwnerOrAdmin = resourceOwnerOrAdmin;
const customerResourceAccess = (customerIdField = "customerId") => {
    return (req, res, next) => {
        if (!req.user) {
            response_1.ApiResponseUtil.unauthorized(res, "Authentication required");
            return;
        }
        if (req.user.role === "admin" ||
            req.user.role === "manager" ||
            req.user.role === "stylist") {
            next();
            return;
        }
        const customerId = req.params[customerIdField] || req.body[customerIdField];
        if (req.user.role === "customer" && req.user.userId === customerId) {
            next();
            return;
        }
        response_1.ApiResponseUtil.forbidden(res, "You can only access your own resources");
    };
};
exports.customerResourceAccess = customerResourceAccess;
const stylistResourceAccess = (stylistIdField = "stylistId") => {
    return (req, res, next) => {
        if (!req.user) {
            response_1.ApiResponseUtil.unauthorized(res, "Authentication required");
            return;
        }
        if (req.user.role === "admin" || req.user.role === "manager") {
            next();
            return;
        }
        if (req.user.role === "stylist") {
            next();
            return;
        }
        response_1.ApiResponseUtil.forbidden(res, "You can only access your own stylist resources");
    };
};
exports.stylistResourceAccess = stylistResourceAccess;
const bookingAccess = () => {
    return (req, res, next) => {
        if (!req.user) {
            response_1.ApiResponseUtil.unauthorized(res, "Authentication required");
            return;
        }
        if (req.user.role === "admin" || req.user.role === "manager") {
            next();
            return;
        }
        if (req.user.role === "customer" || req.user.role === "stylist") {
            next();
            return;
        }
        response_1.ApiResponseUtil.forbidden(res, "Insufficient permissions");
    };
};
exports.bookingAccess = bookingAccess;
const addUserToBody = (field = "userId") => {
    return (req, res, next) => {
        if (req.user) {
            req.body[field] = req.user.userId;
        }
        next();
    };
};
exports.addUserToBody = addUserToBody;
const requireActiveAccount = () => {
    return (req, res, next) => {
        if (!req.user) {
            response_1.ApiResponseUtil.unauthorized(res, "Authentication required");
            return;
        }
        next();
    };
};
exports.requireActiveAccount = requireActiveAccount;
const requireEmailVerification = () => {
    return (req, res, next) => {
        if (!req.user) {
            response_1.ApiResponseUtil.unauthorized(res, "Authentication required");
            return;
        }
        next();
    };
};
exports.requireEmailVerification = requireEmailVerification;
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const userRequests = new Map();
    return (req, res, next) => {
        if (!req.user) {
            next();
            return;
        }
        const userId = req.user.userId;
        const now = Date.now();
        const userLimit = userRequests.get(userId);
        if (!userLimit || now > userLimit.resetTime) {
            userRequests.set(userId, {
                count: 1,
                resetTime: now + windowMs,
            });
            next();
            return;
        }
        if (userLimit.count >= maxRequests) {
            response_1.ApiResponseUtil.tooManyRequests(res, "Rate limit exceeded. Please try again later.");
            return;
        }
        userLimit.count++;
        next();
    };
};
exports.userRateLimit = userRateLimit;
//# sourceMappingURL=auth.js.map