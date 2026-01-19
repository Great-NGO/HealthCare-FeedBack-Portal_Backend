import { prisma } from "../config/prisma.js";
import { AppError, notFoundError } from "../middleware/errorHandler.js";
import type { CustomFacility, FacilityStatus } from "@prisma/client";

/**
 * Create facility DTO
 */
interface CreateFacilityDto {
  name: string;
  facility_type: string;
  state: string;
  lga: string;
}

/**
 * Facility filter options
 */
interface FacilityFilters {
  status?: FacilityStatus | "all";
  state?: string;
  facility_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Custom facility service using Prisma
 */
export const facilityService = {
  /**
   * Creates a new custom facility
   */
  async create(data: CreateFacilityDto): Promise<CustomFacility> {
    const facility = await prisma.customFacility.create({
      data: {
        ...data,
        status: "pending",
      },
    });

    return facility;
  },

  /**
   * Gets a single facility by ID
   */
  async getById(id: string): Promise<CustomFacility> {
    const facility = await prisma.customFacility.findUnique({
      where: { id },
    });

    if (!facility) {
      throw notFoundError("Facility");
    }

    return facility;
  },

  /**
   * Lists facilities with filters and pagination
   */
  async list(filters: FacilityFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.status && filters.status !== "all") {
      where.status = filters.status;
    }

    if (filters.state) {
      where.state = filters.state;
    }

    if (filters.facility_type) {
      where.facility_type = filters.facility_type;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { lga: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Execute queries in parallel
    const [facilities, total] = await Promise.all([
      prisma.customFacility.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.customFacility.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: facilities,
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
   * Updates facility status (approve/reject)
   */
  async updateStatus(
    id: string,
    status: FacilityStatus,
    approvedBy: string
  ): Promise<CustomFacility> {
    await this.getById(id);

    const updateData: any = { status };

    if (status === "approved") {
      updateData.approved_at = new Date();
      updateData.approved_by = approvedBy;
    }

    const facility = await prisma.customFacility.update({
      where: { id },
      data: updateData,
    });

    return facility;
  },

  /**
   * Deletes a facility
   */
  async delete(id: string): Promise<void> {
    await this.getById(id);

    await prisma.customFacility.delete({
      where: { id },
    });
  },
};
