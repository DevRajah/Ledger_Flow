import { Request, Response } from "express";
import prisma from "../config/prisma";
import { successResponse, errorResponse } from "../utils/apiResponse";

// This endpoint gives system-wide metrics.
//
// Simple meaning for future me:
// It shows how well the system is performing.
export const getSystemMetrics = async (req: Request, res: Response) => {
  try {
    const totalEvents = await prisma.paymentEvent.count();

    const processed = await prisma.paymentEvent.count({
      where: { status: "PROCESSED" },
    });

    const failed = await prisma.paymentEvent.count({
      where: { status: "FAILED" },
    });

    const queued = await prisma.paymentEvent.count({
      where: { status: "QUEUED" },
    });

    const processing = await prisma.paymentEvent.count({
      where: { status: "PROCESSING" },
    });

    const successRate =
      totalEvents === 0 ? 0 : (processed / totalEvents) * 100;

 return successResponse(res, "System metrics fetched successfully", {
  totalEvents,
  processed,
  failed,
  queued,
  processing,
  successRate: Number(successRate.toFixed(2)),
});
  } catch (error) {
    return errorResponse(res, "Failed to fetch system metrics", error);
  }
};