import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { uploadController } from "../controllers/upload.controller.js";
import { optionalAuth } from "../middleware/auth.js";
import { FILE_SIZE_LIMITS } from "../utils/fileValidation.js";

const router = Router();

// Configure multer for memory storage with file size limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Math.max(FILE_SIZE_LIMITS.voice, FILE_SIZE_LIMITS.evidence), // Use the larger limit
  },
  fileFilter: (req, file, cb) => {
    // Basic file filter - detailed validation happens in controllers
    cb(null, true);
  },
});

/**
 * Error handler for multer errors
 */
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: "FILE_TOO_LARGE",
        message: "File size exceeds the maximum allowed limit",
        errors: [{ message: "File size exceeds the maximum allowed limit" }],
        statusCode: 400,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(400).json({
      success: false,
      error: "UPLOAD_ERROR",
      message: err.message,
      errors: [{ message: err.message }],
      statusCode: 400,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
  next(err);
};

/**
 * @route   POST /api/v1/uploads/voice
 * @desc    Upload voice message
 * @access  Public
 */
router.post(
  "/voice",
  optionalAuth,
  upload.single("file"),
  handleMulterError,
  uploadController.uploadVoice
);

/**
 * @route   POST /api/v1/uploads/evidence/:feedbackId
 * @desc    Upload evidence file for feedback
 * @access  Public
 */
router.post(
  "/evidence/:feedbackId",
  optionalAuth,
  upload.single("file"),
  handleMulterError,
  uploadController.uploadEvidence
);

export default router;
