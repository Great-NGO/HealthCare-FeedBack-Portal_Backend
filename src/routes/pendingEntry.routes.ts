import { Router } from "express";
import { pendingEntryController } from "../controllers/pendingEntry.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  validate,
  idParamValidator,
  paginationValidators,
  updatePendingEntryValidators,
  pendingEntryFilterValidators,
} from "../validators/index.js";

const router = Router();

/**
 * @route   GET /api/v1/pending-entries/approved/:type
 * @desc    Get approved entries by type (public, for dropdowns)
 * @access  Public
 * NOTE: This route must be defined BEFORE the auth middleware to remain public
 */
router.get(
  "/approved/:type",
  pendingEntryController.getApprovedByType
);

// All other routes require admin access
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/v1/pending-entries
 * @desc    List all pending entries
 * @access  Private (Admin)
 */
router.get(
  "/",
  [...paginationValidators, ...pendingEntryFilterValidators],
  validate,
  pendingEntryController.list
);

/**
 * @route   GET /api/v1/pending-entries/:id
 * @desc    Get single pending entry
 * @access  Private (Admin)
 */
router.get(
  "/:id",
  idParamValidator,
  validate,
  pendingEntryController.getById
);

/**
 * @route   PATCH /api/v1/pending-entries/:id
 * @desc    Update entry status (approve/reject)
 * @access  Private (Admin)
 */
router.patch(
  "/:id",
  [...idParamValidator, ...updatePendingEntryValidators],
  validate,
  pendingEntryController.updateStatus
);

export default router;
