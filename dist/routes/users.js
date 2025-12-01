"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_PATH || "./uploads/avatars");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"),
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error("Only image files are allowed!"));
        }
        cb(null, true);
    },
});
router.get("/", auth_1.authenticateToken, (0, auth_1.restrictTo)('admin'), (0, validation_1.validateQuery)(validation_1.queryValidation.pagination.keys({
    role: joi_1.default.string().valid("admin", "stylist", "customer").optional(),
    isActive: joi_1.default.boolean().optional(),
    search: joi_1.default.string().min(1).max(100).optional(),
})), userController_1.default.getUsers);
router.post("/", auth_1.authenticateToken, (0, auth_1.checkPermission)('users', 'create'), (0, validation_1.validateBody)(validation_1.userValidation.register.keys({
    role: joi_1.default.string().valid("admin", "stylist", "customer").optional(),
    isActive: joi_1.default.boolean().optional(),
    emailVerified: joi_1.default.boolean().optional(),
})), userController_1.default.createUser);
router.get("/stats", auth_1.authenticateToken, (0, auth_1.restrictTo)('admin'), userController_1.default.getUserStats);
router.get("/search", auth_1.authenticateToken, (0, auth_1.restrictTo)('admin'), (0, validation_1.validateQuery)(joi_1.default.object({
    q: joi_1.default.string().min(1).max(100).required().messages({
        "any.required": "Search query is required",
        "string.min": "Search query must be at least 1 character",
        "string.max": "Search query cannot exceed 100 characters",
    }),
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(100).optional().default(10),
})), userController_1.default.searchUsers);
router.put("/bulk", auth_1.authenticateToken, (0, auth_1.checkPermission)('users', 'update'), (0, validation_1.validateBody)(joi_1.default.object({
    userIds: joi_1.default.array().items(joi_1.default.string()).min(1).required().messages({
        "array.min": "At least one user ID is required",
        "any.required": "User IDs array is required",
    }),
    updateData: joi_1.default.object({
        isActive: joi_1.default.boolean().optional(),
        emailVerified: joi_1.default.boolean().optional(),
        role: joi_1.default.string().valid("admin", "stylist", "customer").optional(),
    })
        .min(1)
        .required()
        .messages({
        "object.min": "At least one field to update is required",
        "any.required": "Update data is required",
    }),
})), userController_1.default.bulkUpdateUsers);
router.get("/export", auth_1.authenticateToken, (0, auth_1.restrictTo)('admin'), (0, validation_1.validateQuery)(joi_1.default.object({
    format: joi_1.default.string().valid("csv", "json").optional().default("csv"),
})), userController_1.default.exportUsers);
router.get("/:id", auth_1.authenticateToken, validation_1.validateId, (0, auth_1.checkResourceOwnership)('user'), userController_1.default.getUserById);
router.put("/:id", auth_1.authenticateToken, validation_1.validateId, (0, auth_1.checkResourceOwnership)('user'), (0, validation_1.validateBody)(validation_1.userValidation.updateProfile.keys({
    isActive: joi_1.default.boolean().optional(),
    emailVerified: joi_1.default.boolean().optional(),
    role: joi_1.default.string().valid("admin", "stylist", "customer").optional(),
})), userController_1.default.updateUser);
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.checkPermission)('users', 'delete'), validation_1.validateId, userController_1.default.deleteUser);
router.post("/:id/avatar", auth_1.authenticateToken, validation_1.validateId, (0, auth_1.checkResourceOwnership)('user'), upload.single("avatar"), userController_1.default.uploadAvatar);
router.get("/:id/activity", auth_1.authenticateToken, validation_1.validateId, (0, auth_1.checkResourceOwnership)('user'), (0, validation_1.validateQuery)(joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional().default(1),
    limit: joi_1.default.number().integer().min(1).max(50).optional().default(20),
})), userController_1.default.getUserActivity);
exports.default = router;
//# sourceMappingURL=users.js.map