import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getPaymentEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.paymentEvent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      total: events.length,
      events,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch payment events",
    });
  }
};