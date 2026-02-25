import { Router } from "express";
import authRoutes from "./auth.routes.js";
import feedbackRoutes from "./feedback.routes.js";
import adminRoutes from "./admin.routes.js";
import facilityRoutes from "./facility.routes.js";
import healthFacilityRoutes from "./healthFacility.routes.js";
import pendingEntryRoutes from "./pendingEntry.routes.js";
import uploadRoutes from "./upload.routes.js";
import ngoRoutes from "./ngo.routes.js";

const router = Router();

/**
 * API v1 Routes
 */
router.use("/auth", authRoutes);
router.use("/ngos", ngoRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/admins", adminRoutes);
router.use("/facilities", facilityRoutes);
router.use("/health-facilities", healthFacilityRoutes); // GRID3 health facilities data
router.use("/pending-entries", pendingEntryRoutes);
router.use("/uploads", uploadRoutes);

export default router;
