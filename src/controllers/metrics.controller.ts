import { Request, Response } from "express";
import prisma from "../config/prisma";

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

    return res.status(200).json({
      totalEvents,
      processed,
      failed,
      queued,
      processing,
      successRate: Number(successRate.toFixed(2)),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch system metrics",
    });
  }
};