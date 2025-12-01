"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = __importDefault(require("../controllers/authController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post("/register", (0, validation_1.validateBody)(validation_1.userValidation.register), authController_1.default.register);
router.post("/login", (0, validation_1.validateBody)(validation_1.userValidation.login), authController_1.default.login);
router.post("/refresh", authController_1.default.refreshToken);
router.post("/forgot-password", authController_1.default.requestPasswordReset);
router.post("/verify-otp", authController_1.default.verifyOTP);
router.post("/reset-password", authController_1.default.resetPassword);
router.get("/profile", auth_1.authenticateToken, authController_1.default.getProfile);
router.get("/me", auth_1.authenticateToken, authController_1.default.getProfile);
router.put("/profile", auth_1.authenticateToken, (0, validation_1.validateBody)(validation_1.userValidation.updateProfile), authController_1.default.updateProfile);
router.post("/change-password", auth_1.authenticateToken, (0, validation_1.validateBody)(validation_1.userValidation.changePassword), authController_1.default.changePassword);
router.post("/verify-email", auth_1.authenticateToken, authController_1.default.verifyEmail);
router.post("/logout", auth_1.authenticateToken, authController_1.default.logout);
router.get("/check", auth_1.authenticateToken, authController_1.default.checkAuth);
router.get("/users/:id", auth_1.authenticateToken, auth_1.adminOnly, validation_1.validateId, authController_1.default.getUserById);
router.put("/users/:id/deactivate", auth_1.authenticateToken, auth_1.adminOnly, validation_1.validateId, authController_1.default.deactivateAccount);
router.put("/users/:id/activate", auth_1.authenticateToken, auth_1.adminOnly, validation_1.validateId, authController_1.default.activateAccount);
exports.default = router;
//# sourceMappingURL=auth.js.map