import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import authService from "../services/authService";
import { ApiResponseUtil } from "../utils/response";
import { asyncHandler } from "../middleware/errorHandler";

class AuthController {
  /**
   * Register a new user
   */
  register = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { email, password, fullName, phone, role } = req.body;

      const result = await authService.register({
        email,
        password,
        fullName,
        phone,
        role,
      });

      return ApiResponseUtil.created(
        res,
        result,
        "User registered successfully",
      );
    },
  );

  /**
   * Login user
   */
  login = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return ApiResponseUtil.success(res, "Login successful", result);
    },
  );

  /**
   * Refresh access token
   */
  refreshToken = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ApiResponseUtil.badRequest(res, "Refresh token is required");
      }

      const tokens = await authService.refreshToken(refreshToken);

      return ApiResponseUtil.success(
        res,
        "Token refreshed successfully",
        tokens,
      );
    },
  );

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;

      const user = await authService.getUserById(userId);

      if (!user) {
        return ApiResponseUtil.notFound(res, "User not found");
      }

      return ApiResponseUtil.success(
        res,
        "Profile retrieved successfully",
        user,
      );
    },
  );

  /**
   * Update user profile
   */
  updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const updateData = req.body;

      const updatedUser = await authService.updateProfile(userId, updateData);

      return ApiResponseUtil.updated(
        res,
        updatedUser,
        "Profile updated successfully",
      );
    },
  );

  /**
   * Change password
   */
  changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(userId, currentPassword, newPassword);

      return ApiResponseUtil.success(res, "Password changed successfully");
    },
  );

  /**
   * Request password reset
   */
  requestPasswordReset = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { email } = req.body;

      if (!email) {
        return ApiResponseUtil.badRequest(res, "Email is required");
      }

      // Check if user exists
      const user = await authService.getUserByEmail(email);

      if (!user) {
        // For security, we don't reveal if email exists or not
        return ApiResponseUtil.success(
          res,
          "If the email exists, a password reset link has been sent",
        );
      }

      // Generate password reset token
      const resetToken = authService.generatePasswordResetToken(email);

      // In a real application, you would send this token via email
      // For demo purposes, we'll return it in the response
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return ApiResponseUtil.success(
        res,
        "Password reset link has been sent to your email",
        {
          message: "Check your email for the reset link",
          // Remove this in production
          resetToken:
            process.env.NODE_ENV === "development" ? resetToken : undefined,
        },
      );
    },
  );

  /**
   * Reset password with token
   */
  resetPassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return ApiResponseUtil.badRequest(
          res,
          "Token and new password are required",
        );
      }

      // Verify reset token
      const { email, isValid } = authService.verifyPasswordResetToken(token);

      if (!isValid) {
        return ApiResponseUtil.badRequest(
          res,
          "Invalid or expired reset token",
        );
      }

      // Reset password
      await authService.resetPassword(email, newPassword);

      return ApiResponseUtil.success(res, "Password reset successfully");
    },
  );

  /**
   * Verify email
   */
  verifyEmail = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.userId;

      await authService.verifyEmail(userId);

      return ApiResponseUtil.success(res, "Email verified successfully");
    },
  );

  /**
   * Logout user (client-side token invalidation)
   */
  logout = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // In a stateless JWT implementation, logout is handled client-side by removing the token
      // In a more sophisticated setup, you might maintain a blacklist of tokens

      return ApiResponseUtil.success(res, "Logged out successfully", {
        message: "Please remove the token from your client storage",
      });
    },
  );

  /**
   * Get user by ID (Admin only)
   */
  getUserById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "User ID is required");
      }

      const user = await authService.getUserById(id);

      if (!user) {
        return ApiResponseUtil.notFound(res, "User not found");
      }

      return ApiResponseUtil.success(res, "User retrieved successfully", user);
    },
  );

  /**
   * Deactivate user account (Admin only)
   */
  deactivateAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "User ID is required");
      }

      await authService.deactivateAccount(id);

      return ApiResponseUtil.success(res, "Account deactivated successfully");
    },
  );

  /**
   * Activate user account (Admin only)
   */
  activateAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "User ID is required");
      }

      await authService.activateAccount(id);

      return ApiResponseUtil.success(res, "Account activated successfully");
    },
  );

  /**
   * Check authentication status
   */
  checkAuth = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      // If we reach here, the token is valid (middleware already verified it)
      const user = req.user;

      return ApiResponseUtil.success(res, "Authentication valid", {
        isAuthenticated: true,
        user: {
          userId: user!.userId,
          email: user!.email,
          role: user!.role,
        },
      });
    },
  );
}

export default new AuthController();
