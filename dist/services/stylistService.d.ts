export interface CreateStylistData {
    userId: string;
    specialties?: string[];
    experience?: number;
    commissionRate?: number;
    isAvailable?: boolean;
    schedule?: {
        [key: string]: {
            isWorking: boolean;
            startTime: string;
            endTime: string;
        };
    };
    bio?: string;
}
export interface UpdateStylistData {
    specialties?: string[];
    experience?: number;
    commissionRate?: number;
    isAvailable?: boolean;
    schedule?: {
        [key: string]: {
            isWorking: boolean;
            startTime: string;
            endTime: string;
        };
    };
    bio?: string;
}
export interface StylistFilters {
    page?: number;
    limit?: number;
    search?: string;
    isAvailable?: boolean;
    specialties?: string[];
}
export interface StylistPerformance {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: string;
    averageRating: number;
    monthlyStats: {
        month: string;
        bookings: number;
        revenue: string;
    }[];
}
export interface StylistEarnings {
    totalEarnings: string;
    commission: string;
    totalBookings: number;
    averageBookingValue: string;
    monthlyBreakdown: {
        month: string;
        earnings: string;
        bookings: number;
    }[];
}
declare class StylistService {
    getAllStylists(filters?: StylistFilters): Promise<{
        stylists: {
            id: string;
            userId: string;
            specialties: string[];
            experience: number;
            commissionRate: string;
            isAvailable: boolean;
            schedule: {
                [key: string]: {
                    isWorking: boolean;
                    startTime: string;
                    endTime: string;
                };
            };
            bio: string;
            rating: string;
            totalBookings: number;
            revenue: string;
            createdAt: Date;
            updatedAt: Date;
            user: {
                id: string;
                fullName: string;
                email: string;
                phone: string;
                avatar: string;
                isActive: boolean;
                role: "admin" | "manager" | "stylist" | "customer";
            };
        }[];
        total: number;
    }>;
    getStylistById(id: string): Promise<{
        id: string;
        userId: string;
        specialties: string[];
        experience: number;
        commissionRate: string;
        isAvailable: boolean;
        schedule: {
            [key: string]: {
                isWorking: boolean;
                startTime: string;
                endTime: string;
            };
        };
        bio: string;
        rating: string;
        totalBookings: number;
        revenue: string;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            avatar: string;
            isActive: boolean;
            role: "admin" | "manager" | "stylist" | "customer";
        };
    }>;
    createStylist(data: CreateStylistData): Promise<{
        id: string;
        userId: string;
        specialties: string[];
        experience: number;
        commissionRate: string;
        isAvailable: boolean;
        schedule: {
            [key: string]: {
                isWorking: boolean;
                startTime: string;
                endTime: string;
            };
        };
        bio: string;
        rating: string;
        totalBookings: number;
        revenue: string;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            avatar: string;
            isActive: boolean;
            role: "admin" | "manager" | "stylist" | "customer";
        };
    }>;
    updateStylist(id: string, data: UpdateStylistData): Promise<{
        id: string;
        userId: string;
        specialties: string[];
        experience: number;
        commissionRate: string;
        isAvailable: boolean;
        schedule: {
            [key: string]: {
                isWorking: boolean;
                startTime: string;
                endTime: string;
            };
        };
        bio: string;
        rating: string;
        totalBookings: number;
        revenue: string;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            avatar: string;
            isActive: boolean;
            role: "admin" | "manager" | "stylist" | "customer";
        };
    }>;
    deleteStylist(id: string): Promise<boolean>;
    getAvailableStylists(date: string, time: string): Promise<{
        id: string;
        userId: string;
        schedule: {
            [key: string]: {
                isWorking: boolean;
                startTime: string;
                endTime: string;
            };
        };
        specialties: string[];
        experience: number;
        rating: string;
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            avatar: string;
        };
    }[]>;
    updateAvailability(id: string, isAvailable: boolean): Promise<{
        id: string;
        userId: string;
        specialties: string[];
        experience: number;
        commissionRate: string;
        isAvailable: boolean;
        schedule: {
            [key: string]: {
                isWorking: boolean;
                startTime: string;
                endTime: string;
            };
        };
        bio: string;
        rating: string;
        totalBookings: number;
        revenue: string;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            avatar: string;
            isActive: boolean;
            role: "admin" | "manager" | "stylist" | "customer";
        };
    }>;
    updateSchedule(id: string, schedule: any): Promise<{
        id: string;
        userId: string;
        specialties: string[];
        experience: number;
        commissionRate: string;
        isAvailable: boolean;
        schedule: {
            [key: string]: {
                isWorking: boolean;
                startTime: string;
                endTime: string;
            };
        };
        bio: string;
        rating: string;
        totalBookings: number;
        revenue: string;
        createdAt: Date;
        updatedAt: Date;
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            avatar: string;
            isActive: boolean;
            role: "admin" | "manager" | "stylist" | "customer";
        };
    }>;
    getStylistBookings(stylistId: string, filters?: {
        page?: number;
        limit?: number;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<{
        bookings: {
            id: string;
            appointmentDate: Date;
            appointmentTime: string;
            status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
            notes: string;
            totalAmount: string;
            createdAt: Date;
        }[];
        total: number;
    }>;
    getStylistPerformance(stylistId: string, dateFrom?: string, dateTo?: string): Promise<StylistPerformance>;
    getStylistEarnings(stylistId: string, dateFrom?: string, dateTo?: string): Promise<StylistEarnings>;
    getStylistReviews(stylistId: string, page?: number, limit?: number): Promise<{
        reviews: {
            id: string;
            rating: number;
            comment: string;
            createdAt: Date;
        }[];
        total: number;
        averageRating: number;
    }>;
    getStylistSpecialties(): Promise<string[]>;
    assignServiceToStylist(stylistId: string, serviceId: string): Promise<boolean>;
    removeServiceFromStylist(stylistId: string, serviceId: string): Promise<boolean>;
    getStylistSchedules(stylistId: string): Promise<{
        dayOfWeek: string;
        id: string;
        stylistId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    addStylistSchedule(stylistId: string, scheduleData: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        isAvailable?: boolean;
    }): Promise<{
        dayOfWeek: string;
        id: string;
        stylistId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStylistScheduleEntry(stylistId: string, scheduleId: string, scheduleData: {
        startTime?: string;
        endTime?: string;
        isAvailable?: boolean;
    }): Promise<{
        dayOfWeek: string;
        id: string;
        stylistId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteStylistScheduleEntry(stylistId: string, scheduleId: string): Promise<boolean>;
}
declare const _default: StylistService;
export default _default;
//# sourceMappingURL=stylistService.d.ts.map