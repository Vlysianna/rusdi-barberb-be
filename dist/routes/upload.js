"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cuid2_1 = require("@paralleldrive/cuid2");
const auth_1 = require("../middleware/auth");
const uploadController_1 = __importDefault(require("../controllers/uploadController"));
const types_1 = require("../utils/types");
const router = (0, express_1.Router)();
const uploadsDir = path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = (0, cuid2_1.createId)();
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueId}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed."));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
router.post("/image", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(types_1.UserRole.ADMIN, types_1.UserRole.MANAGER, types_1.UserRole.STYLIST), upload.single("file"), uploadController_1.default.uploadImage);
router.delete("/image/:filename", auth_1.authenticateToken, (0, auth_1.authorizeRoles)(types_1.UserRole.ADMIN, types_1.UserRole.MANAGER), uploadController_1.default.deleteImage);
exports.default = router;
//# sourceMappingURL=upload.js.map