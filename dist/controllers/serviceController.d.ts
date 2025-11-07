import { Response, NextFunction } from "express";
declare class ServiceController {
    getAllServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceById: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    createService: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateService: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deleteService: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getActiveServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getPopularServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServicesByCategory: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceCategories: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateServiceStatus: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    toggleServicePopularity: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceAnalytics: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceAvailability: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getRecommendedServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    exportServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServicesByStylist: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceReviews: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServicePricingHistory: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    bulkUpdateServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const serviceController: ServiceController;
export default serviceController;
//# sourceMappingURL=serviceController.d.ts.map