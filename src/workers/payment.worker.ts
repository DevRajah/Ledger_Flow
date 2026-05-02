import "dotenv/config";
import prisma from "../config/prisma";
import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { createLedgerEntriesForPayment } from "../services/ledger.service";
import { createAuditLog } from "../services/audit.service";

// This worker listens for payment jobs from Redis/BullMQ.
//
// Simple meaning:
// The API receives the webhook.
// The queue stores the work.
// This worker does the heavy financial processing.
export const paymentWorker = new Worker(
  "payment-processing-queue",

async (job: Job<{ paymentEventId: string }>) => {
  const { paymentEventId } = job.data;

  // Set status → PROCESSING
  await prisma.paymentEvent.update({
    where: { id: paymentEventId },
    data: { status: "PROCESSING" },
  });

  await createAuditLog({
    action: "PAYMENT_JOB_STARTED",
    entityType: "PaymentEvent",
    entityId: paymentEventId,
  });

  const result = await createLedgerEntriesForPayment(paymentEventId);

  // Set status → PROCESSED
  await prisma.paymentEvent.update({
    where: { id: paymentEventId },
    data: { status: "PROCESSED" },
  });

  await createAuditLog({
    action: "PAYMENT_JOB_COMPLETED",
    entityType: "PaymentEvent",
    entityId: paymentEventId,
  });

  return result;
},
  {
    connection: redisConnection,
  }
);

// This runs when a job succeeds.
paymentWorker.on("completed", (job) => {
  console.log(`Payment job completed: ${job.id}`);
});

// This runs when a job fails.
paymentWorker.on("failed", async (job, error) => {
  if (!job) return;

  await prisma.paymentEvent.update({
    where: { id: job.data.paymentEventId },
    data: { status: "FAILED" },
  });

  await createAuditLog({
    action: "PAYMENT_JOB_FAILED",
    entityType: "PaymentEvent",
    entityId: job.data.paymentEventId,
    metadata: {
      jobId: job.id,
      error: error.message,
    },
  });
});