import { Request, Response } from "express";
import { paymentQueue } from "../queues/payment.queue";
import { successResponse, errorResponse } from "../utils/apiResponse";

// This endpoint gives us queue statistics.
//
// Simple meaning for future me:
// It helps us know if jobs are waiting, running, completed, or failing.
// GET /api/queues/metrics
// Shows queue health for frontend dashboard.
export const getPaymentQueueStats = async (req: Request, res: Response) => {
  try {
    const stats = await paymentQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed"
    );

    return successResponse(res, "Payment queue stats fetched successfully", {
      queue: "payment-processing-queue",
      stats,
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch payment queue stats", error);
  }
};