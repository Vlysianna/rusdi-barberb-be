"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class UploadController {
    constructor() {
        this.uploadImage = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            if (!req.file) {
                return response_1.ApiResponseUtil.badRequest(res, "No file uploaded");
            }
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            const basePath = process.env.BASE_PATH || "/barber";
            const fileUrl = `${baseUrl}${basePath}/uploads/${req.file.filename}`;
            return response_1.ApiResponseUtil.success(res, "Image uploaded successfully", {
                url: fileUrl,
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            });
        });
        this.deleteImage = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
            const { filename } = req.params;
            if (!filename) {
                return response_1.ApiResponseUtil.badRequest(res, "Filename is required");
            }
            const sanitizedFilename = path_1.default.basename(filename);
            const filePath = path_1.default.join(__dirname, "../../uploads", sanitizedFilename);
            if (!fs_1.default.existsSync(filePath)) {
                return response_1.ApiResponseUtil.notFound(res, "File not found");
            }
            fs_1.default.unlinkSync(filePath);
            return response_1.ApiResponseUtil.success(res, "Image deleted successfully", null);
        });
    }
}
exports.uploadController = new UploadController();
exports.default = exports.uploadController;
//# sourceMappingURL=uploadController.js.map