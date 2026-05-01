import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createLedgerEntriesForPayment } from "../services/ledger.service";

export const processPaymentEventToLedger = async (req: Request, res: Response) => {
  try {
    const { paymentEventId } = req.params;

    const result = await createLedgerEntriesForPayment(paymentEventId);

    return res.status(201).json({
      message: "Ledger entries processed successfully",
      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to process payment event into ledger",
      error: error.message,
    });
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

    return res.status(200).json({
      total: entries.length,
      entries,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch ledger entries",
    });
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