import type { NextFunction, Response } from "express";
import { matchedData } from "express-validator";
import { authService } from "../services/auth.service.js";
import { createSuccessResponse, type ApiResponse } from "../types/responses.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

/**
 * Auth controller
 * Handles authentication-related HTTP requests
 */
export const authController = {
  /**
   * POST /api/v1/auth/login
   * Authenticates user and returns tokens
   */
  async login(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = matchedData(req) as { email: string; password: string };

      const result = await authService.login(email, password);

      res.status(200).json(
        createSuccessResponse(result, "Login successful", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/logout
   * Signs out the current user (client should delete tokens)
   */
  async logout(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.logout();

      res.status(200).json(
        createSuccessResponse(result, "Logout successful", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/auth/me
   * Returns the current authenticated user's info
   */
  async me(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json(
        createSuccessResponse(user, "User retrieved successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   * Refreshes the access token using refresh token
   */
  async refresh(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refresh_token } = matchedData(req) as { refresh_token: string };

      const result = await authService.refreshToken(refresh_token);

      res.status(200).json(
        createSuccessResponse(result, "Token refreshed successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/change-password
   * Changes the authenticated user's password
   */
  async changePassword(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new Error("User not authenticated");
      }

      const { current_password, new_password } = matchedData(req) as {
        current_password: string;
        new_password: string;
      };

      const result = await authService.changePassword(
        req.user.id,
        current_password,
        new_password
      );

      res.status(200).json(
        createSuccessResponse(result, "Password changed successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/auth/set-password
   * Sets initial password for an admin (for migration purposes)
   * Should be secured or disabled after migration
   */
  async setPassword(
    req: AuthenticatedRequest,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = matchedData(req) as {
        email: string;
        password: string;
      };

      const result = await authService.setPassword(email, password);

      res.status(200).json(
        createSuccessResponse(result, "Password set successfully", req.originalUrl, 200)
      );
    } catch (error) {
      next(error);
    }
  },
};
