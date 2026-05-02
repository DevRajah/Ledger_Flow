import prisma from "../config/prisma";
import { paymentQueue } from "../queues/payment.queue";
import { createAuditLog } from "./audit.service";

// This function adds a payment event to the background queue.
//
// Simple meaning for future me:
// The webhook saves the payment event first.
// Then this function marks that event as QUEUED.
// After that, it adds a BullMQ job so the worker can process it later.
//
// Flow:
// RECEIVED → QUEUED → PROCESSING → PROCESSED / FAILED
export const addPaymentEventToQueue = async (paymentEventId: string) => {
  // Before adding the job to BullMQ, update the payment event status.
  // This helps us know that the event has moved from "received" to "waiting for background processing".
  await prisma.paymentEvent.update({
    where: { id: paymentEventId },
    data: { status: "QUEUED" },
  });

  // Add the actual background job to BullMQ.
  // This job only carries the paymentEventId because the worker can use that ID
  // to fetch the full payment event from PostgreSQL.
  const job = await paymentQueue.add(
    "process-payment-event",
    {
      paymentEventId,
    },
    {
      // If processing fails, BullMQ will retry this job 3 times.
      attempts: 3,

      // Wait 3 seconds before trying again after a failure.
      backoff: {
        type: "fixed",
        delay: 3000,
      },

      // Keep successful jobs for a short time so we can debug recent activity.
      removeOnComplete: {
        age: 60 * 60,
        count: 100,
      },

      // Keep failed jobs for 24 hours so we can inspect what went wrong.
      removeOnFail: {
        age: 24 * 60 * 60,
      },
    }
  );

  // Save an audit log so we have proof that the payment event was queued.
  // This is useful for debugging, compliance, and explaining the event lifecycle.
  await createAuditLog({
    action: "PAYMENT_EVENT_QUEUED",
    entityType: "PaymentEvent",
    entityId: paymentEventId,
    metadata: {
      jobId: job.id,
      queueName: "payment-processing-queue",
    },
  });

  return job;
};