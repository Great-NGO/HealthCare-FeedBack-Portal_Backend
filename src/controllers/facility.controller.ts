import type { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { facilityService } from "../services/facility.service.js";
import { createSuccessResponse, type ApiResponse } from "../types/responses.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

/**
 * Facility controller
 */
export const facilityController = {
  /**
   * POST /api/v1/facilities
   */
  async create(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = matchedData(req);

      const facility = await facilityService.create(data);

      res.status(201).json(
        createSuccessResponse(facility, "Facility submitted for approval", req.originalUrl, 201)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/facilities
   */
  async list(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = matchedData(req);

      const result = await facilityService.list(filters);

      res.status(200).json(
        createSuccessResponse(
          result.data,
          "Facilities retrieved successfully",
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
   * GET /api/v1/facilities/:id
   */
  async getById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      const facility = await facilityService.getById(id);

      res.status(200).json(
        createSuccessResponse(facility, "Facility retrieved successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/facilities/:id/status
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

      const facility = await facilityService.updateStatus(id, status as any, req.user.id);

      res.status(200).json(
        createSuccessResponse(facility, "Facility status updated", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/facilities/:id
   */
  async delete(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      await facilityService.delete(id);

      res.status(200).json(
        createSuccessResponse(null, "Facility deleted successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },
};
