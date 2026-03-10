import type { NextFunction, Response } from "express";
import { matchedData } from "express-validator";
import { referralsService } from "../services/referrals.service.js";
import { createSuccessResponse, type ApiResponse } from "../types/responses.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

export const referralsController = {
  async getLeaderboard(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const data = await referralsService.getPublicLeaderboard();
      res.status(200).json(createSuccessResponse(data, "Leaderboard retrieved successfully", req.originalUrl, 200));
    } catch (e) {
      next(e);
    }
  },

  async createPartner(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const data = matchedData(req) as { display_name: string; slug: string };
      const partner = await referralsService.createPartner(data);
      res.status(201).json(createSuccessResponse(partner, "Partner created successfully", req.originalUrl, 201));
    } catch (e) {
      next(e);
    }
  },

  async listPartners(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const partners = await referralsService.listPartnersWithCurrentScore();
      res.status(200).json(createSuccessResponse(partners, "Partners retrieved successfully", req.originalUrl, 200));
    } catch (e) {
      next(e);
    }
  },

  async updatePartner(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const data = matchedData(req) as { id: string; display_name?: string; slug?: string; is_active?: boolean };
      const { id, ...update } = data;
      const partner = await referralsService.updatePartner(id, update);
      res.status(200).json(createSuccessResponse(partner, "Partner updated successfully", req.originalUrl, 200));
    } catch (e) {
      next(e);
    }
  },

  async createSession(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const data = matchedData(req) as { name: string; starts_at: string; ends_at: string };
      const session = await referralsService.createSession(data);
      res.status(201).json(createSuccessResponse(session, "Referral session created successfully", req.originalUrl, 201));
    } catch (e) {
      next(e);
    }
  },

  async listSessions(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const sessions = await referralsService.listSessions();
      res.status(200).json(createSuccessResponse(sessions, "Referral sessions retrieved successfully", req.originalUrl, 200));
    } catch (e) {
      next(e);
    }
  },

  async activateSession(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const data = matchedData(req) as { id: string };
      const session = await referralsService.activateSession(data.id);
      res.status(200).json(createSuccessResponse(session, "Referral session activated successfully", req.originalUrl, 200));
    } catch (e) {
      next(e);
    }
  },

  async generatePartnerLink(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const data = matchedData(req) as { id: string };
      const link = await referralsService.generatePartnerLink(data.id);
      res.status(201).json(createSuccessResponse(link, "Referral link generated successfully", req.originalUrl, 201));
    } catch (e) {
      next(e);
    }
  },

  async revokeLink(req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const data = matchedData(req) as { id: string };
      const link = await referralsService.revokeLink(data.id);
      res.status(200).json(createSuccessResponse(link, "Referral link revoked successfully", req.originalUrl, 200));
    } catch (e) {
      next(e);
    }
  },
};

