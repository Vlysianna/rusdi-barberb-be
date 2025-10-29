import { Response, NextFunction } from "express";
declare class BookingController {
    getBookings: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getBookingById: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    createBooking: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateBooking: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    cancelBooking: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    confirmBooking: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    startBooking: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    completeBooking: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    markNoShow: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getAvailableTimeSlots: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getBookingStats: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getCustomerBookingHistory: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getStylistBookingSchedule: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    rescheduleBooking: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: BookingController;
export default _default;
//# sourceMappingURL=bookingController.d.ts.map