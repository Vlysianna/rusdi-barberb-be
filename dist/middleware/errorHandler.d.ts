import { Request, Response, NextFunction } from 'express';
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: string[];
    constructor(message: string, statusCode?: number, isOperational?: boolean, errors?: string[]);
}
export declare class ValidationError extends ApiError {
    constructor(message?: string, errors?: string[]);
}
export declare class AuthenticationError extends ApiError {
    constructor(message?: string);
}
export declare class AuthorizationError extends ApiError {
    constructor(message?: string);
}
export declare class NotFoundError extends ApiError {
    constructor(message?: string);
}
export declare class ConflictError extends ApiError {
    constructor(message?: string);
}
export declare class BadRequestError extends ApiError {
    constructor(message?: string, errors?: string[]);
}
export declare class RateLimitError extends ApiError {
    constructor(message?: string);
}
export declare class DatabaseError extends ApiError {
    constructor(message?: string);
}
export declare class ExternalServiceError extends ApiError {
    constructor(message?: string);
}
export declare const errorHandler: (error: Error | ApiError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createValidationError: (message: string, errors: string[]) => ValidationError;
export declare const createAuthenticationError: (message?: string) => AuthenticationError;
export declare const createAuthorizationError: (message?: string) => AuthorizationError;
export declare const createNotFoundError: (message?: string) => NotFoundError;
export declare const createConflictError: (message?: string) => ConflictError;
export declare const createBadRequestError: (message?: string, errors?: string[]) => BadRequestError;
export declare const createDatabaseError: (message?: string) => DatabaseError;
export declare const createExternalServiceError: (message?: string) => ExternalServiceError;
export declare const logError: (error: Error, context?: Record<string, any>) => void;
export declare const gracefulShutdown: (server: any) => void;
//# sourceMappingURL=errorHandler.d.ts.map