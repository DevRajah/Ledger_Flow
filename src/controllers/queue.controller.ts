import { Request, Response } from "express";
import { paymentQueue } from "../queues/payment.queue";

// This endpoint gives us queue statistics.
//
// Simple meaning for future me:
// It helps us know if jobs are waiting, running, completed, or failing.
export const getPaymentQueueStats = async (req: Request, res: Response) => {
  try {
    const stats = await paymentQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed"
    );

    return res.status(200).json({
      message: "Payment queue stats fetched successfully",
      queue: "payment-processing-queue",
      stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch payment queue stats",
      error: error.message,
    });
  }
};