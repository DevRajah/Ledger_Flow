import rateLimit from "express-rate-limit";

// This limits how many requests a client can make.
//
// Simple meaning:
// Prevents abuse and protects the system.
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: "Too many requests, please try again later",
});