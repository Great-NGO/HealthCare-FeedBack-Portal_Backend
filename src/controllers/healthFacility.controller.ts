import type { Request, Response, NextFunction } from "express";
import { healthFacilityService } from "../services/healthFacility.service.js";
import type { ApiResponse, ErrorResponse } from "../types/responses.js";

/**
 * Health Facility Controller
 * Handles cascading dropdown data for State → LGA → Facility selection
 */

/**
 * Get all unique states
 * @route GET /api/health-facilities/states
 */
export async function getStates(
  req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const states = await healthFacilityService.getAllStates();

    res.status(200).json({
      success: true,
      message: "States retrieved successfully",
      data: states,
      statusCode: 200,
      path: req.originalUrl,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get LGAs for a specific state
 * @route GET /api/health-facilities/states/:state/lgas
 */
export async function getLGAsForState(
  req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const { state } = req.params;
    const lgas = await healthFacilityService.getLGAsForState(state);

    res.status(200).json({
      success: true,
      message: `LGAs for ${state} retrieved successfully`,
      data: lgas,
      statusCode: 200,
      path: req.originalUrl,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get facilities for a specific state and LGA
 * @route GET /api/health-facilities/states/:state/lgas/:lga/facilities
 */
export async function getFacilitiesForLGA(
  req: Request,
  res: Response<ApiResponse<{ name: string; type: string }[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const { state, lga } = req.params;
    const facilities = await healthFacilityService.getFacilitiesForLGA(state, lga);

    res.status(200).json({
      success: true,
      message: `Facilities for ${state}, ${lga} retrieved successfully`,
      data: facilities,
      statusCode: 200,
      path: req.originalUrl,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Search facilities by name
 * @route GET /api/health-facilities/search
 * @query q - Search query
 * @query state - Optional state filter
 * @query lga - Optional LGA filter
 * @query limit - Max results (default 20)
 */
export async function searchFacilities(
  req: Request,
  res: Response<ApiResponse<{ name: string; type: string; state: string; lga: string }[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const { q, state, lga, limit } = req.query;

    if (!q || typeof q !== "string" || q.length < 2) {
      res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
        data: [],
        statusCode: 400,
        path: req.originalUrl,
        timestamp: new Date(),
      });
      return;
    }

    const facilities = await healthFacilityService.searchFacilities(
      q,
      state as string | undefined,
      lga as string | undefined,
      limit ? parseInt(limit as string, 10) : 20
    );

    res.status(200).json({
      success: true,
      message: `Found ${facilities.length} facilities matching "${q}"`,
      data: facilities,
      statusCode: 200,
      path: req.originalUrl,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get facility statistics
 * @route GET /api/health-facilities/stats
 */
export async function getStats(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await healthFacilityService.getStats();

    res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: stats,
      statusCode: 200,
      path: req.originalUrl,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
}
