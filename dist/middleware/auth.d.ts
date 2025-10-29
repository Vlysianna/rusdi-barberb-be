import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import { UserRole } from "../utils/types";
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (...roles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const adminOnly: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const managerOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const stylistOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authenticatedUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const resourceOwnerOrAdmin: (resourceUserIdField?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const customerResourceAccess: (customerIdField?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const stylistResourceAccess: (stylistIdField?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const bookingAccess: () => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const addUserToBody: (field?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireActiveAccount: () => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireEmailVerification: () => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const userRateLimit: (maxRequests?: number, windowMs?: number) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map