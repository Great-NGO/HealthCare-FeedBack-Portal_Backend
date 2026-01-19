import { Router } from "express";
import { facilityController } from "../controllers/facility.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  validate,
  idParamValidator,
  paginationValidators,
  searchValidator,
  createFacilityValidators,
  updateFacilityStatusValidators,
  facilityFilterValidators,
} from "../validators/index.js";

const router = Router();

/**
 * @route   POST /api/v1/facilities
 * @desc    Submit new custom facility
 * @access  Public
 */
router.post(
  "/",
  createFacilityValidators,
  validate,
  facilityController.create
);

/**
 * @route   GET /api/v1/facilities
 * @desc    List all custom facilities
 * @access  Private (Admin)
 */
router.get(
  "/",
  authenticate,
  requireAdmin,
  [...paginationValidators, ...searchValidator, ...facilityFilterValidators],
  validate,
  facilityController.list
);

/**
 * @route   GET /api/v1/facilities/:id
 * @desc    Get single facility
 * @access  Private (Admin)
 */
router.get(
  "/:id",
  authenticate,
  requireAdmin,
  idParamValidator,
  validate,
  facilityController.getById
);

/**
 * @route   PATCH /api/v1/facilities/:id/status
 * @desc    Update facility status (approve/reject)
 * @access  Private (Admin)
 */
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  [...idParamValidator, ...updateFacilityStatusValidators],
  validate,
  facilityController.updateStatus
);

/**
 * @route   DELETE /api/v1/facilities/:id
 * @desc    Delete facility
 * @access  Private (Admin)
 */
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  idParamValidator,
  validate,
  facilityController.delete
);

export default router;
