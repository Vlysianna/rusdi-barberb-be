import { Router } from "express";
import authController from "../controllers/authController";
import {
  authenticateToken,
  adminOnly,
  resourceOwnerOrAdmin,
} from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateId,
  userValidation,
} from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

/**
 * Public routes (no authentication required)
 */

// POST /auth/register - Register new user
router.post(
  "/register",
  validateBody(userValidation.register),
  authController.register,
);

// POST /auth/login - User login
router.post("/login", validateBody(userValidation.login), authController.login);

// POST /auth/refresh - Refresh access token
router.post("/refresh", authController.refreshToken);

// POST /auth/forgot-password - Request password reset
router.post("/forgot-password", authController.requestPasswordReset);

// POST /auth/reset-password - Reset password with token
router.post("/reset-password", authController.resetPassword);

/**
 * Protected routes (authentication required)
 */

// GET /auth/profile - Get current user profile
router.get("/profile", authenticateToken, authController.getProfile);

// GET /auth/me - Get current user info (alias for profile)
router.get("/me", authenticateToken, authController.getProfile);

// PUT /auth/profile - Update current user profile
router.put(
  "/profile",
  authenticateToken,
  validateBody(userValidation.updateProfile),
  authController.updateProfile,
);

// POST /auth/change-password - Change password
router.post(
  "/change-password",
  authenticateToken,
  validateBody(userValidation.changePassword),
  authController.changePassword,
);

// POST /auth/verify-email - Verify email address
router.post("/verify-email", authenticateToken, authController.verifyEmail);

// POST /auth/logout - Logout user
router.post("/logout", authenticateToken, authController.logout);

// GET /auth/check - Check authentication status
router.get("/check", authenticateToken, authController.checkAuth);

/**
 * Admin only routes
 */

// GET /auth/users/:id - Get user by ID (Admin only)
router.get(
  "/users/:id",
  authenticateToken,
  adminOnly,
  validateId,
  authController.getUserById,
);

// PUT /auth/users/:id/deactivate - Deactivate user account (Admin only)
router.put(
  "/users/:id/deactivate",
  authenticateToken,
  adminOnly,
  validateId,
  authController.deactivateAccount,
);

// PUT /auth/users/:id/activate - Activate user account (Admin only)
router.put(
  "/users/:id/activate",
  authenticateToken,
  adminOnly,
  validateId,
  authController.activateAccount,
);

export default router;
