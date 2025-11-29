import { Router } from "express";
import userController from "../controllers/userController";
import {
  authenticateToken,
  checkPermission,
  checkResourceOwnership,
  restrictTo,
} from "../middleware/auth";
import {
  validateBody,
  validateParams,
  validateQuery,
  validateId,
  userValidation,
  queryValidation,
  paramValidation,
} from "../middleware/validation";
import Joi from "joi";
import multer from "multer";
import path from "path";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || "./uploads/avatars");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

/**
 * Admin only routes
 */

// GET /users - Get all users with pagination and filters (Admin only)
router.get(
  "/",
  authenticateToken,
  restrictTo('admin'),
  validateQuery(
    queryValidation.pagination.keys({
      role: Joi.string().valid("admin", "stylist", "customer").optional(),
      isActive: Joi.boolean().optional(),
      search: Joi.string().min(1).max(100).optional(),
    }),
  ),
  userController.getUsers,
);

// POST /users - Create new user (Admin only)
router.post(
  "/",
  authenticateToken,
  checkPermission('users', 'create'),
  validateBody(
    userValidation.register.keys({
      role: Joi.string().valid("admin", "stylist", "customer").optional(),
      isActive: Joi.boolean().optional(),
      emailVerified: Joi.boolean().optional(),
    }),
  ),
  userController.createUser,
);

// GET /users/stats - Get user statistics (Admin only)
router.get("/stats", authenticateToken, restrictTo('admin'), userController.getUserStats);

// GET /users/search - Search users (Admin only)
router.get(
  "/search",
  authenticateToken,
  restrictTo('admin'),
  validateQuery(
    Joi.object({
      q: Joi.string().min(1).max(100).required().messages({
        "any.required": "Search query is required",
        "string.min": "Search query must be at least 1 character",
        "string.max": "Search query cannot exceed 100 characters",
      }),
      page: Joi.number().integer().min(1).optional().default(1),
      limit: Joi.number().integer().min(1).max(100).optional().default(10),
    }),
  ),
  userController.searchUsers,
);

// PUT /users/bulk - Bulk update users (Admin only)
router.put(
  "/bulk",
  authenticateToken,
  checkPermission('users', 'update'),
  validateBody(
    Joi.object({
      userIds: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.min": "At least one user ID is required",
        "any.required": "User IDs array is required",
      }),
      updateData: Joi.object({
        isActive: Joi.boolean().optional(),
        emailVerified: Joi.boolean().optional(),
        role: Joi.string().valid("admin", "stylist", "customer").optional(),
      })
        .min(1)
        .required()
        .messages({
          "object.min": "At least one field to update is required",
          "any.required": "Update data is required",
        }),
    }),
  ),
  userController.bulkUpdateUsers,
);

// GET /users/export - Export users data (Admin only)
router.get(
  "/export",
  authenticateToken,
  restrictTo('admin'),
  validateQuery(
    Joi.object({
      format: Joi.string().valid("csv", "json").optional().default("csv"),
    }),
  ),
  userController.exportUsers,
);

/**
 * User specific routes (Admin or resource owner)
 */

// GET /users/:id - Get user by ID (Admin or resource owner)
router.get(
  "/:id",
  authenticateToken,
  validateId,
  checkResourceOwnership('user'),
  userController.getUserById,
);

// PUT /users/:id - Update user (Admin or resource owner)
router.put(
  "/:id",
  authenticateToken,
  validateId,
  checkResourceOwnership('user'),
  validateBody(
    userValidation.updateProfile.keys({
      // Additional fields that admin can update
      isActive: Joi.boolean().optional(),
      emailVerified: Joi.boolean().optional(),
      role: Joi.string().valid("admin", "stylist", "customer").optional(),
    }),
  ),
  userController.updateUser,
);

// DELETE /users/:id - Delete user (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  checkPermission('users', 'delete'),
  validateId,
  userController.deleteUser,
);

// POST /users/:id/avatar - Upload user avatar (Admin or resource owner)
router.post(
  "/:id/avatar",
  authenticateToken,
  validateId,
  checkResourceOwnership('user'),
  upload.single("avatar"),
  userController.uploadAvatar,
);

// GET /users/:id/activity - Get user activity history (Admin or resource owner)
router.get(
  "/:id/activity",
  authenticateToken,
  validateId,
  checkResourceOwnership('user'),
  validateQuery(
    Joi.object({
      page: Joi.number().integer().min(1).optional().default(1),
      limit: Joi.number().integer().min(1).max(50).optional().default(20),
    }),
  ),
  userController.getUserActivity,
);

export default router;
