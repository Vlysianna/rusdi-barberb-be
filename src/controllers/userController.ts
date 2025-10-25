import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import userService from "../services/userService";
import { ApiResponseUtil } from "../utils/response";
import { asyncHandler } from "../middleware/errorHandler";

class UserController {
  /**
   * Get all users (Admin only)
   */
  getUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        isActive,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const result = await userService.getUsers({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        role: role as string,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return ApiResponseUtil.paginated(
        res,
        result.users,
        result.total,
        Number(page),
        Number(limit),
        "Users retrieved successfully",
      );
    },
  );

  /**
   * Get user by ID
   */
  getUserById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "User ID is required");
      }

      const user = await userService.getUserById(id);

      if (!user) {
        return ApiResponseUtil.notFound(res, "User not found");
      }

      return ApiResponseUtil.success(res, "User retrieved successfully", user);
    },
  );

  /**
   * Create new user (Admin only)
   */
  createUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userData = req.body;

      const user = await userService.createUser(userData);

      return ApiResponseUtil.created(res, user, "User created successfully");
    },
  );

  /**
   * Update user
   */
  updateUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "User ID is required");
      }

      const user = await userService.updateUser(id, updateData);

      return ApiResponseUtil.updated(res, user, "User updated successfully");
    },
  );

  /**
   * Delete user (soft delete)
   */
  deleteUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "User ID is required");
      }

      await userService.deleteUser(id);

      return ApiResponseUtil.deleted(res, "User deleted successfully");
    },
  );

  /**
   * Upload user avatar
   */
  uploadAvatar = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const file = req.file;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "User ID is required");
      }

      if (!file) {
        return ApiResponseUtil.badRequest(res, "Avatar file is required");
      }

      const user = await userService.uploadAvatar(id, file);

      return ApiResponseUtil.success(res, "Avatar uploaded successfully", user);
    },
  );

  /**
   * Get user statistics (Admin only)
   */
  getUserStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const stats = await userService.getUserStats();

      return ApiResponseUtil.success(
        res,
        "User statistics retrieved successfully",
        stats,
      );
    },
  );

  /**
   * Bulk update users (Admin only)
   */
  bulkUpdateUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { userIds, updateData } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return ApiResponseUtil.badRequest(res, "User IDs array is required");
      }

      const result = await userService.bulkUpdateUsers(userIds, updateData);

      return ApiResponseUtil.success(res, "Users updated successfully", {
        updatedCount: result,
      });
    },
  );

  /**
   * Search users by criteria
   */
  searchUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { q: query, page = 1, limit = 10 } = req.query;

      if (!query) {
        return ApiResponseUtil.badRequest(res, "Search query is required");
      }

      const result = await userService.searchUsers({
        query: query as string,
        page: Number(page),
        limit: Number(limit),
      });

      return ApiResponseUtil.paginated(
        res,
        result.users,
        result.total,
        Number(page),
        Number(limit),
        "Search results retrieved successfully",
      );
    },
  );

  /**
   * Get user activity history
   */
  getUserActivity = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!id) {
        return ApiResponseUtil.badRequest(res, "User ID is required");
      }

      const result = await userService.getUserActivity(id, {
        page: Number(page),
        limit: Number(limit),
      });

      return ApiResponseUtil.paginated(
        res,
        result.activities,
        result.total,
        Number(page),
        Number(limit),
        "User activity retrieved successfully",
      );
    },
  );

  /**
   * Export users data (Admin only)
   */
  exportUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { format = "csv" } = req.query;

      const exportData = await userService.exportUsers(format as string);

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=users.csv");
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=users.json");
      }

      return res.send(exportData);
    },
  );
}

export default new UserController();
