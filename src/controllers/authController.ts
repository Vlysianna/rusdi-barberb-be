import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import authService from "../services/authService";
import emailService from "../services/emailService";
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
   * Request password reset - sends OTP via email
   */
  requestPasswordReset = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { email } = req.body;

      if (!email) {
        return ApiResponseUtil.badRequest(res, "Email wajib diisi");
      }

      // Check if user exists
      const user = await authService.getUserByEmail(email);

      if (!user) {
        // For security, we still return success but don't reveal if email exists
        return ApiResponseUtil.success(
          res,
          "Jika email terdaftar, kode OTP telah dikirim",
        );
      }

      // Generate OTP
      const otp = authService.generatePasswordResetOTP(email);

      // Send OTP via email
      const emailSent = await emailService.sendPasswordResetOTP(
        email,
        otp,
        user.fullName,
      );

      if (!emailSent) {
        console.error(`Failed to send OTP email to ${email}`);
        return ApiResponseUtil.error(
          res,
          "Gagal mengirim kode OTP. Silakan coba lagi.",
          undefined,
          500,
        );
      }

      console.log(`OTP email sent to ${email}`);

      return ApiResponseUtil.success(
        res,
        "Kode OTP telah dikirim ke email Anda",
        {
          message: "Periksa email Anda untuk kode OTP",
          // Only show OTP in development mode for testing
          otp: process.env.NODE_ENV === "development" ? otp : undefined,
        },
      );
    },
  );

  /**
   * Verify OTP only (without resetting password)
   */
  verifyOTP = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return ApiResponseUtil.badRequest(res, "Email dan kode OTP wajib diisi");
      }

      const result = authService.verifyPasswordResetOTP(email, otp);

      if (!result.isValid) {
        return ApiResponseUtil.badRequest(res, result.message);
      }

      return ApiResponseUtil.success(res, "Kode OTP valid", {
        verified: true,
      });
    },
  );

  /**
   * Reset password with OTP
   */
  resetPassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { email, otp, newPassword } = req.body;

      // Support both old token-based and new OTP-based reset
      if (req.body.token) {
        // Old token-based flow
        const { token, newPassword: password } = req.body;
        
        if (!token || !password) {
          return ApiResponseUtil.badRequest(
            res,
            "Token dan password baru wajib diisi",
          );
        }

        const { email: tokenEmail, isValid } = authService.verifyPasswordResetToken(token);

        if (!isValid) {
          return ApiResponseUtil.badRequest(
            res,
            "Token tidak valid atau sudah kadaluarsa",
          );
        }

        await authService.resetPassword(tokenEmail, password);
        return ApiResponseUtil.success(res, "Password berhasil direset");
      }

      // New OTP-based flow
      if (!email || !otp || !newPassword) {
        return ApiResponseUtil.badRequest(
          res,
          "Email, kode OTP, dan password baru wajib diisi",
        );
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return ApiResponseUtil.badRequest(
          res,
          "Password minimal 6 karakter",
        );
      }

      try {
        await authService.resetPasswordWithOTP(email, otp, newPassword);
        return ApiResponseUtil.success(res, "Password berhasil direset");
      } catch (error: any) {
        return ApiResponseUtil.badRequest(res, error.message || "Gagal reset password");
      }
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
