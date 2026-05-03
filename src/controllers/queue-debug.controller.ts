import { Request, Response } from "express";
import { paymentQueue } from "../queues/payment.queue";
import { successResponse, errorResponse } from "../utils/apiResponse";
// Shows failed jobs in the queue.
export const getFailedJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await paymentQueue.getFailed();

    const formatted = jobs.map((job) => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
    }));

    return successResponse(res, "Failed jobs fetched successfully", {
      total: formatted.length,
      jobs: formatted,
    });
} catch (error) {
    return errorResponse(res, "Failed to fetch failed jobs", error);
  }
};