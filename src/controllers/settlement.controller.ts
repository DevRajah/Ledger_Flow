import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createSettlementRecord } from "../services/settlement.service";

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
      return res.status(400).json({
        message:
          "provider, providerTransactionId, transactionRef, and amount are required",
      });
    }

    const result = await createSettlementRecord({
      provider,
      providerTransactionId,
      transactionRef,
      amount,
      currency,
      settledAt,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to create settlement record",
      error: error.message,
    });
  }
};

export const getSettlementRecords = async (req: Request, res: Response) => {
  try {
    const settlements = await prisma.settlementRecord.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      total: settlements.length,
      settlements,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch settlement records",
    });
  }
};