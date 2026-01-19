import { param, query } from "express-validator";

/**
 * DRY: Reusable UUID parameter validator
 * @example router.get("/:id", idParamValidator, validate, controller)
 */
export const idParamValidator = [
  param("id")
    .isUUID()
    .withMessage("ID must be a valid UUID"),
];

/**
 * DRY: Reusable pagination query validators
 * @example router.get("/", paginationValidators, validate, controller)
 */
export const paginationValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .toInt()
    .withMessage("Limit must be between 1 and 10000"),
];

/**
 * DRY: Reusable date range query validators
 * @example router.get("/", dateRangeValidators, validate, controller)
 */
export const dateRangeValidators = [
  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("dateFrom must be a valid ISO 8601 date"),
  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("dateTo must be a valid ISO 8601 date"),
];

/**
 * DRY: Reusable search query validator
 */
export const searchValidator = [
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Search query must be between 1 and 255 characters"),
];

/**
 * DRY: Reusable sort validators
 */
export const sortValidators = [
  query("sortBy")
    .optional()
    .isString()
    .trim()
    .withMessage("sortBy must be a string"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be 'asc' or 'desc'"),
];
