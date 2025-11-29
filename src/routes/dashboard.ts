import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticateToken, checkDashboardAccess } from "../middleware/auth";

const router = Router();

/**
 * Dashboard Routes
 * Dashboard routes use role-based access control
 * - Admin: All dashboards (admin, manager, stylist)
 * - Manager: Manager and stylist dashboards only
 * - Stylist: Personal stylist dashboard only
 */

// GET /dashboard/stats - Get dashboard statistics (Admin/Manager can access)
router.get(
  "/stats",
  authenticateToken,
  checkDashboardAccess('manager'), // Manager level allows both admin and manager
  dashboardController.getDashboardStats,
);

// GET /dashboard/revenue - Get revenue statistics (Admin/Manager only)
router.get(
  "/revenue",
  authenticateToken,
  checkDashboardAccess('manager'),
  dashboardController.getRevenueStats,
);

// GET /dashboard/trends - Get booking trends (Admin/Manager only)
router.get(
  "/trends",
  authenticateToken,
  checkDashboardAccess('manager'),
  dashboardController.getBookingTrends,
);

export default router;
