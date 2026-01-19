import { Router } from "express";
import { param } from "express-validator";
import { surveyController } from "../controllers/survey.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  validate,
  submitSurveyValidators,
  surveyTokenValidator,
} from "../validators/index.js";

const router = Router();

/**
 * Validator for feedbackId param
 */
const feedbackIdValidator = [
  param("feedbackId").isUUID().withMessage("feedbackId must be a valid UUID"),
];

/**
 * @route   POST /api/v1/surveys
 * @desc    Submit survey response
 * @access  Public
 */
router.post(
  "/",
  submitSurveyValidators,
  validate,
  surveyController.submit
);

/**
 * @route   GET /api/v1/surveys/validate/:token
 * @desc    Validate survey token
 * @access  Public
 */
router.get(
  "/validate/:token",
  surveyTokenValidator,
  validate,
  surveyController.validateToken
);

/**
 * @route   GET /api/v1/surveys/feedback/:feedbackId
 * @desc    Get survey response for a feedback
 * @access  Private (Admin)
 */
router.get(
  "/feedback/:feedbackId",
  authenticate,
  requireAdmin,
  feedbackIdValidator,
  validate,
  surveyController.getByFeedbackId
);

export default router;
