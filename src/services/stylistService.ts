import { eq, and, like, or, desc, asc, count, sql } from "drizzle-orm";
import { db } from "../config/database";
import {
  users,
  stylists,
  bookings,
  reviews,
  services,
  stylistServices,
  stylistSchedules,
} from "../models";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../middleware/errorHandler";
import { UserRole } from "../utils/types";
import bcrypt from "bcryptjs";

export interface CreateStylistData {
  userId?: string;
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
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

class StylistService {
  /**
   * Get all stylists with pagination and filters
   */
  async getAllStylists(filters?: StylistFilters) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        isAvailable,
        specialties,
      } = filters || {};

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            like(users.fullName, `%${search}%`),
            like(users.email, `%${search}%`),
          ),
        );
      }

      if (isAvailable !== undefined) {
        whereConditions.push(eq(stylists.isAvailable, isAvailable));
      }

      if (specialties && specialties.length > 0) {
        // For JSON column search, we need to use SQL function
        whereConditions.push(
          sql`JSON_OVERLAPS(${stylists.specialties}, ${JSON.stringify(specialties)})`,
        );
      }

      const baseQuery = db
        .select({
          id: stylists.id,
          userId: stylists.userId,
          specialties: stylists.specialties,
          experience: stylists.experience,
          commissionRate: stylists.commissionRate,
          isAvailable: stylists.isAvailable,
          schedule: stylists.schedule,
          bio: stylists.bio,
          rating: stylists.rating,
          totalBookings: stylists.totalBookings,
          revenue: stylists.revenue,
          createdAt: stylists.createdAt,
          updatedAt: stylists.updatedAt,
          user: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phone: users.phone,
            avatar: users.avatar,
            isActive: users.isActive,
            role: users.role,
          },
        })
        .from(stylists)
        .innerJoin(users, eq(stylists.userId, users.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(limit)
        .offset(offset);

      const stylistsResult = await baseQuery;

      // Get total count
      const totalQuery = db
        .select({ count: count() })
        .from(stylists)
        .innerJoin(users, eq(stylists.userId, users.id))
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined,
        );

      const [{ count: total }] = await totalQuery;

      return {
        stylists: stylistsResult,
        total,
      };
    } catch (error) {
      throw new Error(
        `Failed to get stylists: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get stylist by ID
   */
  async getStylistById(id: string) {
    try {
      const result = await db
        .select({
          id: stylists.id,
          userId: stylists.userId,
          specialties: stylists.specialties,
          experience: stylists.experience,
          commissionRate: stylists.commissionRate,
          isAvailable: stylists.isAvailable,
          schedule: stylists.schedule,
          bio: stylists.bio,
          rating: stylists.rating,
          totalBookings: stylists.totalBookings,
          revenue: stylists.revenue,
          createdAt: stylists.createdAt,
          updatedAt: stylists.updatedAt,
          user: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phone: users.phone,
            avatar: users.avatar,
            isActive: users.isActive,
            role: users.role,
          },
        })
        .from(stylists)
        .innerJoin(users, eq(stylists.userId, users.id))
        .where(eq(stylists.id, id))
        .limit(1);

      if (!result.length) {
        throw new NotFoundError("Stylist not found");
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to get stylist: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create new stylist
   */
  async createStylist(data: CreateStylistData) {
    try {
      let userId = data.userId;

      // Option 2: Create new user if no userId provided
      if (!userId && data.email && data.password && data.fullName) {
        // Check if email already exists
        const existingEmail = await db
          .select()
          .from(users)
          .where(eq(users.email, data.email))
          .limit(1);

        if (existingEmail.length) {
          throw new ConflictError("Email already registered");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create new user with stylist role
        const [newUser] = await db.insert(users).values({
          email: data.email,
          password: hashedPassword,
          fullName: data.fullName,
          phone: data.phone || null,
          role: UserRole.STYLIST,
          isActive: true,
          emailVerified: false,
        });

        // Get the created user ID
        const [createdUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, data.email))
          .limit(1);

        userId = createdUser.id;
      } else if (!userId) {
        throw new ValidationError("Either userId or user details (email, password, fullName) is required");
      } else {
        // Option 1: Use existing user
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!existingUser.length) {
          throw new NotFoundError("User not found");
        }

        // Update user role to stylist
        await db
          .update(users)
          .set({ role: UserRole.STYLIST })
          .where(eq(users.id, userId));
      }

      // Check if user is already a stylist
      const existingStylist = await db
        .select()
        .from(stylists)
        .where(eq(stylists.userId, userId))
        .limit(1);

      if (existingStylist.length) {
        throw new ConflictError("User is already a stylist");
      }

      // Create stylist record
      const stylistData = {
        userId: userId,
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

      const [insertResult] = await db.insert(stylists).values(stylistData);

      // Return created stylist with user data
      return await this.getStylistById(insertResult.insertId.toString());
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error(
        `Failed to create stylist: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update stylist
   */
  async updateStylist(id: string, data: UpdateStylistData) {
    try {
      // Check if stylist exists
      const existingStylist = await this.getStylistById(id);

      const updateData = {
        ...data,
        commissionRate: data.commissionRate
          ? data.commissionRate.toString()
          : undefined,
        updatedAt: new Date(),
      };

      await db.update(stylists).set(updateData).where(eq(stylists.id, id));

      return await this.getStylistById(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to update stylist: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete stylist
   */
  async deleteStylist(id: string) {
    try {
      const existingStylist = await this.getStylistById(id);

      // Check if stylist has active bookings
      const activeBookings = await db
        .select({ count: count() })
        .from(bookings)
        .where(
          and(
            eq(bookings.stylistId, id),
            or(
              eq(bookings.status, "pending"),
              eq(bookings.status, "confirmed"),
              eq(bookings.status, "in_progress"),
            ),
          ),
        );

      if (activeBookings[0].count > 0) {
        throw new ConflictError("Cannot delete stylist with active bookings");
      }

      // Update user role back to customer
      await db
        .update(users)
        .set({ role: UserRole.CUSTOMER })
        .where(eq(users.id, existingStylist.userId));

      // Delete stylist record
      await db.delete(stylists).where(eq(stylists.id, id));

      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(
        `Failed to delete stylist: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get available stylists for specific date/time
   */
  async getAvailableStylists(date: string, time: string) {
    try {
      const dayOfWeek = new Date(date)
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Get all available stylists
      const availableStylists = await db
        .select({
          id: stylists.id,
          userId: stylists.userId,
          schedule: stylists.schedule,
          specialties: stylists.specialties,
          experience: stylists.experience,
          rating: stylists.rating,
          user: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phone: users.phone,
            avatar: users.avatar,
          },
        })
        .from(stylists)
        .innerJoin(users, eq(stylists.userId, users.id))
        .where(eq(stylists.isAvailable, true));

      // Filter stylists who are working on this day and time
      const filteredStylists = availableStylists.filter((stylist) => {
        const schedule = stylist.schedule as any;
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
    } catch (error) {
      throw new Error(
        `Failed to get available stylists: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update stylist availability
   */
  async updateAvailability(id: string, isAvailable: boolean) {
    try {
      await this.getStylistById(id); // Check if exists

      await db
        .update(stylists)
        .set({
          isAvailable,
          updatedAt: new Date(),
        })
        .where(eq(stylists.id, id));

      return await this.getStylistById(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to update availability: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update stylist schedule
   */
  async updateSchedule(id: string, schedule: any) {
    try {
      await this.getStylistById(id); // Check if exists

      await db
        .update(stylists)
        .set({
          schedule,
          updatedAt: new Date(),
        })
        .where(eq(stylists.id, id));

      return await this.getStylistById(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to update schedule: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get stylist bookings
   */
  async getStylistBookings(
    stylistId: string,
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
  ) {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo } = filters;

      const offset = (page - 1) * limit;
      const whereConditions = [eq(bookings.stylistId, stylistId)];

      if (status) {
        whereConditions.push(eq(bookings.status, status as any));
      }

      if (dateFrom) {
        whereConditions.push(
          sql`DATE(${bookings.appointmentDate}) >= ${dateFrom}`,
        );
      }

      if (dateTo) {
        whereConditions.push(
          sql`DATE(${bookings.appointmentDate}) <= ${dateTo}`,
        );
      }

      // Get bookings
      const bookingsResult = await db
        .select({
          id: bookings.id,
          appointmentDate: bookings.appointmentDate,
          appointmentTime: bookings.appointmentTime,
          status: bookings.status,
          notes: bookings.notes,
          totalAmount: bookings.totalAmount,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .where(and(...whereConditions))
        .orderBy(desc(bookings.appointmentDate))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count: total }] = await db
        .select({ count: count() })
        .from(bookings)
        .where(and(...whereConditions));

      return {
        bookings: bookingsResult,
        total,
      };
    } catch (error) {
      throw new Error(
        `Failed to get stylist bookings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get stylist performance metrics
   */
  async getStylistPerformance(
    stylistId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<StylistPerformance> {
    try {
      const whereConditions = [eq(bookings.stylistId, stylistId)];

      if (dateFrom) {
        whereConditions.push(
          sql`DATE(${bookings.appointmentDate}) >= ${dateFrom}`,
        );
      }

      if (dateTo) {
        whereConditions.push(
          sql`DATE(${bookings.appointmentDate}) <= ${dateTo}`,
        );
      }

      // Get overall stats
      const stats = await db
        .select({
          totalBookings: count(),
          completedBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'completed' THEN 1 ELSE 0 END)`,
          cancelledBookings: sql<number>`SUM(CASE WHEN ${bookings.status} = 'cancelled' THEN 1 ELSE 0 END)`,
          totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${bookings.status} = 'completed' THEN ${bookings.totalAmount} ELSE 0 END), 0)`,
        })
        .from(bookings)
        .where(and(...whereConditions));

      // Get average rating
      const ratingResult = await db
        .select({
          avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        })
        .from(reviews)
        .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
        .where(eq(bookings.stylistId, stylistId));

      return {
        totalBookings: stats[0].totalBookings,
        completedBookings: stats[0].completedBookings,
        cancelledBookings: stats[0].cancelledBookings,
        totalRevenue: stats[0].totalRevenue.toString(),
        averageRating: ratingResult[0].avgRating,
        monthlyStats: [], // TODO: Implement monthly breakdown
      };
    } catch (error) {
      throw new Error(
        `Failed to get stylist performance: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get stylist earnings
   */
  async getStylistEarnings(
    stylistId: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<StylistEarnings> {
    try {
      const stylist = await this.getStylistById(stylistId);
      const commissionRate =
        parseFloat(stylist.commissionRate.toString()) / 100;

      const whereConditions = [
        eq(bookings.stylistId, stylistId),
        eq(bookings.status, "completed"),
      ];

      if (dateFrom) {
        whereConditions.push(
          sql`DATE(${bookings.appointmentDate}) >= ${dateFrom}`,
        );
      }

      if (dateTo) {
        whereConditions.push(
          sql`DATE(${bookings.appointmentDate}) <= ${dateTo}`,
        );
      }

      const stats = await db
        .select({
          totalBookings: count(),
          totalRevenue: sql<string>`COALESCE(SUM(${bookings.totalAmount}), 0)`,
        })
        .from(bookings)
        .where(and(...whereConditions));

      const totalRevenue = parseFloat(stats[0].totalRevenue);
      const commission = totalRevenue * commissionRate;
      const averageBookingValue =
        stats[0].totalBookings > 0 ? totalRevenue / stats[0].totalBookings : 0;

      return {
        totalEarnings: commission.toFixed(2),
        commission: commission.toFixed(2),
        totalBookings: stats[0].totalBookings,
        averageBookingValue: averageBookingValue.toFixed(2),
        monthlyBreakdown: [], // TODO: Implement monthly breakdown
      };
    } catch (error) {
      throw new Error(
        `Failed to get stylist earnings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get stylist reviews
   */
  async getStylistReviews(
    stylistId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    try {
      const offset = (page - 1) * limit;

      const reviewsResult = await db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          comment: reviews.comment,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
        .where(eq(bookings.stylistId, stylistId))
        .orderBy(desc(reviews.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ count: total }] = await db
        .select({ count: count() })
        .from(reviews)
        .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
        .where(eq(bookings.stylistId, stylistId));

      const [{ avgRating }] = await db
        .select({
          avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        })
        .from(reviews)
        .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
        .where(eq(bookings.stylistId, stylistId));

      return {
        reviews: reviewsResult,
        total,
        averageRating: avgRating,
      };
    } catch (error) {
      throw new Error(
        `Failed to get stylist reviews: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get all available specialties
   */
  async getStylistSpecialties() {
    try {
      // Get all unique specialties from all stylists
      const result = await db
        .select({ specialties: stylists.specialties })
        .from(stylists)
        .where(eq(stylists.isAvailable, true));

      const allSpecialties = new Set<string>();

      result.forEach((item) => {
        if (item.specialties && Array.isArray(item.specialties)) {
          item.specialties.forEach((specialty) =>
            allSpecialties.add(specialty),
          );
        }
      });

      return Array.from(allSpecialties).sort();
    } catch (error) {
      throw new Error(
        `Failed to get stylist specialties: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Assign service to stylist
   */
  async assignServiceToStylist(stylistId: string, serviceId: string) {
    try {
      // Check if stylist and service exist
      await this.getStylistById(stylistId);

      // Check if assignment already exists
      const existing = await db
        .select()
        .from(stylistServices)
        .where(
          and(
            eq(stylistServices.stylistId, stylistId),
            eq(stylistServices.serviceId, serviceId),
          ),
        )
        .limit(1);

      if (existing.length) {
        throw new ConflictError("Service is already assigned to this stylist");
      }

      // Create assignment
      await db.insert(stylistServices).values({
        stylistId,
        serviceId,
      });

      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(
        `Failed to assign service to stylist: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Remove service from stylist
   */
  async removeServiceFromStylist(stylistId: string, serviceId: string) {
    try {
      // Check if assignment exists
      const existing = await db
        .select()
        .from(stylistServices)
        .where(
          and(
            eq(stylistServices.stylistId, stylistId),
            eq(stylistServices.serviceId, serviceId),
          ),
        )
        .limit(1);

      if (!existing.length) {
        throw new NotFoundError("Service assignment not found");
      }

      // Remove assignment
      await db
        .delete(stylistServices)
        .where(
          and(
            eq(stylistServices.stylistId, stylistId),
            eq(stylistServices.serviceId, serviceId),
          ),
        );

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to remove service from stylist: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get all schedules for a stylist
   */
  async getStylistSchedules(stylistId: string) {
    try {
      // Verify stylist exists
      await this.getStylistById(stylistId);

      const schedules = await db
        .select()
        .from(stylistSchedules)
        .where(eq(stylistSchedules.stylistId, stylistId))
        .orderBy(asc(stylistSchedules.dayOfWeek));

      // Map dayOfWeek numbers to day names
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      return schedules.map(schedule => ({
        ...schedule,
        dayOfWeek: dayNames[schedule.dayOfWeek] || schedule.dayOfWeek.toString(),
      }));
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to get stylist schedules: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Add a schedule entry for a stylist
   */
  async addStylistSchedule(
    stylistId: string,
    scheduleData: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    },
  ) {
    try {
      // Verify stylist exists
      await this.getStylistById(stylistId);

      // Convert day name to number
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = dayNames.indexOf(scheduleData.dayOfWeek.toLowerCase());
      
      if (dayIndex === -1) {
        throw new ValidationError('Invalid day of week');
      }

      // Check if schedule for this day already exists
      const existing = await db
        .select()
        .from(stylistSchedules)
        .where(
          and(
            eq(stylistSchedules.stylistId, stylistId),
            eq(stylistSchedules.dayOfWeek, dayIndex),
          ),
        )
        .limit(1);

      if (existing.length) {
        throw new ConflictError('Schedule for this day already exists');
      }

      // Create schedule
      const [newSchedule] = await db.insert(stylistSchedules).values({
        stylistId,
        dayOfWeek: dayIndex,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        isAvailable: scheduleData.isAvailable ?? true,
      });

      // Fetch the created schedule
      const [created] = await db
        .select()
        .from(stylistSchedules)
        .where(
          and(
            eq(stylistSchedules.stylistId, stylistId),
            eq(stylistSchedules.dayOfWeek, dayIndex),
          ),
        )
        .limit(1);

      return {
        ...created,
        dayOfWeek: dayNames[created.dayOfWeek],
      };
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      throw new Error(
        `Failed to add stylist schedule: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update a schedule entry
   */
  async updateStylistScheduleEntry(
    stylistId: string,
    scheduleId: string,
    scheduleData: {
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
    },
  ) {
    try {
      // Verify stylist exists
      await this.getStylistById(stylistId);

      // Check if schedule exists
      const [existing] = await db
        .select()
        .from(stylistSchedules)
        .where(
          and(
            eq(stylistSchedules.id, scheduleId),
            eq(stylistSchedules.stylistId, stylistId),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new NotFoundError('Schedule not found');
      }

      // Update schedule
      await db
        .update(stylistSchedules)
        .set(scheduleData)
        .where(eq(stylistSchedules.id, scheduleId));

      // Fetch updated schedule
      const [updated] = await db
        .select()
        .from(stylistSchedules)
        .where(eq(stylistSchedules.id, scheduleId))
        .limit(1);

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return {
        ...updated,
        dayOfWeek: dayNames[updated.dayOfWeek],
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to update stylist schedule: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a schedule entry
   */
  async deleteStylistScheduleEntry(stylistId: string, scheduleId: string) {
    try {
      // Check if schedule exists
      const [existing] = await db
        .select()
        .from(stylistSchedules)
        .where(
          and(
            eq(stylistSchedules.id, scheduleId),
            eq(stylistSchedules.stylistId, stylistId),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new NotFoundError('Schedule not found');
      }

      // Delete schedule
      await db
        .delete(stylistSchedules)
        .where(eq(stylistSchedules.id, scheduleId));

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(
        `Failed to delete stylist schedule: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export default new StylistService();
