import { Router } from "express";
import {
  addSettlementRecord,
  getSettlementRecords,
} from "../controllers/settlement.controller";

const router = Router();

router.post("/", addSettlementRecord);
router.get("/", getSettlementRecords);

export default router;