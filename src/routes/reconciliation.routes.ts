import { Router } from "express";
import {
  getReconciliationReport,
  getReconciliationSummary,
  reconcileAllPending,
  reconcileOneSettlement,
} from "../controllers/reconciliation.controller";

const router = Router();

// This gives a short count summary.
// Example: pending=2, matched=4, mismatched=1
router.get("/summary", getReconciliationSummary);

// This gives a deeper report with totals and issue records.
// Useful for dashboard/reporting.
router.get("/report", getReconciliationReport);

// POST /api/reconciliation/run
// Frontend-friendly route to reconcile all pending settlements.
router.post("/run", reconcileAllPending);

// This reconciles all settlements that are still PENDING.
// Useful after bulk CSV-style import.
router.post("/run-pending", reconcileAllPending);


// POST /api/reconciliation/:settlementId
// This reconciles one settlement by its ID.
// Keep this LAST so it does not clash with /summary or /report.
router.post("/:settlementId", reconcileOneSettlement);

export default router;