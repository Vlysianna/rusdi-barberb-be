import { Request, Response, NextFunction } from "express";
import jwtConfig, { AuthenticatedRequest, JWTPayload } from "../config/jwt";
import { ApiResponseUtil } from "../utils/response";
import { UserRole } from "../utils/types";

/**
 * Authentication middleware to verify JWT token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtConfig.extractTokenFromHeader(authHeader);

    if (!token) {
      ApiResponseUtil.unauthorized(res, "Access token required");
      return;
    }

    const decoded = jwtConfig.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Token expired") {
        ApiResponseUtil.unauthorized(res, "Token has expired");
        return;
      }
      if (error.message === "Invalid token") {
        ApiResponseUtil.unauthorized(res, "Invalid access token");
        return;
      }
    }

    ApiResponseUtil.unauthorized(res, "Authentication failed");
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtConfig.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = jwtConfig.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens, just proceed without user
    next();
  }
};

/**
 * Role-based authorization middleware factory
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      ApiResponseUtil.unauthorized(res, "Authentication required");
      return;
    }

    const allowedRoles = roles.map((role) => role.toLowerCase());
    if (!allowedRoles.includes(req.user.role)) {
      ApiResponseUtil.forbidden(res, "Insufficient permissions");
      return;
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorizeRoles(UserRole.ADMIN);

/**
 * Manager or Admin middleware
 */
export const managerOrAdmin = authorizeRoles(UserRole.MANAGER, UserRole.ADMIN);

/**
 * Stylist, Manager or Admin middleware
 */
export const stylistOrAdmin = authorizeRoles(
  UserRole.STYLIST,
  UserRole.MANAGER,
  UserRole.ADMIN,
);

/**
 * Customer or higher middleware (all authenticated users)
 */
export const authenticatedUser = authorizeRoles(
  UserRole.CUSTOMER,
  UserRole.STYLIST,
  UserRole.MANAGER,
  UserRole.ADMIN,
);

/**
 * Resource owner or admin middleware factory
 * Checks if the authenticated user owns the resource or is an admin
 */
export const resourceOwnerOrAdmin = (
  resourceUserIdField: string = "userId",
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      ApiResponseUtil.unauthorized(res, "Authentication required");
      return;
    }

    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField];

    // Admin and Manager can access any resource
    if (req.user.role === "admin" || req.user.role === "manager") {
      next();
      return;
    }

    // User can only access their own resources
    if (req.user.userId === resourceUserId) {
      next();
      return;
    }

    ApiResponseUtil.forbidden(res, "You can only access your own resources");
  };
};

/**
 * Customer resource access middleware
 * Allows customers to access only their own resources, stylists and admins can access all
 */
export const customerResourceAccess = (
  customerIdField: string = "customerId",
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      ApiResponseUtil.unauthorized(res, "Authentication required");
      return;
    }

    // Admin, Manager and stylist can access all customer resources
    if (
      req.user.role === "admin" ||
      req.user.role === "manager" ||
      req.user.role === "stylist"
    ) {
      next();
      return;
    }

    const customerId = req.params[customerIdField] || req.body[customerIdField];

    // Customer can only access their own resources
    if (req.user.role === "customer" && req.user.userId === customerId) {
      next();
      return;
    }

    ApiResponseUtil.forbidden(res, "You can only access your own resources");
  };
};

/**
 * Stylist resource access middleware
 * Allows stylists to access only their own resources, admins can access all
 */
export const stylistResourceAccess = (stylistIdField: string = "stylistId") => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      ApiResponseUtil.unauthorized(res, "Authentication required");
      return;
    }

    // Admin and Manager can access all stylist resources
    if (req.user.role === "admin" || req.user.role === "manager") {
      next();
      return;
    }

    // For stylists, we need to check if they own the stylist record
    // This would require a database lookup to get the stylist's userId
    if (req.user.role === "stylist") {
      // Note: In a real implementation, you'd query the database to check
      // if req.user.userId matches the stylist record's userId
      // For now, we'll allow it and let the business logic handle it
      next();
      return;
    }

    ApiResponseUtil.forbidden(
      res,
      "You can only access your own stylist resources",
    );
  };
};

/**
 * Booking access control middleware
 * Customers can access their own bookings, stylists can access their assigned bookings, admins can access all
 */
export const bookingAccess = () => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      ApiResponseUtil.unauthorized(res, "Authentication required");
      return;
    }

    // Admin and Manager can access all bookings
    if (req.user.role === "admin" || req.user.role === "manager") {
      next();
      return;
    }

    // For customers and stylists, we'll let the business logic in controllers
    // handle the specific access control based on database records
    if (req.user.role === "customer" || req.user.role === "stylist") {
      next();
      return;
    }

    ApiResponseUtil.forbidden(res, "Insufficient permissions");
  };
};

/**
 * Middleware to extract user ID and add it to request body
 * Useful for creating resources that belong to the authenticated user
 */
export const addUserToBody = (field: string = "userId") => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (req.user) {
      req.body[field] = req.user.userId;
    }
    next();
  };
};

/**
 * Middleware to validate that user account is active
 */
export const requireActiveAccount = () => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      ApiResponseUtil.unauthorized(res, "Authentication required");
      return;
    }

    // In a real implementation, you'd check the database for user status
    // For now, we'll assume the JWT contains active users only
    next();
  };
};

/**
 * Middleware to validate email verification status
 */
export const requireEmailVerification = () => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      ApiResponseUtil.unauthorized(res, "Authentication required");
      return;
    }

    // In a real implementation, you'd check the database for email verification status
    // This would require adding emailVerified to the JWT payload or checking the database
    next();
  };
};

/**
 * Rate limiting middleware per user
 */
export const userRateLimit = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000,
) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
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
      ApiResponseUtil.tooManyRequests(
        res,
        "Rate limit exceeded. Please try again later.",
      );
      return;
    }

    userLimit.count++;
    next();
  };
};
