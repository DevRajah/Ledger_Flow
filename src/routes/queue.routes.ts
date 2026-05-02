import { Router } from "express";
import { getPaymentQueueStats } from "../controllers/queue.controller";

const router = Router();

// GET /api/queues/payment/stats
// Shows how many payment jobs are waiting, active, completed, failed, or delayed.
router.get("/payment/stats", getPaymentQueueStats);

export default router;