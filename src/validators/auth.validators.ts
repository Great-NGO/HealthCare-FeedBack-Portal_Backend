import { body } from "express-validator";

/**
 * Validators for login request
 */
export const loginValidators = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address"),

  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

/**
 * Validators for signup/register request
 */
export const signupValidators = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address"),

  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),

  body("full_name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Full name must be between 2 and 255 characters"),
];

/**
 * Validators for refresh token request
 */
export const refreshTokenValidators = [
  body("refresh_token")
    .isString()
    .notEmpty()
    .withMessage("Refresh token is required"),
];

/**
 * Validators for change password request
 */
export const changePasswordValidators = [
  body("current_password")
    .isString()
    .notEmpty()
    .withMessage("Current password is required"),

  body("new_password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("New password must be between 8 and 128 characters")
    .matches(/[a-z]/)
    .withMessage("New password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("New password must contain at least one number"),
];
