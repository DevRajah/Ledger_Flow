import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createAuditLog } from "../services/audit.service";
import { createLedgerEntriesForPayment } from "../services/ledger.service";

// This receives fake Paystack webhook events from Postman.
export const receivePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const providerEventId = payload.eventId;
    const transactionRef = payload.transactionRef;
    const amount = payload.amount;
    const currency = payload.currency || "GBP";
    const customerEmail = payload.customerEmail;

    // Basic validation so bad webhook data does not enter our system.
    if (!providerEventId || !transactionRef || !amount) {
      return res.status(400).json({
        message: "eventId, transactionRef, and amount are required",
      });
    }

    // Idempotency check:
    // If Paystack sends the same event twice, we must not save/process it twice.
    const existingEvent = await prisma.paymentEvent.findUnique({
      where: {
        provider_providerEventId: {
          provider: "PAYSTACK",
          providerEventId,
        },
      },
    });

    if (existingEvent) {
      await createAuditLog({
        action: "DUPLICATE_WEBHOOK_DETECTED",
        entityType: "PaymentEvent",
        entityId: existingEvent.id,
        metadata: {
          provider: "PAYSTACK",
          providerEventId,
          transactionRef,
        },
      });

      return res.status(200).json({
        message: "Duplicate webhook ignored",
        paymentEventId: existingEvent.id,
      });
    }

    // Save the payment event.
    const paymentEvent = await prisma.paymentEvent.create({
      data: {
        provider: "PAYSTACK",
        providerEventId,
        transactionRef,
        amount,
        currency,
        customerEmail,
        rawPayload: payload,
      },
    });
    // Automatically create double-entry ledger records after saving the webhook.
const ledgerResult = await createLedgerEntriesForPayment(paymentEvent.id);
    // Record system audit log.
    await createAuditLog({
      action: "PAYSTACK_WEBHOOK_RECEIVED",
      entityType: "PaymentEvent",
      entityId: paymentEvent.id,
      metadata: {
        providerEventId,
        transactionRef,
        amount,
        currency,
      },
    });

    return res.status(201).json({
      message: "Paystack webhook received successfully",
      paymentEvent,
      ledgerResult,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      message: "Failed to process webhook",
    });
  }
};