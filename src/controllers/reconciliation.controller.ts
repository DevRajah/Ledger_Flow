import { Request, Response } from "express";
import prisma from "../config/prisma";

import {
  reconcileSettlementRecord,
  reconcileAllPendingSettlements,
} from "../services/reconciliation.service";

// This controller handles reconciliation of settlement records against ledger entries.
// It provides endpoints to reconcile individual settlements, get reconciliation summaries, and generate detailed reports.
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
// This endpoint provides a quick summary of the reconciliation status of all settlements.
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

// This endpoint reconciles every settlement that is still PENDING.
// It is useful when many settlement records have been imported at once.
export const reconcileAllPending = async (req: Request, res: Response) => {
  try {
    const result = await reconcileAllPendingSettlements();

    return res.status(200).json({
      message: "All pending settlements reconciled successfully",
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to reconcile pending settlements",
      error: error.message,
    });
  }
};

// This endpoint gives a more detailed reconciliation report.
// It shows how many records matched, mismatched, are missing in ledger, etc.
export const getReconciliationReport = async (req: Request, res: Response) => {
  try {
    const totalSettlements = await prisma.settlementRecord.count();

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

    const totalSettledAmount = await prisma.settlementRecord.aggregate({
      _sum: {
        amount: true,
      },
    });

    const mismatchRecords = await prisma.settlementRecord.findMany({
      where: {
        reconciliationStatus: {
          in: ["MISMATCHED", "MISSING_IN_LEDGER"],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      totalSettlements,
      pending,
      matched,
      mismatched,
      missingInLedger,
      totalSettledAmount: totalSettledAmount._sum.amount || 0,
      issueCount: mismatchRecords.length,
      issues: mismatchRecords,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate reconciliation report",
    });
  }
};