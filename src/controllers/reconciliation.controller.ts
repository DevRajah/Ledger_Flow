import { Request, Response } from "express";
import prisma from "../config/prisma";
import { reconcileSettlementRecord } from "../services/reconciliation.service";

export const reconcileOneSettlement = async (req: Request, res: Response) => {
  try {
    const { settlementId } = req.params;

    const result = await reconcileSettlementRecord(settlementId as string);

    return res.status(200).json({
      message: "Reconciliation completed",
      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to reconcile settlement",
      error: error.message,
    });
  }
};

export const getReconciliationSummary = async (req: Request, res: Response) => {
  try {
    const pending = await prisma.settlementRecord.count({
      where: { reconciliationStatus: "PENDING" },
    });

    const matched = await prisma.settlementRecord.count({
      where: { reconciliationStatus: "MATCHED" },
    });

    const mismatched = await prisma.settlementRecord.count({
      where: { reconciliationStatus: "MISMATCHED" },
    });

    const missingInLedger = await prisma.settlementRecord.count({
      where: { reconciliationStatus: "MISSING_IN_LEDGER" },
    });

    return res.status(200).json({
      pending,
      matched,
      mismatched,
      missingInLedger,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch reconciliation summary",
    });
  }
};