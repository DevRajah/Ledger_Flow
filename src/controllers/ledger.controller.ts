import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createLedgerEntriesForPayment } from "../services/ledger.service";
import { successResponse, errorResponse } from "../utils/apiResponse";


export const processPaymentEventToLedger = async (req: Request, res: Response) => {
  try {
    const { paymentEventId } = req.params;

    const result = await createLedgerEntriesForPayment(paymentEventId as string);

    return res.status(201).json({
      message: "Ledger entries processed successfully",
      result,
    });
  } catch (error: any) {
    return errorResponse(res, "Failed to process payment event into ledger", error);
  }
};

export const getLedgerEntries = async (req: Request, res: Response) => {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        paymentEvent: true,
      },
    });

    // Future me:
    // The frontend needs transactionRef directly.
    // We flatten it here so React does not have to dig into paymentEvent every time.
    const mappedEntries = entries.map((entry) => ({
      id: entry.id,
      paymentEventId: entry.paymentEventId,
      transactionRef: entry.paymentEvent?.transactionRef || null,
      provider: entry.paymentEvent?.provider || null,
      entryType: entry.entryType,
      account: entry.account,
      amount: entry.amount,
      currency: entry.currency,
      description: entry.description,
      createdAt: entry.createdAt,
      paymentEvent: entry.paymentEvent,
    }));

    return successResponse(
      res,
      "Ledger entries fetched successfully",
      mappedEntries
    );
  } catch (error) {
    return errorResponse(res, "Failed to fetch ledger entries", error);
  }
};

export const getLedgerSummary = async (req: Request, res: Response) => {
  try {
    const credits = await prisma.ledgerEntry.aggregate({
      where: {
        entryType: "CREDIT",
      },
      _sum: {
        amount: true,
      },
    });

    const debits = await prisma.ledgerEntry.aggregate({
      where: {
        entryType: "DEBIT",
      },
      _sum: {
        amount: true,
      },
    });

    const totalCredits = credits._sum.amount || 0;
    const totalDebits = debits._sum.amount || 0;

    return res.status(200).json({
      totalCredits,
      totalDebits,
      balanced: totalCredits === totalDebits,
      difference: totalCredits - totalDebits,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch ledger summary",
    });
  }
};