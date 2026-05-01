import { Router } from "express";
import prisma from "../config/prisma";

const router = Router();

// This route checks if Node.js can talk to PostgreSQL through Prisma.
router.get("/db", async (req, res) => {
  try {
    const totalPaymentEvents = await prisma.paymentEvent.count();

    res.status(200).json({
      message: "Node.js is connected to PostgreSQL through Prisma",
      totalPaymentEvents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error,
    });
  }
});

export default router;