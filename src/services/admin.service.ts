import { prisma } from "../config/prisma.js";
import { AppError, notFoundError, conflictError } from "../middleware/errorHandler.js";
import { hashPassword, generateSecurePassword } from "../utils/password.js";
import { emailService } from "./email.service.js";
import type { Admin, AppRole } from "@prisma/client";

/**
 * Create admin DTO - password is auto-generated
 */
interface CreateAdminDto {
  email: string;
  full_name?: string | null;
  role?: AppRole;
}

/**
 * Update admin DTO
 */
interface UpdateAdminDto {
  full_name?: string | null;
  role?: AppRole;
  is_active?: boolean;
}

/**
 * Admin filter options
 */
interface AdminFilters {
  search?: string;
  role?: AppRole;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Admin without password_hash
 */
type SafeAdmin = Omit<Admin, "password_hash">;

/**
 * Admin service
 * Handles admin user management operations via Prisma
 */
export const adminService = {
  /**
   * Creates a new admin user with auto-generated password
   * Sends email notification with credentials
   */
  async create(data: CreateAdminDto, createdBy: string): Promise<SafeAdmin & { emailSent: boolean }> {
    // Check if admin already exists
    const existing = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      throw conflictError("Admin with this email already exists");
    }

    // Generate secure password
    const generatedPassword = generateSecurePassword(12);
    const passwordHash = await hashPassword(generatedPassword);

    const admin = await prisma.admin.create({
      data: {
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        full_name: data.full_name || null,
        role: data.role || "admin",
        is_active: true,
        created_by: createdBy,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        created_by: true,
      },
    });

    // Send email with credentials
    const emailSent = await emailService.sendAdminInvite({
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role,
      password: generatedPassword,
    });

    if (!emailSent) {
      console.warn(`Failed to send invite email to ${admin.email}`);
    }

    return { ...admin, emailSent };
  },

  /**
   * Gets a single admin by ID (excludes password_hash)
   */
  async getById(id: string): Promise<SafeAdmin> {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        created_by: true,
      },
    });

    if (!admin) {
      throw notFoundError("Admin");
    }

    return admin;
  },

  /**
   * Gets admin by email (for internal use)
   */
  async getByEmail(email: string): Promise<SafeAdmin | null> {
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        created_by: true,
      },
    });

    return admin;
  },

  /**
   * Lists admins with filters and pagination (excludes password_hash)
   */
  async list(filters: AdminFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: "insensitive" } },
        { full_name: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    // Execute queries in parallel
    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          is_active: true,
          created_at: true,
          created_by: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.admin.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: admins,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Updates an admin
   */
  async update(id: string, data: UpdateAdminDto): Promise<SafeAdmin> {
    // Verify admin exists
    await this.getById(id);

    const admin = await prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        created_by: true,
      },
    });

    return admin;
  },

  /**
   * Updates admin password
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.getById(id);

    const passwordHash = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id },
      data: { password_hash: passwordHash },
    });
  },

  /**
   * Resets admin password and sends email with new password
   */
  async resetPassword(id: string): Promise<{ emailSent: boolean }> {
    const admin = await this.getById(id);

    // Generate new password
    const newPassword = generateSecurePassword(12);
    const passwordHash = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id },
      data: { password_hash: passwordHash },
    });

    // Send email with new password
    const emailSent = await emailService.sendAdminInvite({
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role,
      password: newPassword,
    });

    return { emailSent };
  },

  /**
   * Deletes an admin (soft delete by deactivating)
   */
  async delete(id: string): Promise<void> {
    await this.getById(id);

    await prisma.admin.update({
      where: { id },
      data: { is_active: false },
    });
  },

  /**
   * Toggles admin active status
   */
  async toggleActive(id: string): Promise<SafeAdmin> {
    const admin = await this.getById(id);

    const updated = await prisma.admin.update({
      where: { id },
      data: { is_active: !admin.is_active },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
        created_by: true,
      },
    });

    return updated;
  },
};
