import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

// This middleware checks if the request has a valid API key.
//
// Simple meaning:
// Only allowed clients can use our system.
export const apiKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;

       if (!apiKey || Array.isArray(apiKey)) {
      return res.status(401).json({
        message: "A valid API key is required",
      });
    }

 
    const keyRecord = await prisma.apiKey.findUnique({
      where: {
        key: apiKey,
      },
    });

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(403).json({
        message: "Invalid or inactive API key",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "API key validation failed",
    });
  }
};