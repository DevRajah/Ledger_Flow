import IORedis from "ioredis";

// This creates the Redis connection used by BullMQ.
// Redis is like a fast memory-based storage engine.
// BullMQ uses Redis to store background jobs.
export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,

  // BullMQ recommends this setting for reliable job processing.
  maxRetriesPerRequest: null,
});