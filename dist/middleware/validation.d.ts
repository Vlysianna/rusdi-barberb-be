import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validate: (schema: Joi.ObjectSchema, source?: "body" | "params" | "query") => (req: Request, res: Response, next: NextFunction) => void;
export declare const userValidation: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    updateProfile: Joi.ObjectSchema<any>;
    changePassword: Joi.ObjectSchema<any>;
};
export declare const serviceValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const bookingValidation: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const reviewValidation: {
    create: Joi.ObjectSchema<any>;
};
export declare const stylistValidation: {
    create: Joi.ObjectSchema<any>;
    updateSchedule: Joi.ObjectSchema<any>;
};
export declare const paymentValidation: {
    create: Joi.ObjectSchema<any>;
};
export declare const paramValidation: {
    id: Joi.ObjectSchema<any>;
};
export declare const queryValidation: {
    pagination: Joi.ObjectSchema<any>;
    dateRange: Joi.ObjectSchema<any>;
    bookingFilter: Joi.ObjectSchema<any>;
};
export declare const validateBody: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validatePagination: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateId: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUserRegistration: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUserLogin: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateServiceCreation: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateBookingCreation: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateReviewCreation: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map