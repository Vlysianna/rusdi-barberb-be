"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badRequestResponse = exports.conflictResponse = exports.deletedResponse = exports.updatedResponse = exports.createdResponse = exports.paginatedResponse = exports.serverErrorResponse = exports.notFoundResponse = exports.forbiddenResponse = exports.unauthorizedResponse = exports.validationErrorResponse = exports.errorResponse = exports.successResponse = exports.ApiResponseUtil = void 0;
class ApiResponseUtil {
    static success(res, message = 'Operation successful', data, statusCode = 200, meta) {
        const response = {
            success: true,
            message,
            data,
            meta
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message = 'Operation failed', errors, statusCode = 400, data) {
        const response = {
            success: false,
            message,
            errors,
            data
        };
        return res.status(statusCode).json(response);
    }
    static validationError(res, errors, message = 'Validation failed') {
        return this.error(res, message, errors, 422);
    }
    static unauthorized(res, message = 'Unauthorized access') {
        return this.error(res, message, undefined, 401);
    }
    static forbidden(res, message = 'Forbidden access') {
        return this.error(res, message, undefined, 403);
    }
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, undefined, 404);
    }
    static serverError(res, message = 'Internal server error', error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Server Error:', error);
        }
        return this.error(res, message, undefined, 500);
    }
    static paginated(res, data, total, page, limit, message = 'Data retrieved successfully') {
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
    static created(res, data, message = 'Resource created successfully') {
        return this.success(res, message, data, 201);
    }
    static updated(res, data, message = 'Resource updated successfully') {
        return this.success(res, message, data, 200);
    }
    static deleted(res, message = 'Resource deleted successfully') {
        return this.success(res, message, null, 200);
    }
    static noContent(res) {
        return res.status(204).send();
    }
    static conflict(res, message = 'Resource conflict') {
        return this.error(res, message, undefined, 409);
    }
    static tooManyRequests(res, message = 'Too many requests') {
        return this.error(res, message, undefined, 429);
    }
    static badRequest(res, message = 'Bad request', errors) {
        return this.error(res, message, errors, 400);
    }
    static serviceUnavailable(res, message = 'Service unavailable') {
        return this.error(res, message, undefined, 503);
    }
}
exports.ApiResponseUtil = ApiResponseUtil;
exports.successResponse = ApiResponseUtil.success.bind(ApiResponseUtil);
exports.errorResponse = ApiResponseUtil.error.bind(ApiResponseUtil);
exports.validationErrorResponse = ApiResponseUtil.validationError.bind(ApiResponseUtil);
exports.unauthorizedResponse = ApiResponseUtil.unauthorized.bind(ApiResponseUtil);
exports.forbiddenResponse = ApiResponseUtil.forbidden.bind(ApiResponseUtil);
exports.notFoundResponse = ApiResponseUtil.notFound.bind(ApiResponseUtil);
exports.serverErrorResponse = ApiResponseUtil.serverError.bind(ApiResponseUtil);
exports.paginatedResponse = ApiResponseUtil.paginated.bind(ApiResponseUtil);
exports.createdResponse = ApiResponseUtil.created.bind(ApiResponseUtil);
exports.updatedResponse = ApiResponseUtil.updated.bind(ApiResponseUtil);
exports.deletedResponse = ApiResponseUtil.deleted.bind(ApiResponseUtil);
exports.conflictResponse = ApiResponseUtil.conflict.bind(ApiResponseUtil);
exports.badRequestResponse = ApiResponseUtil.badRequest.bind(ApiResponseUtil);
exports.default = ApiResponseUtil;
//# sourceMappingURL=response.js.map