import { Router } from "express";
import {
  addSettlementRecord,
  bulkImportSettlements,
  getSettlementRecords,
} from "../controllers/settlement.controller";

const router = Router();

// This creates many settlement records at once.
// Use this when simulating provider CSV settlement import.
router.post("/bulk", bulkImportSettlements);

// This creates one settlement record manually.
router.post("/", addSettlementRecord);

// This fetches settlement records.
// Supports filters like status, provider, transactionRef.
router.get("/", getSettlementRecords);

export default router;