import { Router } from "express";
import {
  getLedgerEntries,
  getLedgerSummary,
  processPaymentEventToLedger,
} from "../controllers/ledger.controller";

const router = Router();

router.post("/process/:paymentEventId", processPaymentEventToLedger);
router.get("/", getLedgerEntries);
router.get("/summary", getLedgerSummary);

export default router;