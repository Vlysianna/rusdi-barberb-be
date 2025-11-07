"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../utils/types");
class StylistService {
    async getAllStylists(filters) {
        try {
            const { page = 1, limit = 10, search, isAvailable, specialties, } = filters || {};
            const offset = (page - 1) * limit;
            const whereConditions = [];
            if (search) {
                whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(models_1.users.fullName, `%${search}%`), (0, drizzle_orm_1.like)(models_1.users.email, `%${search}%`)));
            }
            if (isAvailable !== undefined) {
                whereConditions.push((0, drizzle_orm_1.eq)(models_1.stylists.isAvailable, isAvailable));
            }
            if (specialties && specialties.length > 0) {
                whereConditions.push((0, drizzle_orm_1.sql) `JSON_OVERLAPS(${models_1.stylists.specialties}, ${JSON.stringify(specialties)})`);
            }
            const baseQuery = database_1.db
                .select({
                id: models_1.stylists.id,
                userId: models_1.stylists.userId,
                specialties: models_1.stylists.specialties,
                experience: models_1.stylists.experience,
                commissionRate: models_1.stylists.commissionRate,
                isAvailable: models_1.stylists.isAvailable,
                schedule: models_1.stylists.schedule,
                bio: models_1.stylists.bio,
                rating: models_1.stylists.rating,
                totalBookings: models_1.stylists.totalBookings,
                revenue: models_1.stylists.revenue,
                createdAt: models_1.stylists.createdAt,
                updatedAt: models_1.stylists.updatedAt,
                user: {
                    id: models_1.users.id,
                    fullName: models_1.users.fullName,
                    email: models_1.users.email,
                    phone: models_1.users.phone,
                    avatar: models_1.users.avatar,
                    isActive: models_1.users.isActive,
                    role: models_1.users.role,
                },
            })
                .from(models_1.stylists)
                .innerJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.stylists.userId, models_1.users.id))
                .where(whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined)
                .limit(limit)
                .offset(offset);
            const stylistsResult = await baseQuery;
            const totalQuery = database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(models_1.stylists)
                .innerJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.stylists.userId, models_1.users.id))
                .where(whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined);
            const [{ count: total }] = await totalQuery;
            return {
                stylists: stylistsResult,
                total,
            };
        }
        catch (error) {
            throw new Error(`Failed to get stylists: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getStylistById(id) {
        try {
            const result = await database_1.db
                .select({
                id: models_1.stylists.id,
                userId: models_1.stylists.userId,
                specialties: models_1.stylists.specialties,
                experience: models_1.stylists.experience,
                commissionRate: models_1.stylists.commissionRate,
                isAvailable: models_1.stylists.isAvailable,
                schedule: models_1.stylists.schedule,
                bio: models_1.stylists.bio,
                rating: models_1.stylists.rating,
                totalBookings: models_1.stylists.totalBookings,
                revenue: models_1.stylists.revenue,
                createdAt: models_1.stylists.createdAt,
                updatedAt: models_1.stylists.updatedAt,
                user: {
                    id: models_1.users.id,
                    fullName: models_1.users.fullName,
                    email: models_1.users.email,
                    phone: models_1.users.phone,
                    avatar: models_1.users.avatar,
                    isActive: models_1.users.isActive,
                    role: models_1.users.role,
                },
            })
                .from(models_1.stylists)
                .innerJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.stylists.userId, models_1.users.id))
                .where((0, drizzle_orm_1.eq)(models_1.stylists.id, id))
                .limit(1);
            if (!result.length) {
                throw new errorHandler_1.NotFoundError("Stylist not found");
            }
            return result[0];
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to get stylist: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async createStylist(data) {
        try {
            const existingUser = await database_1.db
                .select()
                .from(models_1.users)
                .where((0, drizzle_orm_1.eq)(models_1.users.id, data.userId))
                .limit(1);
            if (!existingUser.length) {
                throw new errorHandler_1.NotFoundError("User not found");
            }
            const existingStylist = await database_1.db
                .select()
                .from(models_1.stylists)
                .where((0, drizzle_orm_1.eq)(models_1.stylists.userId, data.userId))
                .limit(1);
            if (existingStylist.length) {
                throw new errorHandler_1.ConflictError("User is already a stylist");
            }
            await database_1.db
                .update(models_1.users)
                .set({ role: types_1.UserRole.STYLIST })
                .where((0, drizzle_orm_1.eq)(models_1.users.id, data.userId));
            const stylistData = {
                userId: data.userId,
                specialties: data.specialties || [],
                experience: data.experience || 0,
                commissionRate: (data.commissionRate || 15).toString(),
                isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
                schedule: data.schedule || {
                    monday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                    tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                    wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                    thursday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                    friday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
                    saturday: { isWorking: true, startTime: "09:00", endTime: "17:00" },
                    sunday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
                },
                bio: data.bio || "",
                rating: "0.00",
                totalBookings: 0,
                revenue: "0.00",
            };
            const [insertResult] = await database_1.db.insert(models_1.stylists).values(stylistData);
            return await this.getStylistById(insertResult.insertId.toString());
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError || error instanceof errorHandler_1.ConflictError) {
                throw error;
            }
            throw new Error(`Failed to create stylist: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async updateStylist(id, data) {
        try {
            const existingStylist = await this.getStylistById(id);
            const updateData = {
                ...data,
                commissionRate: data.commissionRate
                    ? data.commissionRate.toString()
                    : undefined,
                updatedAt: new Date(),
            };
            await database_1.db.update(models_1.stylists).set(updateData).where((0, drizzle_orm_1.eq)(models_1.stylists.id, id));
            return await this.getStylistById(id);
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to update stylist: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async deleteStylist(id) {
        try {
            const existingStylist = await this.getStylistById(id);
            const activeBookings = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(models_1.bookings)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.bookings.stylistId, id), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(models_1.bookings.status, "pending"), (0, drizzle_orm_1.eq)(models_1.bookings.status, "confirmed"), (0, drizzle_orm_1.eq)(models_1.bookings.status, "in_progress"))));
            if (activeBookings[0].count > 0) {
                throw new errorHandler_1.ConflictError("Cannot delete stylist with active bookings");
            }
            await database_1.db
                .update(models_1.users)
                .set({ role: types_1.UserRole.CUSTOMER })
                .where((0, drizzle_orm_1.eq)(models_1.users.id, existingStylist.userId));
            await database_1.db.delete(models_1.stylists).where((0, drizzle_orm_1.eq)(models_1.stylists.id, id));
            return true;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError || error instanceof errorHandler_1.ConflictError) {
                throw error;
            }
            throw new Error(`Failed to delete stylist: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getAvailableStylists(date, time) {
        try {
            const dayOfWeek = new Date(date)
                .toLocaleDateString("en-US", { weekday: "long" })
                .toLowerCase();
            const availableStylists = await database_1.db
                .select({
                id: models_1.stylists.id,
                userId: models_1.stylists.userId,
                schedule: models_1.stylists.schedule,
                specialties: models_1.stylists.specialties,
                experience: models_1.stylists.experience,
                rating: models_1.stylists.rating,
                user: {
                    id: models_1.users.id,
                    fullName: models_1.users.fullName,
                    email: models_1.users.email,
                    phone: models_1.users.phone,
                    avatar: models_1.users.avatar,
                },
            })
                .from(models_1.stylists)
                .innerJoin(models_1.users, (0, drizzle_orm_1.eq)(models_1.stylists.userId, models_1.users.id))
                .where((0, drizzle_orm_1.eq)(models_1.stylists.isAvailable, true));
            const filteredStylists = availableStylists.filter((stylist) => {
                const schedule = stylist.schedule;
                const daySchedule = schedule[dayOfWeek];
                if (!daySchedule || !daySchedule.isWorking) {
                    return false;
                }
                const requestTime = time;
                const startTime = daySchedule.startTime;
                const endTime = daySchedule.endTime;
                return requestTime >= startTime && requestTime <= endTime;
            });
            return filteredStylists;
        }
        catch (error) {
            throw new Error(`Failed to get available stylists: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async updateAvailability(id, isAvailable) {
        try {
            await this.getStylistById(id);
            await database_1.db
                .update(models_1.stylists)
                .set({
                isAvailable,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(models_1.stylists.id, id));
            return await this.getStylistById(id);
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to update availability: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async updateSchedule(id, schedule) {
        try {
            await this.getStylistById(id);
            await database_1.db
                .update(models_1.stylists)
                .set({
                schedule,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(models_1.stylists.id, id));
            return await this.getStylistById(id);
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to update schedule: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getStylistBookings(stylistId, filters = {}) {
        try {
            const { page = 1, limit = 10, status, dateFrom, dateTo } = filters;
            const offset = (page - 1) * limit;
            const whereConditions = [(0, drizzle_orm_1.eq)(models_1.bookings.stylistId, stylistId)];
            if (status) {
                whereConditions.push((0, drizzle_orm_1.eq)(models_1.bookings.status, status));
            }
            if (dateFrom) {
                whereConditions.push((0, drizzle_orm_1.sql) `DATE(${models_1.bookings.appointmentDate}) >= ${dateFrom}`);
            }
            if (dateTo) {
                whereConditions.push((0, drizzle_orm_1.sql) `DATE(${models_1.bookings.appointmentDate}) <= ${dateTo}`);
            }
            const bookingsResult = await database_1.db
                .select({
                id: models_1.bookings.id,
                appointmentDate: models_1.bookings.appointmentDate,
                appointmentTime: models_1.bookings.appointmentTime,
                status: models_1.bookings.status,
                notes: models_1.bookings.notes,
                totalAmount: models_1.bookings.totalAmount,
                createdAt: models_1.bookings.createdAt,
            })
                .from(models_1.bookings)
                .where((0, drizzle_orm_1.and)(...whereConditions))
                .orderBy((0, drizzle_orm_1.desc)(models_1.bookings.appointmentDate))
                .limit(limit)
                .offset(offset);
            const [{ count: total }] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(models_1.bookings)
                .where((0, drizzle_orm_1.and)(...whereConditions));
            return {
                bookings: bookingsResult,
                total,
            };
        }
        catch (error) {
            throw new Error(`Failed to get stylist bookings: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getStylistPerformance(stylistId, dateFrom, dateTo) {
        try {
            const whereConditions = [(0, drizzle_orm_1.eq)(models_1.bookings.stylistId, stylistId)];
            if (dateFrom) {
                whereConditions.push((0, drizzle_orm_1.sql) `DATE(${models_1.bookings.appointmentDate}) >= ${dateFrom}`);
            }
            if (dateTo) {
                whereConditions.push((0, drizzle_orm_1.sql) `DATE(${models_1.bookings.appointmentDate}) <= ${dateTo}`);
            }
            const stats = await database_1.db
                .select({
                totalBookings: (0, drizzle_orm_1.count)(),
                completedBookings: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${models_1.bookings.status} = 'completed' THEN 1 ELSE 0 END)`,
                cancelledBookings: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${models_1.bookings.status} = 'cancelled' THEN 1 ELSE 0 END)`,
                totalRevenue: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${models_1.bookings.status} = 'completed' THEN ${models_1.bookings.totalAmount} ELSE 0 END), 0)`,
            })
                .from(models_1.bookings)
                .where((0, drizzle_orm_1.and)(...whereConditions));
            const ratingResult = await database_1.db
                .select({
                avgRating: (0, drizzle_orm_1.sql) `COALESCE(AVG(${models_1.reviews.rating}), 0)`,
            })
                .from(models_1.reviews)
                .innerJoin(models_1.bookings, (0, drizzle_orm_1.eq)(models_1.reviews.bookingId, models_1.bookings.id))
                .where((0, drizzle_orm_1.eq)(models_1.bookings.stylistId, stylistId));
            return {
                totalBookings: stats[0].totalBookings,
                completedBookings: stats[0].completedBookings,
                cancelledBookings: stats[0].cancelledBookings,
                totalRevenue: stats[0].totalRevenue.toString(),
                averageRating: ratingResult[0].avgRating,
                monthlyStats: [],
            };
        }
        catch (error) {
            throw new Error(`Failed to get stylist performance: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getStylistEarnings(stylistId, dateFrom, dateTo) {
        try {
            const stylist = await this.getStylistById(stylistId);
            const commissionRate = parseFloat(stylist.commissionRate.toString()) / 100;
            const whereConditions = [
                (0, drizzle_orm_1.eq)(models_1.bookings.stylistId, stylistId),
                (0, drizzle_orm_1.eq)(models_1.bookings.status, "completed"),
            ];
            if (dateFrom) {
                whereConditions.push((0, drizzle_orm_1.sql) `DATE(${models_1.bookings.appointmentDate}) >= ${dateFrom}`);
            }
            if (dateTo) {
                whereConditions.push((0, drizzle_orm_1.sql) `DATE(${models_1.bookings.appointmentDate}) <= ${dateTo}`);
            }
            const stats = await database_1.db
                .select({
                totalBookings: (0, drizzle_orm_1.count)(),
                totalRevenue: (0, drizzle_orm_1.sql) `COALESCE(SUM(${models_1.bookings.totalAmount}), 0)`,
            })
                .from(models_1.bookings)
                .where((0, drizzle_orm_1.and)(...whereConditions));
            const totalRevenue = parseFloat(stats[0].totalRevenue);
            const commission = totalRevenue * commissionRate;
            const averageBookingValue = stats[0].totalBookings > 0 ? totalRevenue / stats[0].totalBookings : 0;
            return {
                totalEarnings: commission.toFixed(2),
                commission: commission.toFixed(2),
                totalBookings: stats[0].totalBookings,
                averageBookingValue: averageBookingValue.toFixed(2),
                monthlyBreakdown: [],
            };
        }
        catch (error) {
            throw new Error(`Failed to get stylist earnings: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getStylistReviews(stylistId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            const reviewsResult = await database_1.db
                .select({
                id: models_1.reviews.id,
                rating: models_1.reviews.rating,
                comment: models_1.reviews.comment,
                createdAt: models_1.reviews.createdAt,
            })
                .from(models_1.reviews)
                .innerJoin(models_1.bookings, (0, drizzle_orm_1.eq)(models_1.reviews.bookingId, models_1.bookings.id))
                .where((0, drizzle_orm_1.eq)(models_1.bookings.stylistId, stylistId))
                .orderBy((0, drizzle_orm_1.desc)(models_1.reviews.createdAt))
                .limit(limit)
                .offset(offset);
            const [{ count: total }] = await database_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(models_1.reviews)
                .innerJoin(models_1.bookings, (0, drizzle_orm_1.eq)(models_1.reviews.bookingId, models_1.bookings.id))
                .where((0, drizzle_orm_1.eq)(models_1.bookings.stylistId, stylistId));
            const [{ avgRating }] = await database_1.db
                .select({
                avgRating: (0, drizzle_orm_1.sql) `COALESCE(AVG(${models_1.reviews.rating}), 0)`,
            })
                .from(models_1.reviews)
                .innerJoin(models_1.bookings, (0, drizzle_orm_1.eq)(models_1.reviews.bookingId, models_1.bookings.id))
                .where((0, drizzle_orm_1.eq)(models_1.bookings.stylistId, stylistId));
            return {
                reviews: reviewsResult,
                total,
                averageRating: avgRating,
            };
        }
        catch (error) {
            throw new Error(`Failed to get stylist reviews: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getStylistSpecialties() {
        try {
            const result = await database_1.db
                .select({ specialties: models_1.stylists.specialties })
                .from(models_1.stylists)
                .where((0, drizzle_orm_1.eq)(models_1.stylists.isAvailable, true));
            const allSpecialties = new Set();
            result.forEach((item) => {
                if (item.specialties && Array.isArray(item.specialties)) {
                    item.specialties.forEach((specialty) => allSpecialties.add(specialty));
                }
            });
            return Array.from(allSpecialties).sort();
        }
        catch (error) {
            throw new Error(`Failed to get stylist specialties: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async assignServiceToStylist(stylistId, serviceId) {
        try {
            await this.getStylistById(stylistId);
            const existing = await database_1.db
                .select()
                .from(models_1.stylistServices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.stylistServices.stylistId, stylistId), (0, drizzle_orm_1.eq)(models_1.stylistServices.serviceId, serviceId)))
                .limit(1);
            if (existing.length) {
                throw new errorHandler_1.ConflictError("Service is already assigned to this stylist");
            }
            await database_1.db.insert(models_1.stylistServices).values({
                stylistId,
                serviceId,
            });
            return true;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError || error instanceof errorHandler_1.ConflictError) {
                throw error;
            }
            throw new Error(`Failed to assign service to stylist: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async removeServiceFromStylist(stylistId, serviceId) {
        try {
            const existing = await database_1.db
                .select()
                .from(models_1.stylistServices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.stylistServices.stylistId, stylistId), (0, drizzle_orm_1.eq)(models_1.stylistServices.serviceId, serviceId)))
                .limit(1);
            if (!existing.length) {
                throw new errorHandler_1.NotFoundError("Service assignment not found");
            }
            await database_1.db
                .delete(models_1.stylistServices)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(models_1.stylistServices.stylistId, stylistId), (0, drizzle_orm_1.eq)(models_1.stylistServices.serviceId, serviceId)));
            return true;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new Error(`Failed to remove service from stylist: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
exports.default = new StylistService();
//# sourceMappingURL=stylistService.js.map