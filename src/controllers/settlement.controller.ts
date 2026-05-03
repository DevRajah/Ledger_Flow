import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createSettlementRecord } from "../services/settlement.service";
import { successResponse, errorResponse } from "../utils/apiResponse";

// This controller manages settlement records. It allows adding new settlement records and fetching existing ones with optional filters.
export const addSettlementRecord = async (req: Request, res: Response) => {
  try {
    const {
      provider,
      providerTransactionId,
      transactionRef,
      amount,
      currency,
      settledAt,
    } = req.body;

    if (!provider || !providerTransactionId || !transactionRef || !amount) {
      return errorResponse(res, "provider, providerTransactionId, transactionRef, and amount are required");
    }

    const result = await createSettlementRecord({
      provider,
      providerTransactionId,
      transactionRef,
      amount,
      currency,
      settledAt,
    });

    return successResponse(res, "Settlement record created successfully", result, 201);
  } catch (error: any) {
    return errorResponse(res, "Failed to create settlement record", error);
  }
};

// This endpoint fetches settlement records.
// It also supports filters using query params.
//
// Example:
// /api/settlements?status=MISMATCHED
// /api/settlements?provider=PAYSTACK
// /api/settlements?transactionRef=TXN-LEDGER-003
export const getSettlementRecords = async (req: Request, res: Response) => {
  try {
    const { status, provider, transactionRef } = req.query;

    const settlements = await prisma.settlementRecord.findMany({
      where: {
        reconciliationStatus: status ? (status as any) : undefined,
        provider: provider ? (provider as any) : undefined,
        transactionRef: transactionRef ? String(transactionRef) : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      total: settlements.length,
      filters: {
        status: status || null,
        provider: provider || null,
        transactionRef: transactionRef || null,
      },
      settlements,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch settlement records",
    });
  }
};

// This endpoint accepts many settlement records at once.
// We call it "CSV-style" because later a real CSV upload can be converted
// into this same JSON array format.
//
// For now, Postman will send an array of settlement objects.
export const bulkImportSettlements = async (req: Request, res: Response) => {
  try {
    const settlements = req.body.settlements;

   if (!Array.isArray(settlements) || settlements.length === 0) {
  return errorResponse(
    res,
    "Settlement import failed",
    "settlements must be a non-empty array",
    400
  );
}
    const results = [];

for (const settlement of settlements) {
  if (
    !settlement.provider ||
    !settlement.providerTransactionId ||
    !settlement.transactionRef ||
    !settlement.amount
  ) {
    return errorResponse(
      res,
      "Settlement import failed",
      "Each settlement must include provider, providerTransactionId, transactionRef, and amount",
      400
    );
  }

  const result = await createSettlementRecord({
    provider: settlement.provider,
    providerTransactionId: settlement.providerTransactionId,
    transactionRef: settlement.transactionRef,
    amount: settlement.amount,
    currency: settlement.currency,
    settledAt: settlement.settledAt,
  });

  results.push(result);
}

    return successResponse(res, "Bulk settlement import completed", {
      totalSubmitted: settlements.length,
      results,
    }, 201);
   
  } catch (error: any) {
    return errorResponse(res, "Failed to bulk import settlements", error);
  }
};