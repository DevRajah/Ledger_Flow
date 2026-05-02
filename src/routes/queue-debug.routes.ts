import { Router } from "express";
import { getFailedJobs } from "../controllers/queue-debug.controller";

const router = Router();

// GET /api/queues/payment/failed
// Shows failed jobs for debugging.
router.get("/payment/failed", getFailedJobs);

export default router;