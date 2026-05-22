import { Router } from "express";
import crypto from "crypto";
import prisma from "../config/prisma";
import { addPaymentEventToQueue } from "../services/payment-queue.service";
import { successResponse, errorResponse } from "../utils/apiResponse";

const router = Router();


// GET /api/test/db
// This route checks if Node.js can talk to PostgreSQL through Prisma.
router.get("/db", async (req, res) => {
  try {
    const paymentEventsCount = await prisma.paymentEvent.count();

    return successResponse(res, "Database connected successfully", {
      paymentEventsCount,
    });
  } catch (error) {
    return errorResponse(res, "Database connection failed", error);
  }
});



// POST /api/test/simulate-payment
// Safe demo route for frontend testing.
//
// Future me:
// This route simulates a payment provider webhook without needing
// real Paystack signatures or API-key protected provider behavior.
router.post("/simulate-payment", async (req, res) => {
  try {
    const {
      amount = 5000,
      currency = "GBP",
      customerEmail = "demo@example.com",
      provider = "PAYSTACK",
    } = req.body;

    // Future me:
    // Date.now() alone is not safe during load testing because
    // many requests can happen within the same millisecond.
    //
    // So we combine timestamp + random UUID
    // to guarantee unique transaction references and provider event IDs.
    const uniqueId = `${Date.now()}-${crypto.randomUUID()}`;

    const paymentEvent = await prisma.paymentEvent.create({
      data: {
        provider,
        providerEventId: `demo_evt_${uniqueId}`,
        transactionRef: `DEMO-TXN-${uniqueId}`,
        amount: Number(amount),
        currency,
        customerEmail,
        status: "RECEIVED",
        rawPayload: {
          demo: true,
          source: "frontend-test-route",
          amount,
          currency,
          customerEmail,
        },
      },
    });

    const job = await addPaymentEventToQueue(paymentEvent.id);

    return successResponse(
      res,
      "Demo payment created and queued successfully",
      {
        paymentEvent,
        queue: {
          jobId: job.id,
          status: "QUEUED",
        },
      },
      201
    );
  } catch (error) {
    return errorResponse(res, "Failed to simulate payment", error);
  }
});


export default router;