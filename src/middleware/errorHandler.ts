import type { NextFunction, Request, Response } from "express";
import { createErrorResponse, type ErrorResponse } from "../types/responses.js";
import { config } from "../config/env.js";

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public errors: (string | { message: string; field?: string })[] = []
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates a validation error
 */
export function validationError(
  errors: (string | { message: string; field?: string })[]
): AppError {
  return new AppError(400, "VALIDATION_ERROR", "Request validation failed", errors);
}

/**
 * Creates a not found error
 */
export function notFoundError(resource: string = "Resource"): AppError {
  return new AppError(404, "NOT_FOUND", `${resource} not found`);
}

/**
 * Creates an unauthorized error
 */
export function unauthorizedError(message: string = "Authentication required"): AppError {
  return new AppError(401, "UNAUTHORIZED", message);
}

/**
 * Creates a forbidden error
 */
export function forbiddenError(message: string = "Access denied"): AppError {
  return new AppError(403, "FORBIDDEN", message);
}

/**
 * Creates a conflict error
 */
export function conflictError(message: string = "Resource already exists"): AppError {
  return new AppError(409, "CONFLICT", message);
}

/**
 * Global error handler middleware
 * Catches all errors and returns standardized error response
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  // Log error in development
  if (!config.isProduction) {
    console.error("Error:", err);
  }

  // Handle known AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      createErrorResponse(
        err.code,
        err.message,
        err.errors.length > 0 ? err.errors : [{ message: err.message }],
        req.originalUrl,
        err.statusCode
      )
    );
    return;
  }

  // Handle unknown errors
  const statusCode = 500;
  const message = config.isProduction
    ? "An unexpected error occurred"
    : err.message || "An unexpected error occurred";

  res.status(statusCode).json(
    createErrorResponse(
      "INTERNAL_SERVER_ERROR",
      message,
      [{ message }],
      req.originalUrl,
      statusCode
    )
  );
}

/**
 * 404 Not Found handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response<ErrorResponse>): void {
  res.status(404).json(
    createErrorResponse(
      "NOT_FOUND",
      `Route ${req.method} ${req.originalUrl} not found`,
      [{ message: "The requested endpoint does not exist" }],
      req.originalUrl,
      404
    )
  );
}
