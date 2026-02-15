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

  body("reporter_type")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Reporter type must be between 2 and 255 characters"),

  body("reporting_for_self")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("reporting_for_self must be a boolean"),

  body("reporter_relationship")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Reporter relationship must be between 2 and 255 characters"),

  body("reporter_organization")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter organization must be between 1 and 255 characters"),

  body("reporter_gender")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Reporter gender must be between 1 and 100 characters"),

  body("reporter_age_range")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Reporter age range must be between 1 and 100 characters"),

  body("reporter_disability_status")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter disability status must be between 1 and 255 characters"),

  body("reporter_income_range")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter income range must be between 1 and 255 characters"),

  body("reporter_education_level")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter education level must be between 1 and 255 characters"),

  body("reporter_region")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter region must be between 1 and 255 characters"),

  body("reporter_marital_status")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter marital status must be between 1 and 255 characters"),

  body("reporter_geographic_setting")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter geographic setting must be between 1 and 255 characters"),

  body("reporter_insurance_coverage")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter insurance coverage must be between 1 and 255 characters"),

  body("reporter_healthcare_frequency")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter healthcare frequency must be between 1 and 255 characters"),

  body("reporter_sexuality")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Reporter sexuality must be between 1 and 255 characters"),

  body("reporter_phone")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Reporter phone must be a string"),

  body("patient_name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Patient name must be between 2 and 255 characters"),

  body("patient_email")
    .optional({ nullable: true })
    .isEmail()
    .normalizeEmail()
    .withMessage("Patient email must be a valid email address"),

  body("patient_phone")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Patient phone must be a string"),

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

  body("location")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Location must be a string"),

  body("staff_involved")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Staff involved must be a string"),

  body("witnesses")
    .optional({ nullable: true })
    .isString()
    .trim()
    .withMessage("Witnesses must be a string"),

  body("severity")
    .optional({ nullable: true })
    // Frontend uses a 0–4 scale (0 = No Impact, 4 = Severe)
    .isInt({ min: 0, max: 4 })
    .withMessage("Severity must be between 0 and 4"),

  body("issue_classification")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Issue classification must be between 1 and 500 characters"),

  body("issue_classification_other")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Issue classification other must be between 1 and 500 characters"),

  body("voice_message_url")
    .optional({ nullable: true })
    .isURL({ require_protocol: true })
    .withMessage("voice_message_url must be a valid URL"),

  body("voice_message_duration")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 60 * 60 })
    .withMessage("voice_message_duration must be a non-negative integer (seconds)"),

  body("voice_transcription")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 10000 })
    .withMessage("voice_transcription must be at most 10000 characters"),

  body("voice_language")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isIn(["english", "igbo", "yoruba", "hausa"])
    .withMessage("voice_language must be one of: english, igbo, yoruba, hausa"),

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
