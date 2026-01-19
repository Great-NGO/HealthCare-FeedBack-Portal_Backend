import { body, query } from "express-validator";
import { FacilityStatus } from "../types/enums.js";

/**
 * Validators for creating custom facility
 */
export const createFacilityValidators = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Facility name must be between 2 and 255 characters"),

  body("facility_type")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Facility type must be between 2 and 100 characters"),

  body("state")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("State must be between 2 and 100 characters"),

  body("lga")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("LGA must be between 2 and 100 characters"),
];

/**
 * Validators for updating facility status
 */
export const updateFacilityStatusValidators = [
  body("status")
    .isIn(Object.values(FacilityStatus))
    .withMessage(`Status must be one of: ${Object.values(FacilityStatus).join(", ")}`),
];

/**
 * Validators for facility list filters
 */
export const facilityFilterValidators = [
  query("status")
    .optional()
    .isIn([...Object.values(FacilityStatus), "all"])
    .withMessage(`Status filter must be one of: ${Object.values(FacilityStatus).join(", ")}, all`),

  query("state")
    .optional()
    .isString()
    .trim()
    .withMessage("State must be a string"),

  query("facility_type")
    .optional()
    .isString()
    .trim()
    .withMessage("Facility type must be a string"),
];
