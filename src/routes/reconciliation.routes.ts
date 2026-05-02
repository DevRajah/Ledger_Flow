import { Router } from "express";
import {
  getReconciliationSummary,
  reconcileOneSettlement,
} from "../controllers/reconciliation.controller";

const router = Router();

router.post("/:settlementId", reconcileOneSettlement);
router.get("/summary", getReconciliationSummary);

export default router;