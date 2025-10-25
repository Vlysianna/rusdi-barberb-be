import { eq, like, and, or, count, desc, asc, gte, inArray } from "drizzle-orm";
import { db } from "../config/database";
import { users, type User, type NewUser } from "../models/user";
import bcrypt from "bcryptjs";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  DatabaseError,
} from "../middleware/errorHandler";
import { UserRole } from "../utils/types";

interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface SearchUsersParams {
  query: string;
  page: number;
  limit: number;
}

interface UserActivity {
  id: string;
  action: string;
  timestamp: Date;
  details?: any;
}

interface GetUserActivityResult {
  activities: UserActivity[];
  total: number;
}

interface GetUsersResult {
  users: Omit<User, "password">[];
  total: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: {
    admin: number;
    stylist: number;
    customer: number;
  };
  newUsersThisMonth: number;
  newUsersToday: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

class UserService {
  private readonly saltRounds = 12;

  /**
   * Remove password from user object
   */
  private sanitizeUser(user: User): Omit<User, "password"> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Get users with pagination and filters
   */
  async getUsers(params: GetUsersParams): Promise<GetUsersResult> {
    try {
      const { page, limit, search, role, isActive, sortBy, sortOrder } = params;
      const offset = (page - 1) * limit;

      // Build where conditions
      let whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            like(users.fullName, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.phone, `%${search}%`),
          ),
        );
      }

      if (role) {
        whereConditions.push(eq(users.role, role as any));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(users.isActive, isActive));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ total: count() })
        .from(users)
        .where(whereClause);
      const total = totalResult[0]?.total || 0;

      // Build order clause
      const orderColumn =
        sortBy === "fullName"
          ? users.fullName
          : sortBy === "email"
            ? users.email
            : sortBy === "role"
              ? users.role
              : users.createdAt;

      const orderDirection =
        sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);

      // Get users
      const userList = await db
        .select()
        .from(users)
        .where(whereClause)
        .orderBy(orderDirection)
        .limit(limit)
        .offset(offset);

      const sanitizedUsers = userList.map((user) => this.sanitizeUser(user));

      return {
        users: sanitizedUsers,
        total: Number(total),
      };
    } catch (error) {
      throw new DatabaseError("Failed to retrieve users");
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, "password"> | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return null;
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new DatabaseError("Failed to retrieve user");
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
    dateOfBirth?: Date;
    gender?: "male" | "female";
    address?: string;
    preferences?: string;
  }): Promise<Omit<User, "password">> {
    try {
      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user data
      const newUserData: NewUser = {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        phone: userData.phone,
        role: userData.role || "customer",
        dateOfBirth: userData.dateOfBirth,
        gender: userData.gender,
        address: userData.address,
        preferences: userData.preferences,
        isActive: true,
        emailVerified: false,
      };

      // Insert user
      const [insertResult] = await db.insert(users).values(newUserData);

      // Get created user
      const [createdUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, insertResult.insertId.toString()))
        .limit(1);

      if (!createdUser) {
        throw new DatabaseError("Failed to create user");
      }

      return this.sanitizeUser(createdUser);
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError("Failed to create user");
    }
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    updateData: {
      fullName?: string;
      phone?: string;
      dateOfBirth?: Date;
      gender?: "male" | "female";
      address?: string;
      preferences?: string;
      isActive?: boolean;
      emailVerified?: boolean;
      role?: UserRole;
    },
  ): Promise<Omit<User, "password">> {
    try {
      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!existingUser) {
        throw new NotFoundError("User not found");
      }

      // Update user
      await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Get updated user
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!updatedUser) {
        throw new DatabaseError("Failed to update user");
      }

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to update user");
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!existingUser) {
        throw new NotFoundError("User not found");
      }

      // Soft delete by setting inactive
      await db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete user");
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(
    userId: string,
    file: any,
  ): Promise<Omit<User, "password">> {
    try {
      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!existingUser) {
        throw new NotFoundError("User not found");
      }

      // In a real implementation, you would:
      // 1. Validate file type and size
      // 2. Upload to cloud storage (AWS S3, Cloudinary, etc.)
      // 3. Generate thumbnail versions
      // 4. Delete old avatar if exists

      const avatarUrl = `/uploads/avatars/${userId}_${Date.now()}_${file.originalname}`;

      // Update user with avatar URL
      await db
        .update(users)
        .set({
          avatar: avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Get updated user
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!updatedUser) {
        throw new DatabaseError("Failed to update user avatar");
      }

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to upload avatar");
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      // Total users
      const totalUsersResult = await db
        .select({ totalUsers: count() })
        .from(users);
      const totalUsers = totalUsersResult[0]?.totalUsers || 0;

      // Active users
      const activeUsersResult = await db
        .select({ activeUsers: count() })
        .from(users)
        .where(eq(users.isActive, true));
      const activeUsers = activeUsersResult[0]?.activeUsers || 0;

      // Users by role
      const roleStats = await db
        .select({
          role: users.role,
          count: count(),
        })
        .from(users)
        .where(eq(users.isActive, true))
        .groupBy(users.role);

      const usersByRole = {
        admin: 0,
        stylist: 0,
        customer: 0,
      };

      roleStats.forEach((stat) => {
        if (stat.role in usersByRole) {
          usersByRole[stat.role as keyof typeof usersByRole] = Number(
            stat.count,
          );
        }
      });

      // New users this month
      const newUsersThisMonthResult = await db
        .select({ newUsersThisMonth: count() })
        .from(users)
        .where(
          and(eq(users.isActive, true), gte(users.createdAt, startOfMonth)),
        );
      const newUsersThisMonth =
        newUsersThisMonthResult[0]?.newUsersThisMonth || 0;

      // New users today
      const newUsersTodayResult = await db
        .select({ newUsersToday: count() })
        .from(users)
        .where(and(eq(users.isActive, true), gte(users.createdAt, startOfDay)));
      const newUsersToday = newUsersTodayResult[0]?.newUsersToday || 0;

      // Verified users
      const verifiedUsersResult = await db
        .select({ verifiedUsers: count() })
        .from(users)
        .where(and(eq(users.isActive, true), eq(users.emailVerified, true)));
      const verifiedUsers = verifiedUsersResult[0]?.verifiedUsers || 0;

      // Unverified users
      const unverifiedUsersResult = await db
        .select({ unverifiedUsers: count() })
        .from(users)
        .where(and(eq(users.isActive, true), eq(users.emailVerified, false)));
      const unverifiedUsers = unverifiedUsersResult[0]?.unverifiedUsers || 0;

      return {
        totalUsers: Number(totalUsers),
        activeUsers: Number(activeUsers),
        usersByRole,
        newUsersThisMonth: Number(newUsersThisMonth),
        newUsersToday: Number(newUsersToday),
        verifiedUsers: Number(verifiedUsers),
        unverifiedUsers: Number(unverifiedUsers),
      };
    } catch (error) {
      throw new DatabaseError("Failed to retrieve user statistics");
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds: string[], updateData: any): Promise<number> {
    try {
      const result = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(inArray(users.id, userIds));

      return (result as any).affectedRows || 0;
    } catch (error) {
      throw new DatabaseError("Failed to bulk update users");
    }
  }

  /**
   * Search users
   */
  async searchUsers(params: SearchUsersParams): Promise<GetUsersResult> {
    try {
      const { query, page, limit } = params;
      const offset = (page - 1) * limit;

      const searchCondition = or(
        like(users.fullName, `%${query}%`),
        like(users.email, `%${query}%`),
        like(users.phone, `%${query}%`),
      );

      // Get total count
      const totalResult = await db
        .select({ total: count() })
        .from(users)
        .where(and(searchCondition, eq(users.isActive, true)));
      const total = totalResult[0]?.total || 0;

      // Get users
      const userList = await db
        .select()
        .from(users)
        .where(and(searchCondition, eq(users.isActive, true)))
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const sanitizedUsers = userList.map((user) => this.sanitizeUser(user));

      return {
        users: sanitizedUsers,
        total: Number(total),
      };
    } catch (error) {
      throw new DatabaseError("Failed to search users");
    }
  }

  /**
   * Get user activity history (mock implementation)
   */
  async getUserActivity(
    userId: string,
    params: { page: number; limit: number },
  ): Promise<GetUserActivityResult> {
    try {
      // Check if user exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Mock activity data - in real implementation, you'd have an activity log table
      const activities: UserActivity[] = [
        {
          id: "1",
          action: "LOGIN",
          timestamp: new Date(),
          details: { ip: "192.168.1.1", userAgent: "Chrome" },
        },
        {
          id: "2",
          action: "PROFILE_UPDATE",
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          details: { fields: ["fullName", "phone"] },
        },
      ];

      return {
        activities,
        total: activities.length,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError("Failed to retrieve user activity");
    }
  }

  /**
   * Export users data
   */
  async exportUsers(format: string): Promise<string> {
    try {
      const allUsers = await db
        .select()
        .from(users)
        .where(eq(users.isActive, true));

      const sanitizedUsers = allUsers.map((user) => this.sanitizeUser(user));

      if (format === "csv") {
        const headers = [
          "ID",
          "Email",
          "Full Name",
          "Phone",
          "Role",
          "Created At",
        ];
        const csvRows = [headers.join(",")];

        sanitizedUsers.forEach((user) => {
          const row = [
            user.id,
            user.email,
            user.fullName,
            user.phone || "",
            user.role,
            user.createdAt.toISOString(),
          ];
          csvRows.push(row.join(","));
        });

        return csvRows.join("\n");
      } else {
        return JSON.stringify(sanitizedUsers, null, 2);
      }
    } catch (error) {
      throw new DatabaseError("Failed to export users");
    }
  }
}

export default new UserService();
