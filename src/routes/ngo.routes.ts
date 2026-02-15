import { Router } from "express";
import { getNgos } from "../controllers/ngo.controller.js";

const router = Router();

router.get("/", getNgos);

export default router;
