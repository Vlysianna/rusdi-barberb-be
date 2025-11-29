import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";

// Permission definitions per role
export const PERMISSIONS = {
  admin: {
    users: ["create", "read", "update", "delete"],
    services: ["create", "read", "update", "delete"],
    stylists: ["create", "read", "update", "delete"],
    bookings: ["create", "read", "update", "delete"],
    payments: ["create", "read", "update", "delete", "refund"],
    reviews: ["create", "read", "update", "delete"],
    settings: ["read", "update"],
    reports: ["read"],
    dashboard: ["all"],
  },
  manager: {
    users: ["read"],
    services: ["read"],
    stylists: ["read", "update"],
    bookings: ["read", "update", "create"],
    payments: ["read"],
    reviews: ["read", "update"],
    settings: [],
    reports: ["read"],
    dashboard: ["branch"],
  },
  stylist: {
    users: [],
    services: ["read"],
    stylists: ["read"],
    bookings: ["read", "update"],
    payments: ["read"],
    reviews: ["read"],
    settings: [],
    reports: [],
    dashboard: ["personal"],
  },
  customer: {
    users: [],
    services: ["read"],
    stylists: ["read"],
    bookings: ["create", "read", "update"],
    payments: ["create", "read"],
    reviews: ["create", "read", "update"],
    settings: [],
    reports: [],
    dashboard: ["personal"],
  },
};

// Resource ownership check helpers
export const isResourceOwner = (
  user: any,
  resourceOwnerId: string,
): boolean => {
  return user.id === resourceOwnerId;
};

export const isStylistOwner = (user: any, stylistId: string): boolean => {
  return user.role === "stylist" && user.stylistId === stylistId;
};

/**
 * Check if user has permission for specific action on resource
 */
export const hasPermission = (
  role: string,
  resource: string,
  action: string,
): boolean => {
  const rolePermissions =
    PERMISSIONS[role as keyof typeof PERMISSIONS] || PERMISSIONS.customer;
  const resourcePermissions = rolePermissions[
    resource as keyof typeof rolePermissions
  ] as string[] | undefined;

  return resourcePermissions ? resourcePermissions.includes(action) : false;
};

/**
 * Middleware: Check permission for action on resource
 */
export const checkPermission = (resource: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { role } = req.user;

    if (!hasPermission(role, resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role} role does not have permission to ${action} ${resource}`,
      });
    }

    next();
  };
};

/**
 * Middleware: Check if user can access specific resource (ownership)
 */
export const checkResourceOwnership = (
  resourceType: "booking" | "payment" | "review" | "profile" | "user" | "stylist" | "customer",
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { role, userId } = req.user;

    // Admin and Manager can access all resources
    if (role === "admin" || role === "manager") {
      return next();
    }

    // For other roles, check ownership
    const resourceId = req.params.id;

    try {
      // Resource ownership validation would be done in the controller
      // This middleware just sets a flag
      req.checkOwnership = true;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own resources.",
      });
    }
  };
};

/**
 * Middleware: Restrict to specific roles only
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action is restricted to: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Helper: Filter query based on role
 */
export const applyRoleFilter = (req: AuthenticatedRequest, baseQuery: any) => {
  const { role, userId, stylistId } = req.user!;

  switch (role) {
    case "admin":
      // Admin can see everything
      return baseQuery;

    case "manager":
      // Manager can see their branch data
      // You would add branch filter here
      return baseQuery;

    case "stylist":
      // Stylist can only see their own data
      return {
        ...baseQuery,
        stylistId: stylistId,
      };

    case "customer":
      // Customer can only see their own data
      return {
        ...baseQuery,
        customerId: userId,
      };

    default:
      return baseQuery;
  }
};

/**
 * Middleware: Check dashboard access based on role
 * Dashboard types: 'admin', 'manager', 'stylist'
 * - admin dashboard: Only admin
 * - manager dashboard: Admin and Manager
 * - stylist dashboard: Admin, Manager, and Stylist
 */
export const checkDashboardAccess = (dashboardType: 'admin' | 'manager' | 'stylist') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { role } = req.user;

    // Define access levels
    const accessLevels = {
      admin: ['admin'],
      manager: ['admin', 'manager'],
      stylist: ['admin', 'manager', 'stylist'],
    };

    const allowedRoles = accessLevels[dashboardType];

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role} role does not have access to ${dashboardType} dashboard`,
      });
    }

    next();
  };
};
