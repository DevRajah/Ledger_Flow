import { Request, Response } from "express";
import prisma from "../config/prisma";
import { successResponse, errorResponse } from "../utils/apiResponse";


// Fetches payment events and supports filtering.
export const getPaymentEvents = async (req: Request, res: Response) => {
  try {
    const { status, provider, transactionRef } = req.query;

    const events = await prisma.paymentEvent.findMany({
      where: {
        status: status ? (status as any) : undefined,
        provider: provider ? (provider as any) : undefined,

        // contains allows partial search.
        // Example: transactionRef=DEMO can match DEMO-TXN-123.
        transactionRef: transactionRef
          ? {
              contains: String(transactionRef),
              mode: "insensitive",
            }
          : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ledgerEntries: true,
      },
    });

    return successResponse(res, "Payment events fetched successfully", events);
  } catch (error) {
    return errorResponse(res, "Failed to fetch payment events", error);
  }
};