import { Request, Response } from "express";
import prisma from "../config/prisma";
import crypto from "crypto";

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

    return res.status(201).json({
      message: "API key created",
      apiKey,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create API key",
    });
  }
};