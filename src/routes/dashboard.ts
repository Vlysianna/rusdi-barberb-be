import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticateToken, adminOnly } from "../middleware/auth";

const router = Router();

/**
 * Dashboard Routes
 * All dashboard routes require authentication and admin role
 */

// GET /dashboard/stats - Get dashboard statistics (Admin only)
router.get(
  "/stats",
  authenticateToken,
  adminOnly,
  dashboardController.getDashboardStats,
);

// GET /dashboard/revenue - Get revenue statistics (Admin only)
router.get(
  "/revenue",
  authenticateToken,
  adminOnly,
  dashboardController.getRevenueStats,
);

// GET /dashboard/trends - Get booking trends (Admin only)
router.get(
  "/trends",
  authenticateToken,
  adminOnly,
  dashboardController.getBookingTrends,
);

export default router;
