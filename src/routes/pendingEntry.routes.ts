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

// All routes require admin access
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
