import { Router } from "express";
import { getSystemMetrics } from "../controllers/metrics.controller";

const router = Router();

// GET /api/metrics
// Shows system performance metrics.
router.get("/", getSystemMetrics);

export default router;