import { Router } from "express";
import authRoutes from "./auth.routes.js";
import feedbackRoutes from "./feedback.routes.js";
import adminRoutes from "./admin.routes.js";
import facilityRoutes from "./facility.routes.js";
import pendingEntryRoutes from "./pendingEntry.routes.js";
import surveyRoutes from "./survey.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

/**
 * API v1 Routes
 */
router.use("/auth", authRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/admins", adminRoutes);
router.use("/facilities", facilityRoutes);
router.use("/pending-entries", pendingEntryRoutes);
router.use("/surveys", surveyRoutes);
router.use("/uploads", uploadRoutes);

export default router;
