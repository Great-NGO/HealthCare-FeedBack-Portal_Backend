import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, requireAdmin, requireSuperAdmin } from "../middleware/auth.js";
import {
  validate,
  idParamValidator,
  paginationValidators,
  searchValidator,
  createAdminValidators,
  updateAdminValidators,
} from "../validators/index.js";
import { query } from "express-validator";

const router = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/v1/admins
 * @desc    List all admins
 * @access  Private (Admin)
 */
router.get(
  "/",
  [
    ...paginationValidators,
    ...searchValidator,
    query("role").optional().isString().withMessage("Role must be a string"),
    query("is_active").optional().isBoolean().toBoolean().withMessage("is_active must be a boolean"),
  ],
  validate,
  adminController.list
);

/**
 * @route   POST /api/v1/admins
 * @desc    Create new admin
 * @access  Private (Super Admin)
 */
router.post(
  "/",
  requireSuperAdmin,
  createAdminValidators,
  validate,
  adminController.create
);

/**
 * @route   GET /api/v1/admins/:id
 * @desc    Get single admin
 * @access  Private (Admin)
 */
router.get(
  "/:id",
  idParamValidator,
  validate,
  adminController.getById
);

/**
 * @route   PATCH /api/v1/admins/:id
 * @desc    Update admin
 * @access  Private (Super Admin)
 */
router.patch(
  "/:id",
  requireSuperAdmin,
  [...idParamValidator, ...updateAdminValidators],
  validate,
  adminController.update
);

/**
 * @route   DELETE /api/v1/admins/:id
 * @desc    Deactivate admin
 * @access  Private (Super Admin)
 */
router.delete(
  "/:id",
  requireSuperAdmin,
  idParamValidator,
  validate,
  adminController.delete
);

/**
 * @route   POST /api/v1/admins/:id/toggle-active
 * @desc    Toggle admin active status
 * @access  Private (Super Admin)
 */
router.post(
  "/:id/toggle-active",
  requireSuperAdmin,
  idParamValidator,
  validate,
  adminController.toggleActive
);

/**
 * @route   POST /api/v1/admins/:id/reset-password
 * @desc    Reset admin password and send new one via email
 * @access  Private (Super Admin)
 */
router.post(
  "/:id/reset-password",
  requireSuperAdmin,
  idParamValidator,
  validate,
  adminController.resetPassword
);

export default router;
