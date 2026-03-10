import { Router } from "express";
import { referralsController } from "../controllers/referrals.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validate, idParamValidator } from "../validators/index.js";
import { body } from "express-validator";

const router = Router();

/**
 * Public leaderboard
 * GET /api/v1/referrals/leaderboard
 */
router.get("/leaderboard", referralsController.getLeaderboard);

// Admin endpoints
router.use(authenticate);
router.use(requireAdmin);

/**
 * Partners
 */
router.post(
  "/partners",
  [
    body("display_name").isString().trim().isLength({ min: 2, max: 255 }).withMessage("display_name is required"),
    body("slug")
      .isString()
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("slug is required")
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i)
      .withMessage("slug must be URL-friendly (letters, numbers, hyphens)"),
  ],
  validate,
  referralsController.createPartner
);

router.get("/partners", referralsController.listPartners);

router.patch(
  "/partners/:id",
  [
    ...idParamValidator,
    body("display_name").optional().isString().trim().isLength({ min: 2, max: 255 }),
    body("slug")
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 80 })
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i),
    body("is_active").optional().isBoolean().toBoolean(),
  ],
  validate,
  referralsController.updatePartner
);

/**
 * Sessions
 */
router.post(
  "/sessions",
  [
    body("name").isString().trim().isLength({ min: 2, max: 255 }).withMessage("name is required"),
    body("starts_at").isISO8601().withMessage("starts_at must be an ISO date string"),
    body("ends_at").isISO8601().withMessage("ends_at must be an ISO date string"),
  ],
  validate,
  referralsController.createSession
);

router.get("/sessions", referralsController.listSessions);

router.post(
  "/sessions/:id/activate",
  idParamValidator,
  validate,
  referralsController.activateSession
);

/**
 * Links
 */
router.post(
  "/partners/:id/links",
  idParamValidator,
  validate,
  referralsController.generatePartnerLink
);

router.post(
  "/links/:id/revoke",
  idParamValidator,
  validate,
  referralsController.revokeLink
);

export default router;

