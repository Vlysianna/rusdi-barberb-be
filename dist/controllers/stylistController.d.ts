import { Response, NextFunction } from "express";
declare class StylistController {
    getAllStylists: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getStylistById: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    createStylist: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateStylist: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deleteStylist: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getAvailableStylists: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateAvailability: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateSchedule: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getStylistBookings: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getStylistPerformance: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getStylistEarnings: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getStylistReviews: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getStylistSpecialties: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    assignServiceToStylist: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    removeServiceFromStylist: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getStylistSchedules: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    addStylistSchedule: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateStylistScheduleEntry: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deleteStylistScheduleEntry: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const stylistController: StylistController;
export default stylistController;
//# sourceMappingURL=stylistController.d.ts.map