import { body } from "express-validator";

/**
 * Validators for creating admin user
 * Password is auto-generated, not required from input
 */
export const createAdminValidators = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address"),

  body("full_name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Full name must be between 2 and 255 characters"),

  body("role")
    .optional()
    .isIn(["admin", "moderator", "super_admin"])
    .withMessage("Role must be one of: admin, moderator, super_admin"),
];

/**
 * Validators for updating admin user
 */
export const updateAdminValidators = [
  body("full_name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Full name must be between 2 and 255 characters"),

  body("role")
    .optional()
    .isIn(["admin", "moderator", "super_admin"])
    .withMessage("Role must be one of: admin, moderator, super_admin"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];
