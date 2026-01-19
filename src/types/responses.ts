/**
 * Standard API success response structure
 * @template T - The type of data being returned
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T | null;
  meta?: Record<string, unknown>;
  statusCode: number;
  path: string;
  timestamp: string;
}

/**
 * Standard API error response structure
 */
export interface ErrorResponse {
  success: boolean;
  error: string;
  message: string;
  errors: (string | { message: string; field?: string })[];
  statusCode: number;
  path: string;
  timestamp: string;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string,
  path: string,
  statusCode: number = 200,
  meta?: Record<string, unknown>
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
    statusCode,
    path,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  errors: (string | { message: string; field?: string })[],
  path: string,
  statusCode: number = 500
): ErrorResponse {
  return {
    success: false,
    error,
    message,
    errors,
    statusCode,
    path,
    timestamp: new Date().toISOString(),
  };
}
