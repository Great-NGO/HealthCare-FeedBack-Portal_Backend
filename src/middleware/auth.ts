import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { unauthorizedError, forbiddenError } from "./errorHandler.js";
import { verifyToken, extractToken } from "../utils/jwt.js";

/**
 * Authenticated user payload attached to request
 */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Extended Express Request with authenticated user
 * Extends Request to preserve all Express properties (params, query, body, etc.)
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  accessToken?: string;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      throw unauthorizedError("No authentication token provided");
    }

    // Verify JWT token
    const decoded = verifyToken(token);

    if (!decoded) {
      throw unauthorizedError("Invalid or expired token");
    }

    // Verify user still exists and is active in database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
      },
    });

    if (!admin || !admin.is_active) {
      throw unauthorizedError("User not found or inactive");
    }

    req.user = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
    req.accessToken = token;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Admin-only authorization middleware
 * Must be used after authenticate middleware
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw unauthorizedError("Authentication required");
    }

    // User role is already validated in authenticate middleware
    // Just verify they have admin access
    const validRoles = ["admin", "super_admin"];
    if (!validRoles.includes(req.user.role)) {
      throw forbiddenError("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Super admin authorization middleware
 * Must be used after authenticate middleware
 */
export async function requireSuperAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw unauthorizedError("Authentication required");
    }

    if (req.user.role !== "super_admin") {
      throw forbiddenError("Super admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token present, but doesn't require it
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);

      if (decoded) {
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            role: true,
            is_active: true,
          },
        });

        if (admin && admin.is_active) {
          req.user = {
            id: admin.id,
            email: admin.email,
            role: admin.role,
          };
          req.accessToken = token;
        }
      }
    }

    next();
  } catch {
    // Token invalid, but that's okay for optional auth
    next();
  }
}
