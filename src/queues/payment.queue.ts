import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

// This queue stores payment processing jobs.
//
// Simple meaning:
// When a webhook comes in, we do not process everything immediately.
// We put a small "task" into this queue, and a worker handles it later.
export const paymentQueue = new Queue("payment-processing-queue", {
  connection: redisConnection,
});