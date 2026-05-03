import { Request, Response } from "express";
import prisma from "../config/prisma";
import { paymentQueue } from "../queues/payment.queue";
import { successResponse, errorResponse } from "../utils/apiResponse";

// GET /api/queues/metrics
//
// What this endpoint does:
//
// It returns BOTH:
// 1. Live BullMQ queue counts
// 2. Historical processing stats from the database/audit logs
//
// Future me:
// BullMQ counts can be zero when jobs finish very quickly.
// That does NOT mean the queue is broken.
// It usually means the worker processed everything already.
//
// So for dashboard/demo purposes, we also calculate historical stats
// from PaymentEvent statuses and AuditLog records.
export const getPaymentQueueStats = async (req: Request, res: Response) => {
  try {
    // -------------------------------
    // 1. LIVE QUEUE COUNTS FROM BULLMQ
    // -------------------------------
    //
    // These show what is currently inside Redis/BullMQ right now.
    //
    // Example:
    // waiting = jobs waiting to be picked
    // active = jobs currently being processed
    // completed = completed jobs still retained by BullMQ
    // failed = failed jobs still retained by BullMQ
    // delayed = jobs scheduled for later
    const liveQueueCounts = await paymentQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed"
    );

    // -------------------------------
    // 2. HISTORICAL STATS FROM DATABASE
    // -------------------------------
    //
    // These are more useful for dashboards because they show
    // what has happened over time, even if BullMQ has already cleaned jobs.
    const totalPaymentEvents = await prisma.paymentEvent.count();

    const totalProcessedJobs = await prisma.paymentEvent.count({
      where: {
        status: "PROCESSED",
      },
    });

    const totalFailedJobs = await prisma.paymentEvent.count({
      where: {
        status: "FAILED",
      },
    });

    const totalQueuedJobs = await prisma.paymentEvent.count({
      where: {
        status: "QUEUED",
      },
    });

    const totalProcessingJobs = await prisma.paymentEvent.count({
      where: {
        status: "PROCESSING",
      },
    });

    // -------------------------------
    // 3. LAST PROCESSED TIME
    // -------------------------------
    //
    // We use audit logs because they record when a worker completed a job.
    const lastCompletedAuditLog = await prisma.auditLog.findFirst({
      where: {
        action: "PAYMENT_JOB_COMPLETED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const lastFailedAuditLog = await prisma.auditLog.findFirst({
      where: {
        action: "PAYMENT_JOB_FAILED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // -------------------------------
    // 4. SUCCESS RATE
    // -------------------------------
    //
    // This gives frontend a useful percentage for dashboard cards.
    const successRate =
      totalPaymentEvents === 0
        ? 0
        : Number(((totalProcessedJobs / totalPaymentEvents) * 100).toFixed(2));

    return successResponse(res, "Queue metrics fetched successfully", {
      queueName: "payment-processing-queue",

      // Live BullMQ state.
      // These numbers may be 0 if jobs finish quickly.
      liveQueueCounts,

      // Historical system stats.
      // These are better for portfolio dashboards.
      historicalProcessingStats: {
        totalPaymentEvents,
        totalProcessedJobs,
        totalFailedJobs,
        totalQueuedJobs,
        totalProcessingJobs,
        successRate,
        lastProcessedAt: lastCompletedAuditLog?.createdAt || null,
        lastFailedAt: lastFailedAuditLog?.createdAt || null,
      },

      explanation: {
        liveQueueCounts:
          "Live BullMQ counts show what is currently inside Redis. These can be 0 when jobs complete quickly.",
        historicalProcessingStats:
          "Historical stats come from PaymentEvent statuses and AuditLogs, so they remain useful for dashboards and demos.",
      },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch queue metrics", error);
  }
};