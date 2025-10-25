import { Response } from 'express';
import { ApiResponse } from './types';

/**
 * Standard API response utility class
 */
export class ApiResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    message: string = 'Operation successful',
    data?: T,
    statusCode: number = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'Operation failed',
    errors?: string[],
    statusCode: number = 400,
    data?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      data
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: string[],
    message: string = 'Validation failed'
  ): Response {
    return this.error(res, message, errors, 422);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response {
    return this.error(res, message, undefined, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden access'
  ): Response {
    return this.error(res, message, undefined, 403);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, message, undefined, 404);
  }

  /**
   * Send internal server error response
   */
  static serverError(
    res: Response,
    message: string = 'Internal server error',
    error?: any
  ): Response {
    // Log error for debugging (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.error('Server Error:', error);
    }

    return this.error(res, message, undefined, 500);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Data retrieved successfully'
  ): Response {
    const totalPages = Math.ceil(total / limit);

    return this.success(res, message, data, 200, {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, message, data, 201);
  }

  /**
   * Send updated response
   */
  static updated<T>(
    res: Response,
    data: T,
    message: string = 'Resource updated successfully'
  ): Response {
    return this.success(res, message, data, 200);
  }

  /**
   * Send deleted response
   */
  static deleted(
    res: Response,
    message: string = 'Resource deleted successfully'
  ): Response {
    return this.success(res, message, null, 200);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): Response {
    return this.error(res, message, undefined, 409);
  }

  /**
   * Send too many requests response
   */
  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests'
  ): Response {
    return this.error(res, message, undefined, 429);
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message: string = 'Bad request',
    errors?: string[]
  ): Response {
    return this.error(res, message, errors, 400);
  }

  /**
   * Send service unavailable response
   */
  static serviceUnavailable(
    res: Response,
    message: string = 'Service unavailable'
  ): Response {
    return this.error(res, message, undefined, 503);
  }
}

/**
 * Convenience methods for common responses
 */
export const successResponse = ApiResponseUtil.success.bind(ApiResponseUtil);
export const errorResponse = ApiResponseUtil.error.bind(ApiResponseUtil);
export const validationErrorResponse = ApiResponseUtil.validationError.bind(ApiResponseUtil);
export const unauthorizedResponse = ApiResponseUtil.unauthorized.bind(ApiResponseUtil);
export const forbiddenResponse = ApiResponseUtil.forbidden.bind(ApiResponseUtil);
export const notFoundResponse = ApiResponseUtil.notFound.bind(ApiResponseUtil);
export const serverErrorResponse = ApiResponseUtil.serverError.bind(ApiResponseUtil);
export const paginatedResponse = ApiResponseUtil.paginated.bind(ApiResponseUtil);
export const createdResponse = ApiResponseUtil.created.bind(ApiResponseUtil);
export const updatedResponse = ApiResponseUtil.updated.bind(ApiResponseUtil);
export const deletedResponse = ApiResponseUtil.deleted.bind(ApiResponseUtil);
export const conflictResponse = ApiResponseUtil.conflict.bind(ApiResponseUtil);
export const badRequestResponse = ApiResponseUtil.badRequest.bind(ApiResponseUtil);

export default ApiResponseUtil;
