import { Request, Response } from "express";
import prisma from "../config/prisma";
import crypto from "crypto";
import { successResponse, errorResponse } from "../utils/apiResponse";

// This endpoint creates a new API key for a client.
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const key = crypto.randomBytes(32).toString("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
      },
    });

    return successResponse(res, "API key created", { apiKey });
  } catch (error) {
    return errorResponse(res, "Failed to create API key", error);
  }
};
