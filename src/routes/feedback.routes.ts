import { Router } from "express";
import { feedbackController } from "../controllers/feedback.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  validate,
  idParamValidator,
  paginationValidators,
  dateRangeValidators,
  searchValidator,
  createFeedbackValidators,
  updateFeedbackValidators,
  feedbackFilterValidators,
} from "../validators/index.js";

const router = Router();

/**
 * @route   POST /api/v1/feedback
 * @desc    Submit new feedback
 * @access  Public
 */
router.post(
  "/",
  createFeedbackValidators,
  validate,
  feedbackController.create
);

/**
 * @route   GET /api/v1/feedback/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get(
  "/stats",
  authenticate,
  requireAdmin,
  dateRangeValidators,
  validate,
  feedbackController.getStats
);

/**
 * @route   GET /api/v1/feedback
 * @desc    List all feedback with filters
 * @access  Private (Admin)
 */
router.get(
  "/",
  authenticate,
  requireAdmin,
  [...paginationValidators, ...dateRangeValidators, ...searchValidator, ...feedbackFilterValidators],
  validate,
  feedbackController.list
);

/**
 * @route   GET /api/v1/feedback/reference/:referenceId
 * @desc    Get feedback by reference ID
 * @access  Public (for tracking)
 */
router.get(
  "/reference/:referenceId",
  feedbackController.getByReferenceId
);

/**
 * @route   GET /api/v1/feedback/:id
 * @desc    Get single feedback by ID
 * @access  Private (Admin)
 */
router.get(
  "/:id",
  authenticate,
  requireAdmin,
  idParamValidator,
  validate,
  feedbackController.getById
);

/**
 * @route   PATCH /api/v1/feedback/:id
 * @desc    Update feedback (status, notes, etc.)
 * @access  Private (Admin)
 */
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  [...idParamValidator, ...updateFeedbackValidators],
  validate,
  feedbackController.update
);

/**
 * @route   GET /api/v1/feedback/:id/evidence
 * @desc    Get evidence files for feedback
 * @access  Private (Admin)
 */
router.get(
  "/:id/evidence",
  authenticate,
  requireAdmin,
  idParamValidator,
  validate,
  feedbackController.getEvidence
);

export default router;
