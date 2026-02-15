import type { Request, Response, NextFunction } from "express";
import { ngoService } from "../services/ngo.service.js";
import type { ApiResponse } from "../types/responses.js";

/**
 * @route GET /api/ngos
 * @description Get list of recognized NGOs for reporter organization dropdown
 * @access Public
 */
export async function getNgos(
  _req: Request,
  res: Response<ApiResponse<{ name: string }[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const data = await ngoService.list();
    res.status(200).json({
      success: true,
      message: "NGOs retrieved successfully",
      data,
      statusCode: 200,
      path: "/api/v1/ngos",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}
