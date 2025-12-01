"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../config/database");
const user_1 = require("../models/user");
const jwt_1 = __importDefault(require("../config/jwt"));
const errorHandler_1 = require("../middleware/errorHandler");
const otpStorage = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of otpStorage.entries()) {
        if (data.expiresAt < now) {
            otpStorage.delete(key);
        }
    }
}, 5 * 60 * 1000);
class AuthService {
    constructor() {
        this.saltRounds = 12;
    }
    async hashPassword(password) {
        return await bcryptjs_1.default.hash(password, this.saltRounds);
    }
    async comparePassword(password, hash) {
        return await bcryptjs_1.default.compare(password, hash);
    }
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return {
            ...sanitizedUser,
            role: sanitizedUser.role.toUpperCase(),
        };
    }
    generateTokens(user, originalUser) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: originalUser.role,
        };
        const token = jwt_1.default.generateToken(payload);
        const refreshToken = jwt_1.default.generateRefreshToken(payload);
        return { token, refreshToken };
    }
    async register(userData) {
        try {
            const existingUser = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.email, userData.email))
                .limit(1);
            if (existingUser.length > 0) {
                throw new errorHandler_1.ConflictError("User with this email already exists");
            }
            const hashedPassword = await this.hashPassword(userData.password);
            const newUserData = {
                email: userData.email,
                password: hashedPassword,
                fullName: userData.fullName,
                phone: userData.phone,
                role: userData.role || "customer",
                isActive: true,
                emailVerified: false,
            };
            const insertResult = await database_1.db.insert(user_1.users).values(newUserData);
            const [createdUser] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.email, userData.email))
                .limit(1);
            if (!createdUser) {
                throw new Error("Failed to create user");
            }
            const sanitizedUser = this.sanitizeUser(createdUser);
            const { token, refreshToken } = this.generateTokens(sanitizedUser, createdUser);
            return {
                user: sanitizedUser,
                token,
                refreshToken,
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.ConflictError) {
                throw error;
            }
            console.error('Registration error details:', error);
            throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async login(email, password) {
        try {
            const [user] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.email, email))
                .limit(1);
            if (!user) {
                throw new errorHandler_1.AuthenticationError("Invalid email or password");
            }
            if (!user.isActive) {
                throw new errorHandler_1.AuthenticationError("Account has been deactivated");
            }
            const isPasswordValid = await this.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new errorHandler_1.AuthenticationError("Invalid email or password");
            }
            const sanitizedUser = this.sanitizeUser(user);
            const { token, refreshToken } = this.generateTokens(sanitizedUser, user);
            return {
                user: sanitizedUser,
                token,
                refreshToken,
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AuthenticationError) {
                throw error;
            }
            throw new errorHandler_1.AuthenticationError("Login failed");
        }
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = jwt_1.default.verifyToken(refreshToken);
            const [user] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, decoded.userId))
                .limit(1);
            if (!user || !user.isActive) {
                throw new errorHandler_1.AuthenticationError("Invalid refresh token");
            }
            const sanitizedUser = this.sanitizeUser(user);
            const tokens = this.generateTokens(sanitizedUser, user);
            return tokens;
        }
        catch (error) {
            throw new errorHandler_1.AuthenticationError("Token refresh failed");
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const [user] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId))
                .limit(1);
            if (!user) {
                throw new errorHandler_1.NotFoundError("User not found");
            }
            const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new errorHandler_1.BadRequestError("Current password is incorrect");
            }
            const hashedNewPassword = await this.hashPassword(newPassword);
            await database_1.db
                .update(user_1.users)
                .set({
                password: hashedNewPassword,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId));
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError || error instanceof errorHandler_1.BadRequestError) {
                throw error;
            }
            throw new Error("Password change failed");
        }
    }
    async resetPassword(email, newPassword) {
        try {
            const [user] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.email, email))
                .limit(1);
            if (!user) {
                throw new errorHandler_1.NotFoundError("User not found");
            }
            const hashedPassword = await this.hashPassword(newPassword);
            await database_1.db
                .update(user_1.users)
                .set({
                password: hashedPassword,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(user_1.users.id, user.id));
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new Error("Password reset failed");
        }
    }
    async verifyEmail(userId) {
        try {
            await database_1.db
                .update(user_1.users)
                .set({
                emailVerified: true,
                emailVerifiedAt: new Date(),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId));
        }
        catch (error) {
            throw new Error("Email verification failed");
        }
    }
    async deactivateAccount(userId) {
        try {
            await database_1.db
                .update(user_1.users)
                .set({
                isActive: false,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId));
        }
        catch (error) {
            throw new Error("Account deactivation failed");
        }
    }
    async activateAccount(userId) {
        try {
            await database_1.db
                .update(user_1.users)
                .set({
                isActive: true,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(user_1.users.id, userId));
        }
        catch (error) {
            throw new Error("Account activation failed");
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
            throw new Error("Failed to get user");
        }
    }
    async getUserByEmail(email) {
        try {
            const [user] = await database_1.db
                .select()
                .from(user_1.users)
                .where((0, drizzle_orm_1.eq)(user_1.users.email, email))
                .limit(1);
            if (!user) {
                return null;
            }
            return this.sanitizeUser(user);
        }
        catch (error) {
            throw new Error("Failed to get user");
        }
    }
    async updateProfile(userId, updateData) {
        try {
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
                throw new errorHandler_1.NotFoundError("User not found");
            }
            return this.sanitizeUser(updatedUser);
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new Error("Profile update failed");
        }
    }
    generatePasswordResetOTP(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000;
        otpStorage.set(email.toLowerCase(), {
            otp,
            email: email.toLowerCase(),
            expiresAt,
            attempts: 0,
        });
        console.log(`OTP generated for ${email}: ${otp} (expires in 10 minutes)`);
        return otp;
    }
    verifyPasswordResetOTP(email, otp) {
        const normalizedEmail = email.toLowerCase();
        const otpData = otpStorage.get(normalizedEmail);
        if (!otpData) {
            return { isValid: false, message: "Kode OTP tidak ditemukan. Silakan minta OTP baru." };
        }
        if (Date.now() > otpData.expiresAt) {
            otpStorage.delete(normalizedEmail);
            return { isValid: false, message: "Kode OTP sudah kadaluarsa. Silakan minta OTP baru." };
        }
        if (otpData.attempts >= 5) {
            otpStorage.delete(normalizedEmail);
            return { isValid: false, message: "Terlalu banyak percobaan. Silakan minta OTP baru." };
        }
        otpData.attempts += 1;
        if (otpData.otp !== otp) {
            return { isValid: false, message: `Kode OTP salah. Sisa percobaan: ${5 - otpData.attempts}` };
        }
        return { isValid: true, message: "Kode OTP valid." };
    }
    async resetPasswordWithOTP(email, otp, newPassword) {
        const verification = this.verifyPasswordResetOTP(email, otp);
        if (!verification.isValid) {
            throw new errorHandler_1.BadRequestError(verification.message);
        }
        const [user] = await database_1.db
            .select()
            .from(user_1.users)
            .where((0, drizzle_orm_1.eq)(user_1.users.email, email.toLowerCase()))
            .limit(1);
        if (!user) {
            throw new errorHandler_1.NotFoundError("User tidak ditemukan");
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await database_1.db
            .update(user_1.users)
            .set({
            password: hashedPassword,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(user_1.users.id, user.id));
        otpStorage.delete(email.toLowerCase());
        console.log(`Password reset successful for ${email}`);
    }
    generatePasswordResetToken(email) {
        const payload = {
            email,
            type: "password_reset",
            timestamp: Date.now(),
        };
        return jwt_1.default.generateToken(payload);
    }
    verifyPasswordResetToken(token) {
        try {
            const decoded = jwt_1.default.verifyToken(token);
            if (decoded.type !== "password_reset") {
                return { email: "", isValid: false };
            }
            const tokenAge = Date.now() - decoded.timestamp;
            const oneHour = 60 * 60 * 1000;
            if (tokenAge > oneHour) {
                return { email: "", isValid: false };
            }
            return { email: decoded.email, isValid: true };
        }
        catch (error) {
            return { email: "", isValid: false };
        }
    }
}
exports.default = new AuthService();
//# sourceMappingURL=authService.js.map