import { Router } from "express";
import { getPaymentQueueStats } from "../controllers/queue.controller";

const router = Router();

// GET /api/queues/metrics
//
// What this endpoint does:
// Gives frontend queue dashboard data.
//
// It includes:
// - live BullMQ counts
// - historical processed/failed totals
// - last processed timestamp
router.get("/metrics", getPaymentQueueStats);

// Old route kept for Postman/backward compatibility.
router.get("/payment/stats", getPaymentQueueStats);

export default router;