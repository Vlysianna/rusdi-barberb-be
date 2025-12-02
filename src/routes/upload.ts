import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createId } from "@paralleldrive/cuid2";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import uploadController from "../controllers/uploadController";
import { UserRole } from "../utils/types";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = createId();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed."));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes

/**
 * @route   POST /api/v1/upload/image
 * @desc    Upload single image
 * @access  Private (Admin, Manager, Stylist)
 */
router.post(
  "/image",
  authenticateToken,
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STYLIST),
  upload.single("file"),
  uploadController.uploadImage
);

/**
 * @route   DELETE /api/v1/upload/image/:filename
 * @desc    Delete uploaded image
 * @access  Private (Admin, Manager)
 */
router.delete(
  "/image/:filename",
  authenticateToken,
  authorizeRoles(UserRole.ADMIN, UserRole.MANAGER),
  uploadController.deleteImage
);

export default router;
