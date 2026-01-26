import type { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { feedbackService } from "../services/feedback.service.js";
import { createSuccessResponse, type ApiResponse } from "../types/responses.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

/**
 * Feedback controller
 * Handles feedback-related HTTP requests
 */
export const feedbackController = {
  /**
   * POST /api/v1/feedback
   * Creates a new feedback submission
   */
  async create(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = matchedData(req) as {
        anonymous: boolean;
        feedback_type: string;
        description: string;
        [key: string]: unknown;
      };

      const feedback = await feedbackService.create(data as any);

      res.status(201).json(
        createSuccessResponse(
          { id: feedback.id, reference_id: feedback.reference_id },
          "Feedback submitted successfully",
          req.originalUrl,
          201
        )
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/feedback
   * Lists feedback with filters and pagination
   */
  async list(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = matchedData(req);

      const result = await feedbackService.list(filters);

      res.status(200).json(
        createSuccessResponse(
          result.data,
          "Feedback retrieved successfully",
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
   * GET /api/v1/feedback/stats
   * Gets dashboard statistics
   */
  async getStats(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { dateFrom, dateTo } = req.query as { dateFrom?: string; dateTo?: string };

      const stats = await feedbackService.getStats(dateFrom, dateTo);

      res.status(200).json(
        createSuccessResponse(stats, "Stats retrieved successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/feedback/:id
   * Gets a single feedback by ID
   */
  async getById(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      const feedback = await feedbackService.getById(id);
      const evidence = await feedbackService.getEvidence(id);

      res.status(200).json(
        createSuccessResponse(
          { ...feedback, evidence },
          "Feedback retrieved successfully",
          req.originalUrl,
          200
        )
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/feedback/reference/:referenceId
   * Gets a single feedback by reference ID
   */
  async getByReferenceId(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { referenceId } = req.params;
      const refId = typeof referenceId === 'string' ? referenceId : Array.isArray(referenceId) ? referenceId[0] : '';

      const feedback = await feedbackService.getByReferenceId(refId);

      res.status(200).json(
        createSuccessResponse(feedback, "Feedback retrieved successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/feedback/:id
   * Updates a feedback submission (admin)
   */
  async update(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, ...updateData } = matchedData(req) as { id: string; [key: string]: unknown };

      const feedback = await feedbackService.update(id, updateData);

      res.status(200).json(
        createSuccessResponse(feedback, "Feedback updated successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/feedback/:id/evidence
   * Gets evidence files for a feedback
   */
  async getEvidence(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = matchedData(req) as { id: string };

      const evidence = await feedbackService.getEvidence(id);

      res.status(200).json(
        createSuccessResponse(evidence, "Evidence retrieved successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },
};
