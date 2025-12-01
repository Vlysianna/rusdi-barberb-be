import { type Booking } from "../models/booking";
import { BookingStatus } from "../utils/types";
interface GetBookingsParams {
    page: number;
    limit: number;
    customerId?: string;
    stylistId?: string;
    serviceId?: string;
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
interface CreateBookingData {
    customerId: string;
    stylistId: string;
    serviceId: string;
    appointmentDate: Date;
    appointmentTime: string;
    notes?: string;
}
interface GetBookingsResult {
    bookings: BookingWithDetails[];
    total: number;
}
interface BookingWithDetails extends Booking {
    customer: {
        id: string;
        fullName: string;
        email: string;
        phone?: string;
    };
    stylist: {
        id: string;
        user: {
            fullName: string;
            email: string;
        };
        specialties: string[];
        rating: number;
    };
    service: {
        id: string;
        name: string;
        duration: number;
        price: number;
        category: string;
    };
}
interface BookingStats {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    todayBookings: number;
    thisWeekBookings: number;
    thisMonthBookings: number;
    averageBookingValue: number;
    popularServices: Array<{
        serviceId: string;
        serviceName: string;
        bookingCount: number;
    }>;
    busyHours: Array<{
        hour: number;
        bookingCount: number;
    }>;
}
interface TimeSlot {
    time: string;
    isAvailable: boolean;
    reason?: string;
}
declare class BookingService {
    private parseSpecialties;
    getBookings(params: GetBookingsParams): Promise<GetBookingsResult>;
    getBookingById(bookingId: string): Promise<BookingWithDetails | null>;
    createBooking(bookingData: CreateBookingData): Promise<BookingWithDetails>;
    updateBooking(bookingId: string, updateData: {
        appointmentDate?: Date;
        appointmentTime?: string;
        endTime?: string;
        notes?: string;
        performedBy?: string;
    }): Promise<BookingWithDetails>;
    updateBookingStatus(bookingId: string, newStatus: BookingStatus, performedBy: string, reason?: string): Promise<BookingWithDetails>;
    cancelBooking(bookingId: string, reason: string, performedBy: string): Promise<BookingWithDetails>;
    checkTimeSlotAvailability(stylistId: string, appointmentDate: Date, appointmentTime: string, duration: number, excludeBookingId?: string): Promise<boolean>;
    getAvailableTimeSlots(stylistId: string, appointmentDate: Date, serviceDuration: number): Promise<TimeSlot[]>;
    getBookingStats(): Promise<BookingStats>;
    private logBookingHistory;
    private isValidStatusTransition;
    private timeToMinutes;
    private minutesToTime;
}
declare const _default: BookingService;
export default _default;
//# sourceMappingURL=bookingService.d.ts.map