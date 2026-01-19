import { body, query } from "express-validator";
import { FeedbackType, FeedbackStatus } from "../types/enums.js";

/**
 * Validators for creating new feedback submission
 */
export const createFeedbackValidators = [
  body("anonymous")
    .isBoolean()
    .withMessage("anonymous must be a boolean"),

  body("reporter_name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Reporter name must be between 2 and 255 characters"),

  body("reporter_email")
    .optional({ nullable: true })
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address"),

  body("reporter_phone")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Reporter phone must be a string"),

  body("feedback_type")
    .isIn(Object.values(FeedbackType))
    .withMessage(`Feedback type must be one of: ${Object.values(FeedbackType).join(", ")}`),

  body("description")
    .isString()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  body("facility_type")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Facility type must be a string"),

  body("facility_state")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Facility state must be a string"),

  body("facility_lga")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Facility LGA must be a string"),

  body("facility_name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Facility name must be a string"),

  body("incident_date")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Incident date must be a valid date"),

  body("incident_time")
    .optional({ nullable: true })
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Incident time must be in HH:MM format"),

  body("department")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Department must be a string"),

  body("severity")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Severity must be between 1 and 5"),

  body("additional_comments")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Additional comments must be at most 2000 characters"),
];

/**
 * Validators for updating feedback (admin)
 */
export const updateFeedbackValidators = [
  body("status")
    .optional()
    .isIn(Object.values(FeedbackStatus))
    .withMessage(`Status must be one of: ${Object.values(FeedbackStatus).join(", ")}`),

  body("admin_notes")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Admin notes must be at most 2000 characters"),

  body("assigned_department")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Assigned department must be a string"),
];

/**
 * Validators for feedback list filters
 */
export const feedbackFilterValidators = [
  query("type")
    .optional()
    .isIn([...Object.values(FeedbackType), "all"])
    .withMessage(`Type filter must be one of: ${Object.values(FeedbackType).join(", ")}, all`),

  query("status")
    .optional()
    .isIn([...Object.values(FeedbackStatus), "all"])
    .withMessage(`Status filter must be one of: ${Object.values(FeedbackStatus).join(", ")}, all`),
];
