import { body, param } from "express-validator";

/**
 * Validators for submitting survey response
 */
export const submitSurveyValidators = [
  body("token")
    .isUUID()
    .withMessage("Survey token must be a valid UUID"),

  body("overall_satisfaction")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Overall satisfaction must be between 1 and 5"),

  body("staff_friendliness")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Staff friendliness must be between 1 and 5"),

  body("communication")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Communication must be between 1 and 5"),

  body("cleanliness")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Cleanliness must be between 1 and 5"),

  body("wait_time")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Wait time must be between 1 and 5"),

  body("would_recommend")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("Would recommend must be a boolean"),

  body("comments")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Comments must be at most 2000 characters"),
];

/**
 * Validator for survey token param
 */
export const surveyTokenValidator = [
  param("token")
    .isUUID()
    .withMessage("Survey token must be a valid UUID"),
];
