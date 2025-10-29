"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("../services/userService"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
class UserController {
    constructor() {
        this.getUsers = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { page = 1, limit = 10, search, role, isActive, sortBy = "createdAt", sortOrder = "desc", } = req.query;
            const result = await userService_1.default.getUsers({
                page: Number(page),
                limit: Number(limit),
                search: search,
                role: role,
                isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
                sortBy: sortBy,
                sortOrder: sortOrder,
            });
            return response_1.ApiResponseUtil.paginated(res, result.users, result.total, Number(page), Number(limit), "Users retrieved successfully");
        });
        this.getUserById = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "User ID is required");
            }
            const user = await userService_1.default.getUserById(id);
            if (!user) {
                return response_1.ApiResponseUtil.notFound(res, "User not found");
            }
            return response_1.ApiResponseUtil.success(res, "User retrieved successfully", user);
        });
        this.createUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const userData = req.body;
            const user = await userService_1.default.createUser(userData);
            return response_1.ApiResponseUtil.created(res, user, "User created successfully");
        });
        this.updateUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const updateData = req.body;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "User ID is required");
            }
            const user = await userService_1.default.updateUser(id, updateData);
            return response_1.ApiResponseUtil.updated(res, user, "User updated successfully");
        });
        this.deleteUser = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "User ID is required");
            }
            await userService_1.default.deleteUser(id);
            return response_1.ApiResponseUtil.deleted(res, "User deleted successfully");
        });
        this.uploadAvatar = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const file = req.file;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "User ID is required");
            }
            if (!file) {
                return response_1.ApiResponseUtil.badRequest(res, "Avatar file is required");
            }
            const user = await userService_1.default.uploadAvatar(id, file);
            return response_1.ApiResponseUtil.success(res, "Avatar uploaded successfully", user);
        });
        this.getUserStats = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const stats = await userService_1.default.getUserStats();
            return response_1.ApiResponseUtil.success(res, "User statistics retrieved successfully", stats);
        });
        this.bulkUpdateUsers = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { userIds, updateData } = req.body;
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return response_1.ApiResponseUtil.badRequest(res, "User IDs array is required");
            }
            const result = await userService_1.default.bulkUpdateUsers(userIds, updateData);
            return response_1.ApiResponseUtil.success(res, "Users updated successfully", {
                updatedCount: result,
            });
        });
        this.searchUsers = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { q: query, page = 1, limit = 10 } = req.query;
            if (!query) {
                return response_1.ApiResponseUtil.badRequest(res, "Search query is required");
            }
            const result = await userService_1.default.searchUsers({
                query: query,
                page: Number(page),
                limit: Number(limit),
            });
            return response_1.ApiResponseUtil.paginated(res, result.users, result.total, Number(page), Number(limit), "Search results retrieved successfully");
        });
        this.getUserActivity = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            if (!id) {
                return response_1.ApiResponseUtil.badRequest(res, "User ID is required");
            }
            const result = await userService_1.default.getUserActivity(id, {
                page: Number(page),
                limit: Number(limit),
            });
            return response_1.ApiResponseUtil.paginated(res, result.activities, result.total, Number(page), Number(limit), "User activity retrieved successfully");
        });
        this.exportUsers = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { format = "csv" } = req.query;
            const exportData = await userService_1.default.exportUsers(format);
            if (format === "csv") {
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", "attachment; filename=users.csv");
            }
            else {
                res.setHeader("Content-Type", "application/json");
                res.setHeader("Content-Disposition", "attachment; filename=users.json");
            }
            return res.send(exportData);
        });
    }
}
exports.default = new UserController();
//# sourceMappingURL=userController.js.map