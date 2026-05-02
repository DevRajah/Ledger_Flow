import { Request, Response } from "express";
import { paymentQueue } from "../queues/payment.queue";

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

    return res.status(200).json({
      total: formatted.length,
      jobs: formatted,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to fetch failed jobs",
      error: error.message,
    });
  }
};