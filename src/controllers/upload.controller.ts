import type { NextFunction, Request, Response } from "express";
import { uploadService } from "../services/upload.service.js";
import { createSuccessResponse, type ApiResponse } from "../types/responses.js";
import { AppError } from "../middleware/errorHandler.js";
import { validateEvidenceFile } from "../utils/fileValidation.js";

/**
 * Upload controller
 * Handles file upload HTTP requests
 */
export const uploadController = {
  /**
   * POST /api/v1/uploads/voice
   * Uploads a voice message
   */
  async uploadVoice(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError(400, "NO_FILE", "No voice file provided");
      }

      const url = await uploadService.uploadVoiceMessage(
        req.file.buffer,
        req.file.mimetype
      );

      res.status(201).json(
        createSuccessResponse({ url }, "Voice message uploaded", req.originalUrl, 201)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/uploads/evidence/:feedbackId
   * Uploads evidence file for a feedback
   */
  async uploadEvidence(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { feedbackId } = req.params;
      const fbId = typeof feedbackId === 'string' ? feedbackId : Array.isArray(feedbackId) ? feedbackId[0] : '';

      // Validate file
      if (!req.file) {
        throw new AppError(400, "NO_FILE", "No evidence file provided");
      }

      validateEvidenceFile(req.file);

      const evidence = await uploadService.uploadEvidence(
        fbId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.file.size
      );

      res.status(201).json(
        createSuccessResponse(evidence, "Evidence uploaded", req.originalUrl, 201)
      );
    } catch (error) {
      next(error);
    }
  },
};
