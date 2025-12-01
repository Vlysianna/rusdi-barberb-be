import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
export declare const PERMISSIONS: {
    admin: {
        users: string[];
        services: string[];
        stylists: string[];
        bookings: string[];
        payments: string[];
        reviews: string[];
        settings: string[];
        reports: string[];
        dashboard: string[];
    };
    manager: {
        users: string[];
        services: string[];
        stylists: string[];
        bookings: string[];
        payments: string[];
        reviews: string[];
        settings: any[];
        reports: string[];
        dashboard: string[];
    };
    stylist: {
        users: any[];
        services: string[];
        stylists: string[];
        bookings: string[];
        payments: string[];
        reviews: string[];
        settings: any[];
        reports: any[];
        dashboard: string[];
    };
    customer: {
        users: any[];
        services: string[];
        stylists: string[];
        bookings: string[];
        payments: string[];
        reviews: string[];
        settings: any[];
        reports: any[];
        dashboard: string[];
    };
};
export declare const isResourceOwner: (user: any, resourceOwnerId: string) => boolean;
export declare const isStylistOwner: (user: any, stylistId: string) => boolean;
export declare const hasPermission: (role: string, resource: string, action: string) => boolean;
export declare const checkPermission: (resource: string, action: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const checkResourceOwnership: (resourceType: "booking" | "payment" | "review" | "profile" | "user" | "stylist" | "customer") => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const restrictTo: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const applyRoleFilter: (req: AuthenticatedRequest, baseQuery: any) => any;
export declare const checkDashboardAccess: (dashboardType: "admin" | "manager" | "stylist") => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=rbac.d.ts.map