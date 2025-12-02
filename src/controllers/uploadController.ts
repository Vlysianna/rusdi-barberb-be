import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../config/jwt";
import { ApiResponseUtil } from "../utils/response";
import { asyncHandler } from "../middleware/errorHandler";
import path from "path";
import fs from "fs";

class UploadController {
  /**
   * Upload single image
   */
  uploadImage = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.file) {
        return ApiResponseUtil.badRequest(res, "No file uploaded");
      }

      // Build the URL for the uploaded file
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
      const basePath = process.env.BASE_PATH || "/barber";
      const fileUrl = `${baseUrl}${basePath}/uploads/${req.file.filename}`;

      return ApiResponseUtil.success(res, "Image uploaded successfully", {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    }
  );

  /**
   * Delete uploaded image
   */
  deleteImage = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { filename } = req.params;

      if (!filename) {
        return ApiResponseUtil.badRequest(res, "Filename is required");
      }

      // Sanitize filename to prevent directory traversal
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(__dirname, "../../uploads", sanitizedFilename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return ApiResponseUtil.notFound(res, "File not found");
      }

      // Delete the file
      fs.unlinkSync(filePath);

      return ApiResponseUtil.success(res, "Image deleted successfully", null);
    }
  );
}

export const uploadController = new UploadController();
export default uploadController;
