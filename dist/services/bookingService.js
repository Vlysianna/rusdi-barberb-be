"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const booking_1 = require("../models/booking");
const user_1 = require("../models/user");
const stylist_1 = require("../models/stylist");
const service_1 = require("../models/service");
const stylist_2 = require("../models/stylist");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../utils/types");
class BookingService {
    parseSpecialties(specialties) {
        if (Array.isArray(specialties)) {
            return specialties;
        }
        if (typeof specialties === 'string') {
            try {
                const parsed = JSON.parse(specialties);
                return Array.isArray(parsed) ? parsed : [];
            }
            catch {
                return [];
            }
        }
        return [];
    }
    async getBookings(params) {
        try {
            const { page, limit, customerId, stylistId, serviceId, status, startDate, endDate, sortBy = "createdAt", sortOrder = "desc", } = params;
            const offset = (page - 1) * limit;
            let whereConditions = [];
            if (customerId) {
                whereConditions.push((0, drizzle_orm_1.eq)(booking_1.bookings.customerId, customerId));
            }
            if (stylistId) {
                whereConditions.push((0, drizzle_orm_1.eq)(booking_1.bookings.stylistId, stylistId));
            }
            if (serviceId) {
                whereConditions.push((0, drizzle_orm_1.eq)(booking_1.bookings.serviceId, serviceId));
            }
            if (status) {
                whereConditions.push((0, drizzle_orm_1.eq)(booking_1.bookings.status, status));
            }
            if (startDate && endDate) {
                whereConditions.push((0, drizzle_orm_1.between)(booking_1.bookings.appointmentDate, startDate, endDate));
            }
            else if (startDate) {
                whereConditions.push((0, drizzle_orm_1.gte)(booking_1.bookings.appointmentDate, startDate));
            }
            else if (endDate) {
                whereConditions.push((0, drizzle_orm_1.lte)(booking_1.bookings.appointmentDate, endDate));
            }
            const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            const [{ total }] = await database_1.db
                .select({ total: (0, drizzle_orm_1.count)() })
                .from(booking_1.bookings)
                .where(whereClause);
            const orderColumn = sortBy === "appointmentDate"
                ? booking_1.bookings.appointmentDate
                : sortBy === "status"
                    ? booking_1.bookings.status
                    : sortBy === "totalAmount"
                        ? booking_1.bookings.totalAmount
                        : booking_1.bookings.createdAt;
            const orderDirection = sortOrder === "asc" ? (0, drizzle_orm_1.asc)(orderColumn) : (0, drizzle_orm_1.desc)(orderColumn);
            const bookingList = await database_1.db
                .select({
                booking: booking_1.bookings,
                customer: {
                    id: user_1.users.id,
                    fullName: user_1.users.fullName,
                    email: user_1.users.email,
                    phone: user_1.users.phone,
                },
                stylist: stylist_1.stylists,
                service: service_1.services,
            })
                .from(booking_1.bookings)
                .leftJoin(user_1.users, (0, drizzle_orm_1.eq)(booking_1.bookings.customerId, user_1.users.id))
                .leftJoin(stylist_1.stylists, (0, drizzle_orm_1.eq)(booking_1.bookings.stylistId, stylist_1.stylists.id))
                .leftJoin(service_1.services, (0, drizzle_orm_1.eq)(booking_1.bookings.serviceId, service_1.services.id))
                .where(whereClause)
                .orderBy(orderDirection)
                .limit(limit)
                .offset(offset);
            const bookingsWithDetails = await Promise.all(bookingList.map(async (result) => {
                let stylistUserDetails = { fullName: "Unknown", email: "" };
                if (result.stylist?.userId) {
                    const [stylistUserResult] = await database_1.db
                        .select({
                        fullName: user_1.users.fullName,
                        email: user_1.users.email,
                    })
                        .from(user_1.users)
                        .where((0, drizzle_orm_1.eq)(user_1.users.id, result.stylist.userId))
                        .limit(1);
                    if (stylistUserResult) {
                        stylistUserDetails = stylistUserResult;
                    }
                }
                return {
                    ...result.booking,
                    customer: result.customer || {
                        id: "",
                        fullName: "Unknown",
                        email: "",
                        phone: "",
                    },
                    stylist: {
                        id: result.stylist?.id || "",
                        user: stylistUserDetails,
                        specialties: this.parseSpecialties(result.stylist?.specialties),
                        rating: parseFloat(result.stylist?.rating || "0"),
                    },
                    service: {
                        id: result.service?.id || "",
                        name: result.service?.name || "Unknown Service",
                        duration: result.service?.duration || 0,
                        price: parseFloat(result.service?.price || "0"),
                        category: result.service?.category || "",
                    },
                };
            }));
            return {
                bookings: bookingsWithDetails,
                total: Number(total),
            };
        }
        catch (error) {
            console.error("Booking query error:", error);
            return {
                bookings: [],
                total: 0,
            };
        }
    }
    async getBookingById(bookingId) {
        try {
            const stylistUser = user_1.users;
            const [result] = await database_1.db
                .select({
                booking: booking_1.bookings,
                customer: {
                    id: user_1.users.id,
                    fullName: user_1.users.fullName,
                    email: user_1.users.email,
                    phone: user_1.users.phone,
                },
                stylist: stylist_1.stylists,
                service: service_1.services,
            })
                .from(booking_1.bookings)
                .leftJoin(user_1.users, (0, drizzle_orm_1.eq)(booking_1.bookings.customerId, user_1.users.id))
                .leftJoin(stylist_1.stylists, (0, drizzle_orm_1.eq)(booking_1.bookings.stylistId, stylist_1.stylists.id))
                .leftJoin(service_1.services, (0, drizzle_orm_1.eq)(booking_1.bookings.serviceId, service_1.services.id))
                .where((0, drizzle_orm_1.eq)(booking_1.bookings.id, bookingId))
                .limit(1);
            if (!result) {
                return null;
            }
            let stylistUserDetails = { fullName: "", email: "" };
            if (result.stylist?.userId) {
                const [stylistUserResult] = await database_1.db
                    .select({
                    fullName: user_1.users.fullName,
                    email: user_1.users.email,
                })
                    .from(user_1.users)
                    .where((0, drizzle_orm_1.eq)(user_1.users.id, result.stylist.userId))
                    .limit(1);
                if (stylistUserResult) {
                    stylistUserDetails = stylistUserResult;
                }
            }
            return {
                ...result.booking,
                customer: result.customer,
                stylist: {
                    id: result.stylist?.id || "",
                    user: stylistUserDetails,
                    specialties: this.parseSpecialties(result.stylist?.specialties),
                    rating: parseFloat(result.stylist?.rating || "0"),
                },
                service: {
                    id: result.service?.id || "",
                    name: result.service?.name || "",
                    duration: result.service?.duration || 0,
                    price: parseFloat(result.service?.price || "0"),
                    category: result.service?.category || "",
                },
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to retrieve booking");
        }
    }
    async createBooking(bookingData) {
        try {
            const { customerId, stylistId, serviceId, appointmentDate, appointmentTime, notes, } = bookingData;
            const [customer] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_1.users.id, customerId), (0, drizzle_orm_1.eq)(user_1.users.role, "customer")))
                .limit(1);
            if (!customer) {
                throw new errorHandler_1.NotFoundError("Customer not found");
            }
            const [stylist] = await database_1.db
                .select()
                .from(stylist_1.stylists)
                .where((0, drizzle_orm_1.eq)(stylist_1.stylists.id, stylistId))
                .limit(1);
            if (!stylist) {
                throw new errorHandler_1.NotFoundError("Stylist not found");
            }
            const [service] = await database_1.db
                .select()
                .from(service_1.services)
                .where((0, drizzle_orm_1.eq)(service_1.services.id, serviceId))
                .limit(1);
            if (!service) {
                throw new errorHandler_1.NotFoundError("Service not found");
            }
            const isAvailable = await this.checkTimeSlotAvailability(stylistId, appointmentDate, appointmentTime, service.duration);
            if (!isAvailable) {
                throw new errorHandler_1.ConflictError("The selected time slot is not available");
            }
            const [hours, minutes] = appointmentTime.split(":").map(Number);
            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + service.duration;
            const endHours = Math.floor(endMinutes / 60);
            const endMins = endMinutes % 60;
            const endTime = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}:00`;
            const { createId } = await Promise.resolve().then(() => __importStar(require("@paralleldrive/cuid2")));
            const bookingId = createId();
            const newBookingData = {
                id: bookingId,
                customerId,
                stylistId,
                serviceId,
                appointmentDate,
                appointmentTime,
                endTime,
                status: "pending",
                totalAmount: service.price,
                notes,
            };
            await database_1.db.insert(booking_1.bookings).values(newBookingData);
            await this.logBookingHistory({
                bookingId: bookingId,
                action: "CREATED",
                newStatus: types_1.BookingStatus.PENDING,
                performedBy: customerId,
            });
            const booking = await this.getBookingById(bookingId);
            if (!booking) {
                throw new errorHandler_1.DatabaseError("Failed to create booking");
            }
            return booking;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError || error instanceof errorHandler_1.ConflictError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to create booking");
        }
    }
    async updateBooking(bookingId, updateData) {
        try {
            const existingBooking = await this.getBookingById(bookingId);
            if (!existingBooking) {
                throw new errorHandler_1.NotFoundError("Booking not found");
            }
            if (["completed", "cancelled"].includes(existingBooking.status)) {
                throw new errorHandler_1.BadRequestError("Cannot update completed or cancelled bookings");
            }
            if (updateData.appointmentDate || updateData.appointmentTime) {
                const appointmentDate = updateData.appointmentDate || existingBooking.appointmentDate;
                const appointmentTime = updateData.appointmentTime || existingBooking.appointmentTime;
                const isAvailable = await this.checkTimeSlotAvailability(existingBooking.stylistId, appointmentDate, appointmentTime, existingBooking.service.duration, bookingId);
                if (!isAvailable) {
                    throw new errorHandler_1.ConflictError("The selected time slot is not available");
                }
                if (updateData.appointmentTime) {
                    const [hours, minutes] = updateData.appointmentTime
                        .split(":")
                        .map(Number);
                    const startMinutes = hours * 60 + minutes;
                    const endMinutes = startMinutes + existingBooking.service.duration;
                    const endHours = Math.floor(endMinutes / 60);
                    const endMins = endMinutes % 60;
                    updateData = {
                        ...updateData,
                        endTime: `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}:00`,
                    };
                }
            }
            await database_1.db
                .update(booking_1.bookings)
                .set({
                ...updateData,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(booking_1.bookings.id, bookingId));
            await this.logBookingHistory({
                bookingId,
                action: "UPDATED",
                notes: "Booking details updated",
                performedBy: updateData.performedBy || existingBooking.customerId,
            });
            const updatedBooking = await this.getBookingById(bookingId);
            if (!updatedBooking) {
                throw new errorHandler_1.DatabaseError("Failed to update booking");
            }
            return updatedBooking;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError ||
                error instanceof errorHandler_1.ConflictError ||
                error instanceof errorHandler_1.BadRequestError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to update booking");
        }
    }
    async updateBookingStatus(bookingId, newStatus, performedBy, reason) {
        try {
            const existingBooking = await this.getBookingById(bookingId);
            if (!existingBooking) {
                throw new errorHandler_1.NotFoundError("Booking not found");
            }
            const previousStatus = existingBooking.status;
            if (!this.isValidStatusTransition(previousStatus, newStatus)) {
                throw new errorHandler_1.BadRequestError(`Cannot change status from ${previousStatus} to ${newStatus}`);
            }
            const updateData = {
                status: newStatus,
                updatedAt: new Date(),
            };
            switch (newStatus) {
                case "confirmed":
                    updateData.confirmedAt = new Date();
                    break;
                case "completed":
                    updateData.completedAt = new Date();
                    break;
                case "cancelled":
                    updateData.cancelledAt = new Date();
                    if (reason) {
                        updateData.cancelReason = reason;
                    }
                    break;
            }
            await database_1.db
                .update(booking_1.bookings)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(booking_1.bookings.id, bookingId));
            await this.logBookingHistory({
                bookingId,
                action: `STATUS_CHANGED_TO_${newStatus.toUpperCase()}`,
                previousStatus: previousStatus,
                newStatus,
                notes: reason,
                performedBy,
            });
            const updatedBooking = await this.getBookingById(bookingId);
            if (!updatedBooking) {
                throw new errorHandler_1.DatabaseError("Failed to update booking status");
            }
            return updatedBooking;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError || error instanceof errorHandler_1.BadRequestError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to update booking status");
        }
    }
    async cancelBooking(bookingId, reason, performedBy) {
        return this.updateBookingStatus(bookingId, types_1.BookingStatus.CANCELLED, performedBy, reason);
    }
    async checkTimeSlotAvailability(stylistId, appointmentDate, appointmentTime, duration, excludeBookingId) {
        try {
            const dayOfWeek = appointmentDate.getDay();
            const [schedule] = await database_1.db
                .select()
                .from(stylist_2.stylistSchedules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stylist_2.stylistSchedules.stylistId, stylistId), (0, drizzle_orm_1.eq)(stylist_2.stylistSchedules.dayOfWeek, dayOfWeek), (0, drizzle_orm_1.eq)(stylist_2.stylistSchedules.isAvailable, true)))
                .limit(1);
            const defaultStartTime = "09:00:00";
            const defaultEndTime = "18:00:00";
            if (!schedule && dayOfWeek === 0) {
                return false;
            }
            const startTime = schedule?.startTime || defaultStartTime;
            const endTime = schedule?.endTime || defaultEndTime;
            const appointmentMinutes = this.timeToMinutes(appointmentTime);
            const startMinutes = this.timeToMinutes(startTime);
            const endMinutes = this.timeToMinutes(endTime);
            const appointmentEndMinutes = appointmentMinutes + duration;
            if (appointmentMinutes < startMinutes ||
                appointmentEndMinutes > endMinutes) {
                return false;
            }
            const whereConditions = [
                (0, drizzle_orm_1.eq)(booking_1.bookings.stylistId, stylistId),
                (0, drizzle_orm_1.eq)(booking_1.bookings.appointmentDate, appointmentDate),
                (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(booking_1.bookings.status, types_1.BookingStatus.PENDING), (0, drizzle_orm_1.eq)(booking_1.bookings.status, types_1.BookingStatus.CONFIRMED), (0, drizzle_orm_1.eq)(booking_1.bookings.status, types_1.BookingStatus.IN_PROGRESS)),
            ];
            if (excludeBookingId) {
                whereConditions.push((0, drizzle_orm_1.ne)(booking_1.bookings.id, excludeBookingId));
            }
            const conflictingBookings = await database_1.db
                .select()
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.and)(...whereConditions));
            for (const booking of conflictingBookings) {
                const existingStart = this.timeToMinutes(booking.appointmentTime);
                const existingEnd = booking.endTime
                    ? this.timeToMinutes(booking.endTime)
                    : existingStart + 60;
                if ((appointmentMinutes >= existingStart &&
                    appointmentMinutes < existingEnd) ||
                    (appointmentEndMinutes > existingStart &&
                        appointmentEndMinutes <= existingEnd) ||
                    (appointmentMinutes <= existingStart &&
                        appointmentEndMinutes >= existingEnd)) {
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to check time slot availability");
        }
    }
    async getAvailableTimeSlots(stylistId, appointmentDate, serviceDuration) {
        try {
            const dayOfWeek = appointmentDate.getDay();
            const timeSlots = [];
            const [schedule] = await database_1.db
                .select()
                .from(stylist_2.stylistSchedules)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(stylist_2.stylistSchedules.stylistId, stylistId), (0, drizzle_orm_1.eq)(stylist_2.stylistSchedules.dayOfWeek, dayOfWeek), (0, drizzle_orm_1.eq)(stylist_2.stylistSchedules.isAvailable, true)))
                .limit(1);
            const defaultStartTime = "09:00:00";
            const defaultEndTime = "18:00:00";
            if (!schedule && dayOfWeek === 0) {
                return timeSlots;
            }
            const startTime = schedule?.startTime || defaultStartTime;
            const endTime = schedule?.endTime || defaultEndTime;
            const existingBookings = await database_1.db
                .select()
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(booking_1.bookings.stylistId, stylistId), (0, drizzle_orm_1.eq)(booking_1.bookings.appointmentDate, appointmentDate), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(booking_1.bookings.status, "pending"), (0, drizzle_orm_1.eq)(booking_1.bookings.status, "confirmed"), (0, drizzle_orm_1.eq)(booking_1.bookings.status, "in_progress"))));
            const startMinutes = this.timeToMinutes(startTime);
            const endMinutes = this.timeToMinutes(endTime);
            for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += 15) {
                const timeString = this.minutesToTime(minutes);
                const slotEndMinutes = minutes + serviceDuration;
                let isAvailable = true;
                let conflictReason = "";
                for (const booking of existingBookings) {
                    const bookingStart = this.timeToMinutes(booking.appointmentTime);
                    const bookingEnd = booking.endTime
                        ? this.timeToMinutes(booking.endTime)
                        : bookingStart + 60;
                    if ((minutes >= bookingStart && minutes < bookingEnd) ||
                        (slotEndMinutes > bookingStart && slotEndMinutes <= bookingEnd) ||
                        (minutes <= bookingStart && slotEndMinutes >= bookingEnd)) {
                        isAvailable = false;
                        conflictReason = "Time slot already booked";
                        break;
                    }
                }
                timeSlots.push({
                    time: timeString,
                    isAvailable,
                    reason: isAvailable ? undefined : conflictReason,
                });
            }
            return timeSlots;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to get available time slots");
        }
    }
    async getBookingStats() {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const [{ totalBookings }] = await database_1.db
                .select({ totalBookings: (0, drizzle_orm_1.count)() })
                .from(booking_1.bookings);
            const statusCounts = await database_1.db
                .select({
                status: booking_1.bookings.status,
                count: (0, drizzle_orm_1.count)(),
            })
                .from(booking_1.bookings)
                .groupBy(booking_1.bookings.status);
            const statusStats = {
                pendingBookings: 0,
                confirmedBookings: 0,
                completedBookings: 0,
                cancelledBookings: 0,
            };
            statusCounts.forEach((stat) => {
                const statusKey = `${stat.status}Bookings`;
                if (statusKey in statusStats) {
                    statusStats[statusKey] = Number(stat.count);
                }
            });
            const [{ todayBookings }] = await database_1.db
                .select({ todayBookings: (0, drizzle_orm_1.count)() })
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.gte)(booking_1.bookings.appointmentDate, startOfDay));
            const [{ thisWeekBookings }] = await database_1.db
                .select({ thisWeekBookings: (0, drizzle_orm_1.count)() })
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.gte)(booking_1.bookings.appointmentDate, startOfWeek));
            const [{ thisMonthBookings }] = await database_1.db
                .select({ thisMonthBookings: (0, drizzle_orm_1.count)() })
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.gte)(booking_1.bookings.appointmentDate, startOfMonth));
            const [{ averageBookingValue }] = await database_1.db
                .select({ averageBookingValue: (0, drizzle_orm_1.avg)(booking_1.bookings.totalAmount) })
                .from(booking_1.bookings)
                .where((0, drizzle_orm_1.eq)(booking_1.bookings.status, "completed"));
            const popularServices = await database_1.db
                .select({
                serviceId: booking_1.bookings.serviceId,
                serviceName: service_1.services.name,
                bookingCount: (0, drizzle_orm_1.count)(),
            })
                .from(booking_1.bookings)
                .leftJoin(service_1.services, (0, drizzle_orm_1.eq)(booking_1.bookings.serviceId, service_1.services.id))
                .groupBy(booking_1.bookings.serviceId, service_1.services.name)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.count)()))
                .limit(5);
            const busyHours = Array.from({ length: 10 }, (_, i) => ({
                hour: i + 9,
                bookingCount: Math.floor(Math.random() * 10),
            }));
            return {
                totalBookings: Number(totalBookings),
                ...statusStats,
                todayBookings: Number(todayBookings),
                thisWeekBookings: Number(thisWeekBookings),
                thisMonthBookings: Number(thisMonthBookings),
                averageBookingValue: Number(averageBookingValue) || 0,
                popularServices: popularServices.map((service) => ({
                    serviceId: service.serviceId,
                    serviceName: service.serviceName || "",
                    bookingCount: Number(service.bookingCount),
                })),
                busyHours,
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to retrieve booking statistics");
        }
    }
    async logBookingHistory(data) {
        try {
            await database_1.db.insert(booking_1.bookingHistory).values({
                bookingId: data.bookingId,
                action: data.action,
                previousStatus: data.previousStatus,
                newStatus: data.newStatus,
                notes: data.notes,
                performedBy: data.performedBy,
            });
        }
        catch (error) {
            console.error("Failed to log booking history:", error);
        }
    }
    isValidStatusTransition(from, to) {
        const validTransitions = {
            pending: [types_1.BookingStatus.CONFIRMED, types_1.BookingStatus.CANCELLED],
            confirmed: [
                types_1.BookingStatus.IN_PROGRESS,
                types_1.BookingStatus.COMPLETED,
                types_1.BookingStatus.CANCELLED,
                types_1.BookingStatus.NO_SHOW,
            ],
            in_progress: [types_1.BookingStatus.COMPLETED, types_1.BookingStatus.CANCELLED],
            completed: [],
            cancelled: [],
            no_show: [],
        };
        return validTransitions[from]?.includes(to) || false;
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    }
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
    }
}
exports.default = new BookingService();
//# sourceMappingURL=bookingService.js.map