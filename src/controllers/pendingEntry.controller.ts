import type { NextFunction, Response } from "express";
import { matchedData } from "express-validator";
import { pendingEntryService } from "../services/pendingEntry.service.js";
import { createSuccessResponse, type ApiResponse } from "../types/responses.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

/**
 * Pending entry controller
 */
export const pendingEntryController = {
  /**
   * GET /api/v1/pending-entries
   */
  async list(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = matchedData(req);

      const result = await pendingEntryService.list(filters);

      res.status(200).json(
        createSuccessResponse(
          result.data,
          "Pending entries retrieved successfully",
          req.originalUrl,
          200,
          { pagination: result.pagination }
        )
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/pending-entries/:id
   */
  async getById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      const entry = await pendingEntryService.getById(id);

      res.status(200).json(
        createSuccessResponse(entry, "Pending entry retrieved successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/pending-entries/:id
   */
  async updateStatus(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, status } = matchedData(req) as { id: string; status: string };

      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const entry = await pendingEntryService.updateStatus(id, status as any, req.user.id);

      res.status(200).json(
        createSuccessResponse(entry, "Pending entry status updated", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },
};
