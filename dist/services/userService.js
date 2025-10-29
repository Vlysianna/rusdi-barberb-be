"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const user_1 = require("../models/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errorHandler_1 = require("../middleware/errorHandler");
class UserService {
    constructor() {
        this.saltRounds = 12;
    }
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }
    async hashPassword(password) {
        return await bcryptjs_1.default.hash(password, this.saltRounds);
    }
    async getUsers(params) {
        try {
            const { page, limit, search, role, isActive, sortBy, sortOrder } = params;
            const offset = (page - 1) * limit;
            let whereConditions = [];
            if (search) {
                whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(user_1.users.fullName, `%${search}%`), (0, drizzle_orm_1.like)(user_1.users.email, `%${search}%`), (0, drizzle_orm_1.like)(user_1.users.phone, `%${search}%`)));
            }
            if (role) {
                whereConditions.push((0, drizzle_orm_1.eq)(user_1.users.role, role));
            }
            if (isActive !== undefined) {
                whereConditions.push((0, drizzle_orm_1.eq)(user_1.users.isActive, isActive));
            }
            const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            const totalResult = await database_1.db
                .select({ total: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where(whereClause);
            const total = totalResult[0]?.total || 0;
            const orderColumn = sortBy === "fullName"
                ? user_1.users.fullName
                : sortBy === "email"
                    ? user_1.users.email
                    : sortBy === "role"
                        ? user_1.users.role
                        : user_1.users.createdAt;
            const orderDirection = sortOrder === "asc" ? (0, drizzle_orm_1.asc)(orderColumn) : (0, drizzle_orm_1.desc)(orderColumn);
            const userList = await database_1.db
                .select()
                .from(user_1.users)
                .where(whereClause)
                .orderBy(orderDirection)
                .limit(limit)
                .offset(offset);
            const sanitizedUsers = userList.map((user) => this.sanitizeUser(user));
            return {
                users: sanitizedUsers,
                total: Number(total),
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to retrieve users");
        }
    }
    async getUserById(userId) {
        try {
            const [user] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId))
                .limit(1);
            if (!user) {
                return null;
            }
            return this.sanitizeUser(user);
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to retrieve user");
        }
    }
    async createUser(userData) {
        try {
            const [existingUser] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.email, userData.email))
                .limit(1);
            if (existingUser) {
                throw new errorHandler_1.ConflictError("User with this email already exists");
            }
            const hashedPassword = await this.hashPassword(userData.password);
            const newUserData = {
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
            const [insertResult] = await database_1.db.insert(user_1.users).values(newUserData);
            const [createdUser] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, insertResult.insertId.toString()))
                .limit(1);
            if (!createdUser) {
                throw new errorHandler_1.DatabaseError("Failed to create user");
            }
            return this.sanitizeUser(createdUser);
        }
        catch (error) {
            if (error instanceof errorHandler_1.ConflictError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to create user");
        }
    }
    async updateUser(userId, updateData) {
        try {
            const [existingUser] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId))
                .limit(1);
            if (!existingUser) {
                throw new errorHandler_1.NotFoundError("User not found");
            }
            await database_1.db
                .update(user_1.users)
                .set({
                ...updateData,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId));
            const [updatedUser] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId))
                .limit(1);
            if (!updatedUser) {
                throw new errorHandler_1.DatabaseError("Failed to update user");
            }
            return this.sanitizeUser(updatedUser);
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to update user");
        }
    }
    async deleteUser(userId) {
        try {
            const [existingUser] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId))
                .limit(1);
            if (!existingUser) {
                throw new errorHandler_1.NotFoundError("User not found");
            }
            await database_1.db
                .update(user_1.users)
                .set({
                isActive: false,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId));
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to delete user");
        }
    }
    async uploadAvatar(userId, file) {
        try {
            const [existingUser] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId))
                .limit(1);
            if (!existingUser) {
                throw new errorHandler_1.NotFoundError("User not found");
            }
            const avatarUrl = `/uploads/avatars/${userId}_${Date.now()}_${file.originalname}`;
            await database_1.db
                .update(user_1.users)
                .set({
                avatar: avatarUrl,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId));
            const [updatedUser] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId))
                .limit(1);
            if (!updatedUser) {
                throw new errorHandler_1.DatabaseError("Failed to update user avatar");
            }
            return this.sanitizeUser(updatedUser);
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to upload avatar");
        }
    }
    async getUserStats() {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const totalUsersResult = await database_1.db
                .select({ totalUsers: (0, drizzle_orm_1.count)() })
                .from(user_1.users);
            const totalUsers = totalUsersResult[0]?.totalUsers || 0;
            const activeUsersResult = await database_1.db
                .select({ activeUsers: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.isActive, true));
            const activeUsers = activeUsersResult[0]?.activeUsers || 0;
            const roleStats = await database_1.db
                .select({
                role: user_1.users.role,
                count: (0, drizzle_orm_1.count)(),
            })
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.isActive, true))
                .groupBy(user_1.users.role);
            const usersByRole = {
                admin: 0,
                stylist: 0,
                customer: 0,
            };
            roleStats.forEach((stat) => {
                if (stat.role in usersByRole) {
                    usersByRole[stat.role] = Number(stat.count);
                }
            });
            const newUsersThisMonthResult = await database_1.db
                .select({ newUsersThisMonth: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_1.users.isActive, true), (0, drizzle_orm_1.gte)(user_1.users.createdAt, startOfMonth)));
            const newUsersThisMonth = newUsersThisMonthResult[0]?.newUsersThisMonth || 0;
            const newUsersTodayResult = await database_1.db
                .select({ newUsersToday: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_1.users.isActive, true), (0, drizzle_orm_1.gte)(user_1.users.createdAt, startOfDay)));
            const newUsersToday = newUsersTodayResult[0]?.newUsersToday || 0;
            const verifiedUsersResult = await database_1.db
                .select({ verifiedUsers: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_1.users.isActive, true), (0, drizzle_orm_1.eq)(user_1.users.emailVerified, true)));
            const verifiedUsers = verifiedUsersResult[0]?.verifiedUsers || 0;
            const unverifiedUsersResult = await database_1.db
                .select({ unverifiedUsers: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_1.users.isActive, true), (0, drizzle_orm_1.eq)(user_1.users.emailVerified, false)));
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
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to retrieve user statistics");
        }
    }
    async bulkUpdateUsers(userIds, updateData) {
        try {
            const result = await database_1.db
                .update(user_1.users)
                .set({
                ...updateData,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.inArray)(user_1.users.id, userIds));
            return result.affectedRows || 0;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to bulk update users");
        }
    }
    async searchUsers(params) {
        try {
            const { query, page, limit } = params;
            const offset = (page - 1) * limit;
            const searchCondition = (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(user_1.users.fullName, `%${query}%`), (0, drizzle_orm_1.like)(user_1.users.email, `%${query}%`), (0, drizzle_orm_1.like)(user_1.users.phone, `%${query}%`));
            const totalResult = await database_1.db
                .select({ total: (0, drizzle_orm_1.count)() })
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)(searchCondition, (0, drizzle_orm_1.eq)(user_1.users.isActive, true)));
            const total = totalResult[0]?.total || 0;
            const userList = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.and)(searchCondition, (0, drizzle_orm_1.eq)(user_1.users.isActive, true)))
                .orderBy((0, drizzle_orm_1.desc)(user_1.users.createdAt))
                .limit(limit)
                .offset(offset);
            const sanitizedUsers = userList.map((user) => this.sanitizeUser(user));
            return {
                users: sanitizedUsers,
                total: Number(total),
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to search users");
        }
    }
    async getUserActivity(userId, params) {
        try {
            const [user] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId))
                .limit(1);
            if (!user) {
                throw new errorHandler_1.NotFoundError("User not found");
            }
            const activities = [
                {
                    id: "1",
                    action: "LOGIN",
                    timestamp: new Date(),
                    details: { ip: "192.168.1.1", userAgent: "Chrome" },
                },
                {
                    id: "2",
                    action: "PROFILE_UPDATE",
                    timestamp: new Date(Date.now() - 86400000),
                    details: { fields: ["fullName", "phone"] },
                },
            ];
            return {
                activities,
                total: activities.length,
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError("Failed to retrieve user activity");
        }
    }
    async exportUsers(format) {
        try {
            const allUsers = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.isActive, true));
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
            }
            else {
                return JSON.stringify(sanitizedUsers, null, 2);
            }
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError("Failed to export users");
        }
    }
}
exports.default = new UserService();
//# sourceMappingURL=userService.js.map