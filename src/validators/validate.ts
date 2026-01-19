import type { NextFunction, Request, Response } from "express";
import { validationResult, type ValidationError } from "express-validator";
import { createErrorResponse, type ErrorResponse } from "../types/responses.js";

/**
 * Maps express-validator error to our error format
 */
function mapValidationError(error: ValidationError): { message: string; field?: string } {
  if (error.type === "field") {
    return {
      field: error.path,
      message: error.msg as string,
    };
  }
  return { message: error.msg as string };
}

/**
 * DRY: Reusable validation result middleware
 * Checks for validation errors and returns standardized error response
 * @example router.post("/", [...validators], validate, controller)
 */
export function validate(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map(mapValidationError);

  res.status(400).json(
    createErrorResponse(
      "VALIDATION_ERROR",
      "Request validation failed",
      errors,
      req.originalUrl,
      400
    )
  );
}
