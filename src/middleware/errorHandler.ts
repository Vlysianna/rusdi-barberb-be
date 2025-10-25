import { Request, Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../utils/response';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: string[];

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: string[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = 'ApiError';
  }
}

/**
 * Validation Error class
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', errors: string[] = []) {
    super(message, 422, true, errors);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error class
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error class
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error class
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error class
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true);
    this.name = 'ConflictError';
  }
}

/**
 * Bad Request Error class
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', errors?: string[]) {
    super(message, 400, true, errors);
    this.name = 'BadRequestError';
  }
}

/**
 * Rate Limit Error class
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

/**
 * Database Error class
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, true);
    this.name = 'DatabaseError';
  }
}

/**
 * External Service Error class
 */
export class ExternalServiceError extends ApiError {
  constructor(message: string = 'External service error') {
    super(message, 502, true);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: string[] | undefined;

  // Log error for debugging
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

  // Handle known API errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle validation errors from Joi
  else if (error.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    // Extract validation errors if available
    if ('details' in error && Array.isArray((error as any).details)) {
      errors = (error as any).details.map((detail: any) => detail.message);
    }
  }
  // Handle MySQL/Database errors
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
  // Handle multer file upload errors
  else if (error.message?.includes('File too large')) {
    statusCode = 413;
    message = 'File size exceeds limit';
  }
  else if (error.message?.includes('Invalid file type')) {
    statusCode = 400;
    message = 'Invalid file type';
  }
  // Handle syntax errors in development
  else if (error.name === 'SyntaxError' && process.env.NODE_ENV === 'development') {
    statusCode = 400;
    message = 'Invalid JSON format';
  }
  // Handle CORS errors
  else if (error.message?.includes('CORS')) {
    statusCode = 403;
    message = 'CORS policy violation';
  }
  // Handle timeout errors
  else if (error.message?.includes('timeout')) {
    statusCode = 408;
    message = 'Request timeout';
  }

  // Send error response
  ApiResponseUtil.error(res, message, errors, statusCode);
};

/**
 * 404 handler middleware for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const message = `Route ${req.method} ${req.originalUrl} not found`;
  ApiResponseUtil.notFound(res, message);
};

/**
 * Async error wrapper utility
 * Catches async errors and passes them to error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error factory functions
 */
export const createValidationError = (message: string, errors: string[]) => {
  return new ValidationError(message, errors);
};

export const createAuthenticationError = (message?: string) => {
  return new AuthenticationError(message);
};

export const createAuthorizationError = (message?: string) => {
  return new AuthorizationError(message);
};

export const createNotFoundError = (message?: string) => {
  return new NotFoundError(message);
};

export const createConflictError = (message?: string) => {
  return new ConflictError(message);
};

export const createBadRequestError = (message?: string, errors?: string[]) => {
  return new BadRequestError(message, errors);
};

export const createDatabaseError = (message?: string) => {
  return new DatabaseError(message);
};

export const createExternalServiceError = (message?: string) => {
  return new ExternalServiceError(message);
};

/**
 * Error logging utility
 */
export const logError = (error: Error, context?: Record<string, any>) => {
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

  // In production, you might want to use a proper logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to logging service like Winston, Sentry, etc.
    console.error('Production Error:', JSON.stringify(logData, null, 2));
  } else {
    console.error('Development Error:', logData);
  }
};

/**
 * Graceful shutdown handler
 */
export const gracefulShutdown = (server: any) => {
  const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(() => {
      console.log('Server closed successfully');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    logError(error, { type: 'uncaughtException' });
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    logError(new Error('Unhandled Promise Rejection'), {
      type: 'unhandledRejection',
      reason,
      promise
    });
    process.exit(1);
  });
};
