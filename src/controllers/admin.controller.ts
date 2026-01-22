import type { NextFunction, Response } from "express";
import { matchedData } from "express-validator";
import { adminService } from "../services/admin.service.js";
import { createSuccessResponse, type ApiResponse } from "../types/responses.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

/**
 * Admin controller
 * Handles admin management HTTP requests
 */
export const adminController = {
  /**
   * POST /api/v1/admins
   * Creates a new admin user
   */
  async create(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = matchedData(req);

      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const admin = await adminService.create(data, req.user.id, req.user.role);

      res.status(201).json(
        createSuccessResponse(admin, "Admin created successfully", req.originalUrl, 201)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admins
   * Lists all admins
   */
  async list(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = matchedData(req);

      const result = await adminService.list(filters);

      res.status(200).json(
        createSuccessResponse(
          result.data,
          "Admins retrieved successfully",
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
   * GET /api/v1/admins/:id
   * Gets a single admin
   */
  async getById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      const admin = await adminService.getById(id);

      res.status(200).json(
        createSuccessResponse(admin, "Admin retrieved successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/admins/:id
   * Updates an admin
   */
  async update(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, ...updateData } = matchedData(req) as { id: string; [key: string]: unknown };

      const admin = await adminService.update(id, updateData, req.user.role);

      res.status(200).json(
        createSuccessResponse(admin, "Admin updated successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/admins/:id
   * Deactivates an admin
   */
  async delete(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      await adminService.delete(id, req.user.role);

      res.status(200).json(
        createSuccessResponse(null, "Admin deactivated successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/admins/:id/toggle-active
   * Toggles admin active status
   */
  async toggleActive(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      const admin = await adminService.toggleActive(id, req.user.role);

      res.status(200).json(
        createSuccessResponse(
          admin,
          `Admin ${admin.is_active ? "activated" : "deactivated"} successfully`,
          req.originalUrl,
          200
        )
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/admins/:id/reset-password
   * Resets admin password and sends new one via email
   */
  async resetPassword(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      const result = await adminService.resetPassword(id, req.user.role);

      res.status(200).json(
        createSuccessResponse(
          result,
          "Password reset successfully. New password sent via email.",
          req.originalUrl,
          200
        )
      );
    } catch (error) {
      next(error);
    }
  },
};
