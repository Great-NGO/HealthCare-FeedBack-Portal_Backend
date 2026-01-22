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
 * Handles custom entries awaiting approval (e.g., custom facility names, departments, locations)
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
   * When approving, adds the entry to the appropriate table (health_facilities, etc.)
   */
  async updateStatus(
    id: string,
    status: PendingEntryStatus,
    approvedBy: string
  ): Promise<PendingEntry> {
    const entry = await this.getById(id);

    const updateData: any = { status };

    if (status === "approved") {
      updateData.approved_at = new Date();
      updateData.approved_by = approvedBy;

      // Add approved entry to appropriate table
      if (entry.entry_type === "facility" && entry.state && entry.lga && entry.value) {
        // Map facility_type to ownership_type
        const ownershipTypeMap: Record<string, "federal" | "state" | "private" | "unknown"> = {
          federal: "federal",
          state: "state",
          private: "private",
        };
        const ownershipType = ownershipTypeMap[entry.facility_type?.toLowerCase() || ""] || "unknown";

        // Check if facility already exists
        const existingFacility = await prisma.healthFacility.findFirst({
          where: {
            facility_name: { equals: entry.value, mode: "insensitive" },
            state: { equals: entry.state, mode: "insensitive" },
            lga: { equals: entry.lga, mode: "insensitive" },
          },
        });

        if (!existingFacility) {
          await prisma.healthFacility.create({
            data: {
              facility_name: entry.value,
              state: entry.state,
              lga: entry.lga,
              ownership_type: ownershipType,
            },
          });
          console.log(`Added approved facility to health_facilities: ${entry.value}`);
        }
      }
      // For departments and locations, they'll be queried from pending_entries with status='approved'
      // No need to create separate tables since they're merged with hardcoded lists in frontend
    }

    const updatedEntry = await prisma.pendingEntry.update({
      where: { id },
      data: updateData,
    });

    return updatedEntry;
  },

  /**
   * Gets all approved entries of a specific type (for dropdowns)
   */
  async getApprovedByType(entryType: string): Promise<string[]> {
    const entries = await prisma.pendingEntry.findMany({
      where: {
        entry_type: entryType,
        status: "approved",
      },
      select: {
        value: true,
      },
      distinct: ["value"],
      orderBy: {
        value: "asc",
      },
    });

    return entries.map((e) => e.value);
  },
};
