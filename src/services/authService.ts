import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users, type User, type NewUser } from "../models/user";
import jwtConfig from "../config/jwt";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../middleware/errorHandler";

// Frontend display user with uppercase role
interface SanitizedUser extends Omit<User, "password" | "role"> {
  role: "ADMIN" | "MANAGER" | "STYLIST" | "CUSTOMER";
}

export interface LoginResponse {
  user: SanitizedUser;
  token: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: SanitizedUser;
  token: string;
  refreshToken: string;
}

class AuthService {
  private readonly saltRounds = 12;

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare password with hash
   */
  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Remove password from user object and transform role to uppercase
   */
  private sanitizeUser(user: User): SanitizedUser {
    const { password, ...sanitizedUser } = user;
    return {
      ...sanitizedUser,
      role: sanitizedUser.role.toUpperCase() as
        | "ADMIN"
        | "MANAGER"
        | "STYLIST"
        | "CUSTOMER",
    };
  }

  /**
   * Generate tokens for user
   */
  private generateTokens(user: SanitizedUser, originalUser: User) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: originalUser.role, // Use original lowercase role for backend validation
    };

    const token = jwtConfig.generateToken(payload);
    const refreshToken = jwtConfig.generateRefreshToken(payload);

    return { token, refreshToken };
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: "admin" | "manager" | "stylist" | "customer";
  }): Promise<RegisterResponse> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
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
        isActive: true,
        emailVerified: false,
      };

      // Insert user into database
      const [insertResult] = await db.insert(users).values(newUserData);

      // Get the created user
      const [createdUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, insertResult.insertId.toString()))
        .limit(1);

      if (!createdUser) {
        throw new Error("Failed to create user");
      }

      // Remove password from response
      const sanitizedUser = this.sanitizeUser(createdUser);

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(
        sanitizedUser,
        createdUser,
      );

      return {
        user: sanitizedUser,
        token,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error("Registration failed");
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError("Account has been deactivated");
      }

      // Compare passwords
      const isPasswordValid = await this.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Remove password from response
      const sanitizedUser = this.sanitizeUser(user);

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(sanitizedUser, user);

      return {
        user: sanitizedUser,
        token,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError("Login failed");
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwtConfig.verifyToken(refreshToken);

      // Get user from database to ensure they still exist and are active
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user || !user.isActive) {
        throw new AuthenticationError("Invalid refresh token");
      }

      const sanitizedUser = this.sanitizeUser(user);

      // Generate new tokens
      const tokens = this.generateTokens(sanitizedUser, user);

      return tokens;
    } catch (error) {
      throw new AuthenticationError("Token refresh failed");
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(
        currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestError("Current password is incorrect");
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedNewPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new Error("Password change failed");
    }
  }

  /**
   * Reset password (for forgot password functionality)
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error("Password reset failed");
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          emailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      throw new Error("Email verification failed");
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      throw new Error("Account deactivation failed");
    }
  }

  /**
   * Activate user account
   */
  async activateAccount(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      throw new Error("Account activation failed");
    }
  }

  /**
   * Get user by ID (without password)
   */
  async getUserById(userId: string): Promise<SanitizedUser | null> {
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
      throw new Error("Failed to get user");
    }
  }

  /**
   * Get user by email (without password)
   */
  async getUserByEmail(email: string): Promise<SanitizedUser | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return null;
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error("Failed to get user");
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateData: {
      fullName?: string;
      phone?: string;
      dateOfBirth?: Date;
      gender?: "male" | "female";
      address?: string;
      preferences?: string;
      avatar?: string;
    },
  ): Promise<SanitizedUser> {
    try {
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
        throw new NotFoundError("User not found");
      }

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error("Profile update failed");
    }
  }

  /**
   * Generate password reset token (simplified version)
   * In production, you'd want to store this in database with expiration
   */
  generatePasswordResetToken(email: string): string {
    const payload = {
      email,
      type: "password_reset",
      timestamp: Date.now(),
    };

    return jwtConfig.generateToken(payload as any);
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token: string): { email: string; isValid: boolean } {
    try {
      const decoded = jwtConfig.verifyToken(token) as any;

      if (decoded.type !== "password_reset") {
        return { email: "", isValid: false };
      }

      // Check if token is not older than 1 hour
      const tokenAge = Date.now() - decoded.timestamp;
      const oneHour = 60 * 60 * 1000;

      if (tokenAge > oneHour) {
        return { email: "", isValid: false };
      }

      return { email: decoded.email, isValid: true };
    } catch (error) {
      return { email: "", isValid: false };
    }
  }
}

export default new AuthService();
