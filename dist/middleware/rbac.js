"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDashboardAccess = exports.applyRoleFilter = exports.restrictTo = exports.checkResourceOwnership = exports.checkPermission = exports.hasPermission = exports.isStylistOwner = exports.isResourceOwner = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = {
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
const isResourceOwner = (user, resourceOwnerId) => {
    return user.id === resourceOwnerId;
};
exports.isResourceOwner = isResourceOwner;
const isStylistOwner = (user, stylistId) => {
    return user.role === "stylist" && user.stylistId === stylistId;
};
exports.isStylistOwner = isStylistOwner;
const hasPermission = (role, resource, action) => {
    const rolePermissions = exports.PERMISSIONS[role] || exports.PERMISSIONS.customer;
    const resourcePermissions = rolePermissions[resource];
    return resourcePermissions ? resourcePermissions.includes(action) : false;
};
exports.hasPermission = hasPermission;
const checkPermission = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { role } = req.user;
        if (!(0, exports.hasPermission)(role, resource, action)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${role} role does not have permission to ${action} ${resource}`,
            });
        }
        next();
    };
};
exports.checkPermission = checkPermission;
const checkResourceOwnership = (resourceType) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { role, userId } = req.user;
        if (role === "admin" || role === "manager") {
            return next();
        }
        const resourceId = req.params.id;
        try {
            req.checkOwnership = true;
            next();
        }
        catch (error) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only access your own resources.",
            });
        }
    };
};
exports.checkResourceOwnership = checkResourceOwnership;
const restrictTo = (...roles) => {
    return (req, res, next) => {
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
exports.restrictTo = restrictTo;
const applyRoleFilter = (req, baseQuery) => {
    const { role, userId, stylistId } = req.user;
    switch (role) {
        case "admin":
            return baseQuery;
        case "manager":
            return baseQuery;
        case "stylist":
            return {
                ...baseQuery,
                stylistId: stylistId,
            };
        case "customer":
            return {
                ...baseQuery,
                customerId: userId,
            };
        default:
            return baseQuery;
    }
};
exports.applyRoleFilter = applyRoleFilter;
const checkDashboardAccess = (dashboardType) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { role } = req.user;
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
exports.checkDashboardAccess = checkDashboardAccess;
//# sourceMappingURL=rbac.js.map