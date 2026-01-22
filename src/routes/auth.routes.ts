import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import {
  loginValidators,
  refreshTokenValidators,
  changePasswordValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  validate,
} from "../validators/index.js";

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate admin and get JWT tokens
 * @access  Public
 */
router.post(
  "/login",
  loginValidators,
  validate,
  authController.login
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Sign out current user (client should delete tokens)
 * @access  Private
 */
router.post(
  "/logout",
  authenticate,
  authController.logout
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user info
 * @access  Private
 */
router.get(
  "/me",
  authenticate,
  authController.me
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  "/refresh",
  refreshTokenValidators,
  validate,
  authController.refresh
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change authenticated user's password
 * @access  Private
 */
router.post(
  "/change-password",
  authenticate,
  changePasswordValidators,
  validate,
  authController.changePassword
);

/**
 * @route   POST /api/v1/auth/set-password
 * @desc    Set initial password for an admin (for migration)
 * @access  Private (Super Admin only)
 * @note    This endpoint should be secured or disabled after migration
 */
import { requireSuperAdmin } from "../middleware/auth.js";
import { body } from "express-validator";

router.post(
  "/set-password",
  authenticate,
  requireSuperAdmin,
  [
    body("email").isEmail().normalizeEmail().withMessage("Must be a valid email"),
    body("password")
      .isString()
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters"),
  ],
  validate,
  authController.setPassword
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset - sends email with reset token
 * @access  Public
 */
router.post(
  "/forgot-password",
  forgotPasswordValidators,
  validate,
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post(
  "/reset-password",
  resetPasswordValidators,
  validate,
  authController.resetPassword
);

export default router;
