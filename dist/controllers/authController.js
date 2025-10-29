"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = __importDefault(require("../services/authService"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    constructor() {
        this.register = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { email, password, fullName, phone, role } = req.body;
            const result = await authService_1.default.register({
                email,
                password,
                fullName,
                phone,
                role,
            });
            return response_1.ApiResponseUtil.created(res, result, "User registered successfully");
        });
        this.login = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { email, password } = req.body;
            const result = await authService_1.default.login(email, password);
            return response_1.ApiResponseUtil.success(res, "Login successful", result);
        });
        this.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return response_1.ApiResponseUtil.badRequest(res, "Refresh token is required");
            }
            const tokens = await authService_1.default.refreshToken(refreshToken);
            return response_1.ApiResponseUtil.success(res, "Token refreshed successfully", tokens);
        });
        this.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const userId = req.user.userId;
            const user = await authService_1.default.getUserById(userId);
            if (!user) {
                return response_1.ApiResponseUtil.notFound(res, "User not found");
            }
            return response_1.ApiResponseUtil.success(res, "Profile retrieved successfully", user);
        });
        this.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const userId = req.user.userId;
            const updateData = req.body;
            const updatedUser = await authService_1.default.updateProfile(userId, updateData);
            return response_1.ApiResponseUtil.updated(res, updatedUser, "Profile updated successfully");
        });
        this.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;
            await authService_1.default.changePassword(userId, currentPassword, newPassword);
            return response_1.ApiResponseUtil.success(res, "Password changed successfully");
        });
        this.requestPasswordReset = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { email } = req.body;
            if (!email) {
                return response_1.ApiResponseUtil.badRequest(res, "Email is required");
            }
            const user = await authService_1.default.getUserByEmail(email);
            if (!user) {
                return response_1.ApiResponseUtil.success(res, "If the email exists, a password reset link has been sent");
            }
            const resetToken = authService_1.default.generatePasswordResetToken(email);
            console.log(`Password reset token for ${email}: ${resetToken}`);
            return response_1.ApiResponseUtil.success(res, "Password reset link has been sent to your email", {
                message: "Check your email for the reset link",
                resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
            });
        });
        this.resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return response_1.ApiResponseUtil.badRequest(res, "Token and new password are required");
            }
            const { email, isValid } = authService_1.default.verifyPasswordResetToken(token);
            if (!isValid) {
                return response_1.ApiResponseUtil.badRequest(res, "Invalid or expired reset token");
            }
            await authService_1.default.resetPassword(email, newPassword);
            return response_1.ApiResponseUtil.success(res, "Password reset successfully");
        });
        this.verifyEmail = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const userId = req.user.userId;
            await authService_1.default.verifyEmail(userId);
            return response_1.ApiResponseUtil.success(res, "Email verified successfully");
        });
        this.logout = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            return response_1.ApiResponseUtil.success(res, "Logged out successfully", {
                message: "Please remove the token from your client storage",
            });
        });
        this.getUserById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "User ID is required");
            }
            const user = await authService_1.default.getUserById(id);
            if (!user) {
                return response_1.ApiResponseUtil.notFound(res, "User not found");
            }
            return response_1.ApiResponseUtil.success(res, "User retrieved successfully", user);
        });
        this.deactivateAccount = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "User ID is required");
            }
            await authService_1.default.deactivateAccount(id);
            return response_1.ApiResponseUtil.success(res, "Account deactivated successfully");
        });
        this.activateAccount = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "User ID is required");
            }
            await authService_1.default.activateAccount(id);
            return response_1.ApiResponseUtil.success(res, "Account activated successfully");
        });
        this.checkAuth = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const user = req.user;
            return response_1.ApiResponseUtil.success(res, "Authentication valid", {
                isAuthenticated: true,
                user: {
                    userId: user.userId,
                    email: user.email,
                    role: user.role,
                },
            });
        });
    }
}
exports.default = new AuthController();
//# sourceMappingURL=authController.js.map