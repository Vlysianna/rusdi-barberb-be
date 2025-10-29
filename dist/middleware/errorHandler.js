"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = exports.logError = exports.createExternalServiceError = exports.createDatabaseError = exports.createBadRequestError = exports.createConflictError = exports.createNotFoundError = exports.createAuthorizationError = exports.createAuthenticationError = exports.createValidationError = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.ExternalServiceError = exports.DatabaseError = exports.RateLimitError = exports.BadRequestError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApiError = void 0;
const response_1 = require("../utils/response");
class ApiError extends Error {
    constructor(message, statusCode = 500, isOperational = true, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
class ValidationError extends ApiError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 422, true, errors);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends ApiError {
    constructor(message = 'Authentication failed') {
        super(message, 401, true);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ApiError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, true);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404, true);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ApiError {
    constructor(message = 'Resource conflict') {
        super(message, 409, true);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends ApiError {
    constructor(message = 'Bad request', errors) {
        super(message, 400, true, errors);
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
class RateLimitError extends ApiError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429, true);
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class DatabaseError extends ApiError {
    constructor(message = 'Database operation failed') {
        super(message, 500, true);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class ExternalServiceError extends ApiError {
    constructor(message = 'External service error') {
        super(message, 502, true);
        this.name = 'ExternalServiceError';
    }
}
exports.ExternalServiceError = ExternalServiceError;
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let errors;
    console.error('Error occurred:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    if (error instanceof ApiError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors;
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (error.name === 'ValidationError') {
        statusCode = 422;
        message = 'Validation failed';
        if ('details' in error && Array.isArray(error.details)) {
            errors = error.details.map((detail) => detail.message);
        }
    }
    else if (error.message?.includes('ER_DUP_ENTRY')) {
        statusCode = 409;
        message = 'Duplicate entry. Resource already exists';
    }
    else if (error.message?.includes('ER_NO_REFERENCED_ROW')) {
        statusCode = 400;
        message = 'Referenced resource does not exist';
    }
    else if (error.message?.includes('ER_ROW_IS_REFERENCED')) {
        statusCode = 409;
        message = 'Cannot delete resource. It is referenced by other records';
    }
    else if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
        statusCode = 503;
        message = 'Database connection failed';
    }
    else if (error.message?.includes('File too large')) {
        statusCode = 413;
        message = 'File size exceeds limit';
    }
    else if (error.message?.includes('Invalid file type')) {
        statusCode = 400;
        message = 'Invalid file type';
    }
    else if (error.name === 'SyntaxError' && process.env.NODE_ENV === 'development') {
        statusCode = 400;
        message = 'Invalid JSON format';
    }
    else if (error.message?.includes('CORS')) {
        statusCode = 403;
        message = 'CORS policy violation';
    }
    else if (error.message?.includes('timeout')) {
        statusCode = 408;
        message = 'Request timeout';
    }
    response_1.ApiResponseUtil.error(res, message, errors, statusCode);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const message = `Route ${req.method} ${req.originalUrl} not found`;
    response_1.ApiResponseUtil.notFound(res, message);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const createValidationError = (message, errors) => {
    return new ValidationError(message, errors);
};
exports.createValidationError = createValidationError;
const createAuthenticationError = (message) => {
    return new AuthenticationError(message);
};
exports.createAuthenticationError = createAuthenticationError;
const createAuthorizationError = (message) => {
    return new AuthorizationError(message);
};
exports.createAuthorizationError = createAuthorizationError;
const createNotFoundError = (message) => {
    return new NotFoundError(message);
};
exports.createNotFoundError = createNotFoundError;
const createConflictError = (message) => {
    return new ConflictError(message);
};
exports.createConflictError = createConflictError;
const createBadRequestError = (message, errors) => {
    return new BadRequestError(message, errors);
};
exports.createBadRequestError = createBadRequestError;
const createDatabaseError = (message) => {
    return new DatabaseError(message);
};
exports.createDatabaseError = createDatabaseError;
const createExternalServiceError = (message) => {
    return new ExternalServiceError(message);
};
exports.createExternalServiceError = createExternalServiceError;
const logError = (error, context) => {
    const logData = {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        context,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    };
    if (process.env.NODE_ENV === 'production') {
        console.error('Production Error:', JSON.stringify(logData, null, 2));
    }
    else {
        console.error('Development Error:', logData);
    }
};
exports.logError = logError;
const gracefulShutdown = (server) => {
    const shutdown = (signal) => {
        console.log(`Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            console.log('Server closed successfully');
            process.exit(0);
        });
        setTimeout(() => {
            console.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 30000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        (0, exports.logError)(error, { type: 'uncaughtException' });
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        (0, exports.logError)(new Error('Unhandled Promise Rejection'), {
            type: 'unhandledRejection',
            reason,
            promise
        });
        process.exit(1);
    });
};
exports.gracefulShutdown = gracefulShutdown;
//# sourceMappingURL=errorHandler.js.map