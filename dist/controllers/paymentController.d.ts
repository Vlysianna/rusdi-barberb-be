import { Response, NextFunction } from "express";
declare class PaymentController {
    getPayments: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentById: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    createPayment: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    processPayment: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    refundPayment: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentStats: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getCustomerPaymentHistory: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentMethods: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    paymentWebhook: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentReceipt: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    retryPayment: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: PaymentController;
export default _default;
//# sourceMappingURL=paymentController.d.ts.map