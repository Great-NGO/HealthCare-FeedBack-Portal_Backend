import { Router } from "express";
import {
  getStates,
  getLGAsForState,
  getFacilitiesForLGA,
  searchFacilities,
  getStats,
} from "../controllers/healthFacility.controller.js";

const router = Router();

/**
 * @route GET /api/health-facilities/states
 * @description Get all unique states for dropdown
 * @access Public
 */
router.get("/states", getStates);

/**
 * @route GET /api/health-facilities/states/:state/lgas
 * @description Get all LGAs for a specific state
 * @access Public
 */
router.get("/states/:state/lgas", getLGAsForState);

/**
 * @route GET /api/health-facilities/states/:state/lgas/:lga/facilities
 * @description Get all facilities for a specific state and LGA
 * @access Public
 */
router.get("/states/:state/lgas/:lga/facilities", getFacilitiesForLGA);

/**
 * @route GET /api/health-facilities/search
 * @description Search facilities by name
 * @query q - Search query (min 2 chars)
 * @query state - Optional state filter
 * @query lga - Optional LGA filter
 * @query limit - Max results (default 20)
 * @access Public
 */
router.get("/search", searchFacilities);

/**
 * @route GET /api/health-facilities/stats
 * @description Get facility statistics
 * @access Public
 */
router.get("/stats", getStats);

export default router;
