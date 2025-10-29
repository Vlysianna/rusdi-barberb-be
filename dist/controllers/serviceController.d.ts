import { Response, NextFunction } from "express";
declare class ServiceController {
    getServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceById: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    createService: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateService: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deleteService: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getCategories: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    createCategory: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateCategory: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCategory: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceAddons: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    createServiceAddon: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateServiceAddon: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deleteServiceAddon: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    uploadServiceImage: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getServiceStats: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getPopularServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    searchServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    bulkUpdateServices: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: ServiceController;
export default _default;
//# sourceMappingURL=serviceController.d.ts.map