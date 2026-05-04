import IORedis from "ioredis";

// This creates the Redis connection used by BullMQ.
// Redis is like a fast memory-based storage engine.
// BullMQ uses Redis to store background jobs.

// Future me:
// In local development, REDIS_URL can be empty, so we fallback to local Redis.
// In production on Render, we use the full REDIS_URL from Render Key Value.
export const redisConnection = new IORedis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
  {
    // BullMQ recommends this setting for reliable job processing.
    maxRetriesPerRequest: null,
  }
);