import { Request, Response, NextFunction } from "express";
declare class DashboardController {
    getDashboardStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRevenueStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBookingTrends: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const dashboardController: DashboardController;
export {};
//# sourceMappingURL=dashboardController.d.ts.map