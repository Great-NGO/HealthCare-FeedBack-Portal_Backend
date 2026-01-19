import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { generateAccessToken, generateRefreshToken, verifyToken, type JwtPayload } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";

/**
 * Authentication service
 * Uses JWT tokens with credentials stored in admins table via Prisma
 */
export const authService = {
  /**
   * Signs in an admin with email and password
   * @param email - Admin email
   * @param password - Admin password
   * @returns User info and JWT tokens
   */
  async login(email: string, password: string) {
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password_hash: true,
        full_name: true,
        role: true,
        is_active: true,
      },
    });

    if (!admin) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (!admin.is_active) {
      throw new AppError(401, "ACCOUNT_DISABLED", "Account is disabled");
    }

    if (!admin.password_hash) {
      throw new AppError(401, "NO_PASSWORD", "Password not set. Please contact administrator.");
    }

    // Verify password
    const isValid = await comparePassword(password, admin.password_hash);
    if (!isValid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        full_name: admin.full_name,
        is_admin: true,
      },
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    };
  },

  /**
   * Signs out - for JWT this is handled client-side by deleting tokens
   */
  async logout() {
    // JWT logout is client-side - just return success
    return { message: "Logged out successfully" };
  },

  /**
   * Gets the current authenticated user's info from token
   * @param userId - User ID from verified token
   */
  async getCurrentUser(userId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!admin) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    if (!admin.is_active) {
      throw new AppError(401, "ACCOUNT_DISABLED", "Account is disabled");
    }

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      full_name: admin.full_name,
      is_admin: true,
      created_at: admin.created_at,
    };
  },

  /**
   * Refreshes tokens using a refresh token
   * @param refreshToken - Refresh token
   */
  async refreshToken(refreshToken: string) {
    const decoded = verifyToken(refreshToken);

    if (!decoded) {
      throw new AppError(401, "INVALID_TOKEN", "Invalid or expired refresh token");
    }

    // Verify user still exists and is active
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
      throw new AppError(401, "USER_INVALID", "User not found or inactive");
    }

    // Generate new tokens
    const payload: JwtPayload = {
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    return {
      access_token: generateAccessToken(payload),
      refresh_token: generateRefreshToken(payload),
      expires_in: 7 * 24 * 60 * 60,
    };
  },

  /**
   * Changes password for an admin
   * @param userId - Admin user ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: { id: true, password_hash: true },
    });

    if (!admin) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    // Verify current password if set
    if (admin.password_hash) {
      const isValid = await comparePassword(currentPassword, admin.password_hash);
      if (!isValid) {
        throw new AppError(401, "INVALID_PASSWORD", "Current password is incorrect");
      }
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    return { message: "Password changed successfully" };
  },

  /**
   * Sets initial password for an admin (used during setup)
   * @param email - Admin email
   * @param password - New password
   */
  async setPassword(email: string, password: string) {
    const hash = await hashPassword(password);

    const admin = await prisma.admin.update({
      where: { email: email.toLowerCase() },
      data: { password_hash: hash },
      select: { id: true, email: true },
    });

    if (!admin) {
      throw new AppError(404, "USER_NOT_FOUND", "Admin not found");
    }

    return { message: "Password set successfully", email: admin.email };
  },
};
