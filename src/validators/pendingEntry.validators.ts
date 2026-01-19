import { body, query } from "express-validator";
import { PendingEntryStatus } from "../types/enums.js";

/**
 * Validators for updating pending entry status
 */
export const updatePendingEntryValidators = [
  body("status")
    .isIn([PendingEntryStatus.APPROVED, PendingEntryStatus.REJECTED])
    .withMessage(`Status must be one of: ${PendingEntryStatus.APPROVED}, ${PendingEntryStatus.REJECTED}`),
];

/**
 * Validators for pending entry list filters
 */
export const pendingEntryFilterValidators = [
  query("status")
    .optional()
    .isIn([...Object.values(PendingEntryStatus), "all"])
    .withMessage(`Status filter must be one of: ${Object.values(PendingEntryStatus).join(", ")}, all`),

  query("entry_type")
    .optional()
    .isString()
    .trim()
    .withMessage("Entry type must be a string"),
];
