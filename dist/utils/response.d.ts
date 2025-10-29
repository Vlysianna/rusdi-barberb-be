import { Response } from 'express';
export declare class ApiResponseUtil {
    static success<T>(res: Response, message?: string, data?: T, statusCode?: number, meta?: any): Response;
    static error(res: Response, message?: string, errors?: string[], statusCode?: number, data?: any): Response;
    static validationError(res: Response, errors: string[], message?: string): Response;
    static unauthorized(res: Response, message?: string): Response;
    static forbidden(res: Response, message?: string): Response;
    static notFound(res: Response, message?: string): Response;
    static serverError(res: Response, message?: string, error?: any): Response;
    static paginated<T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string): Response;
    static created<T>(res: Response, data: T, message?: string): Response;
    static updated<T>(res: Response, data: T, message?: string): Response;
    static deleted(res: Response, message?: string): Response;
    static noContent(res: Response): Response;
    static conflict(res: Response, message?: string): Response;
    static tooManyRequests(res: Response, message?: string): Response;
    static badRequest(res: Response, message?: string, errors?: string[]): Response;
    static serviceUnavailable(res: Response, message?: string): Response;
}
export declare const successResponse: any;
export declare const errorResponse: any;
export declare const validationErrorResponse: any;
export declare const unauthorizedResponse: any;
export declare const forbiddenResponse: any;
export declare const notFoundResponse: any;
export declare const serverErrorResponse: any;
export declare const paginatedResponse: any;
export declare const createdResponse: any;
export declare const updatedResponse: any;
export declare const deletedResponse: any;
export declare const conflictResponse: any;
export declare const badRequestResponse: any;
export default ApiResponseUtil;
//# sourceMappingURL=response.d.ts.map