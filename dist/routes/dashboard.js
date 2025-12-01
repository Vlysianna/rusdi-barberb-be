"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/stats", auth_1.authenticateToken, (0, auth_1.checkDashboardAccess)('manager'), dashboardController_1.dashboardController.getDashboardStats);
router.get("/revenue", auth_1.authenticateToken, (0, auth_1.checkDashboardAccess)('manager'), dashboardController_1.dashboardController.getRevenueStats);
router.get("/trends", auth_1.authenticateToken, (0, auth_1.checkDashboardAccess)('manager'), dashboardController_1.dashboardController.getBookingTrends);
exports.default = router;
//# sourceMappingURL=dashboard.js.map