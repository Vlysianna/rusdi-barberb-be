import { type User } from "../models/user";
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
declare class AuthService {
    private readonly saltRounds;
    private hashPassword;
    private comparePassword;
    private sanitizeUser;
    private generateTokens;
    register(userData: {
        email: string;
        password: string;
        fullName: string;
        phone?: string;
        role?: "admin" | "manager" | "stylist" | "customer";
    }): Promise<RegisterResponse>;
    login(email: string, password: string): Promise<LoginResponse>;
    refreshToken(refreshToken: string): Promise<{
        token: string;
        refreshToken: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    resetPassword(email: string, newPassword: string): Promise<void>;
    verifyEmail(userId: string): Promise<void>;
    deactivateAccount(userId: string): Promise<void>;
    activateAccount(userId: string): Promise<void>;
    getUserById(userId: string): Promise<SanitizedUser | null>;
    getUserByEmail(email: string): Promise<SanitizedUser | null>;
    updateProfile(userId: string, updateData: {
        fullName?: string;
        phone?: string;
        dateOfBirth?: Date;
        gender?: "male" | "female";
        address?: string;
        preferences?: string;
        avatar?: string;
    }): Promise<SanitizedUser>;
    generatePasswordResetOTP(email: string): string;
    verifyPasswordResetOTP(email: string, otp: string): {
        isValid: boolean;
        message: string;
    };
    resetPasswordWithOTP(email: string, otp: string, newPassword: string): Promise<void>;
    generatePasswordResetToken(email: string): string;
    verifyPasswordResetToken(token: string): {
        email: string;
        isValid: boolean;
    };
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=authService.d.ts.map