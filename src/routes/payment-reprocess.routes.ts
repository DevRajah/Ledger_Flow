import { Router } from "express";
import { reprocessPaymentEvent } from "../controllers/payment-reprocess.controller";

const router = Router();

// POST /api/payments/:id/reprocess
// Frontend-friendly route to reprocess a failed payment event.
router.post("/:id/reprocess", reprocessPaymentEvent);

// POST /api/payments/reprocess/:paymentEventId
// Manually retry processing a payment event.
router.post("/reprocess/:paymentEventId", reprocessPaymentEvent);

export default router;