import { Router } from "express";
import multer from "multer";
import { uploadController } from "../controllers/upload.controller.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

/**
 * @route   POST /api/v1/uploads/voice
 * @desc    Upload voice message
 * @access  Public
 */
router.post(
  "/voice",
  optionalAuth,
  upload.single("file"),
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
  uploadController.uploadEvidence
);

export default router;
