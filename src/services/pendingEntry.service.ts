import { prisma } from "../config/prisma.js";
import { notFoundError } from "../middleware/errorHandler.js";
import type { PendingEntry, PendingEntryStatus } from "@prisma/client";

/**
 * Pending entry filter options
 */
interface PendingEntryFilters {
  status?: PendingEntryStatus | "all";
  entry_type?: string;
  page?: number;
  limit?: number;
}

/**
 * Pending entry service using Prisma
 * Handles custom entries awaiting approval (e.g., custom sexuality values)
 */
export const pendingEntryService = {
  /**
   * Gets a single entry by ID
   */
  async getById(id: string): Promise<PendingEntry> {
    const entry = await prisma.pendingEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw notFoundError("Pending entry");
    }

    return entry;
  },

  /**
   * Lists pending entries with filters and pagination
   */
  async list(filters: PendingEntryFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.status && filters.status !== "all") {
      where.status = filters.status;
    }

    if (filters.entry_type) {
      where.entry_type = filters.entry_type;
    }

    // Execute queries in parallel
    const [entries, total] = await Promise.all([
      prisma.pendingEntry.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.pendingEntry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: entries,
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
   * Updates entry status (approve/reject)
   */
  async updateStatus(
    id: string,
    status: PendingEntryStatus,
    approvedBy: string
  ): Promise<PendingEntry> {
    await this.getById(id);

    const updateData: any = { status };

    if (status === "approved") {
      updateData.approved_at = new Date();
      updateData.approved_by = approvedBy;
    }

    const entry = await prisma.pendingEntry.update({
      where: { id },
      data: updateData,
    });

    return entry;
  },
};
