import type { NextFunction, Request, Response } from "express";
import { matchedData } from "express-validator";
import { surveyService } from "../services/survey.service.js";
import { createSuccessResponse, type ApiResponse } from "../types/responses.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

/**
 * Survey controller
 */
export const surveyController = {
  /**
   * POST /api/v1/surveys
   * Submits a survey response
   */
  async submit(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = matchedData(req);

      const survey = await surveyService.submit(data);

      res.status(201).json(
        createSuccessResponse(survey, "Survey submitted successfully", req.originalUrl, 201)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/surveys/validate/:token
   * Validates a survey token
   */
  async validateToken(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = matchedData(req) as { token: string };

      const result = await surveyService.validateToken(token);

      res.status(200).json(
        createSuccessResponse(result, "Token validated", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/surveys/feedback/:feedbackId
   * Gets survey response for a feedback (admin)
   */
  async getByFeedbackId(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { feedbackId } = req.params;

      const survey = await surveyService.getByFeedbackId(feedbackId);

      if (!survey) {
        res.status(200).json(
          createSuccessResponse(null, "No survey response found", req.originalUrl, 200)
        );
        return;
      }

      res.status(200).json(
        createSuccessResponse(survey, "Survey retrieved successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },
};
