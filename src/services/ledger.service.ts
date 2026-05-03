import prisma from "../config/prisma";
import { createAuditLog } from "./audit.service";

export const createLedgerEntriesForPayment = async (paymentEventId: string) => {
  // First, find the payment event.
  const paymentEvent = await prisma.paymentEvent.findUnique({
    where: {
      id: paymentEventId,
    },
    include: {
      ledgerEntries: true,
    },
  });

  if (!paymentEvent) {
    throw new Error("Payment event not found");
  }

  // If ledger entries already exist, do not create them again.
  // This protects us from double-processing.
  if (paymentEvent.ledgerEntries.length > 0) {
    await createAuditLog({
      action: "LEDGER_ENTRIES_ALREADY_EXIST",
      entityType: "PaymentEvent",
      entityId: paymentEvent.id,
      metadata: {
        transactionRef: paymentEvent.transactionRef,
      },
    });

    return {
      message: "Ledger entries already exist for this payment event",
      paymentEvent,
    };
  }

  // We use a transaction because both entries must be created together.
  // If one fails, both fail.
  const result = await prisma.$transaction(async (tx) => {
    const creditEntry = await tx.ledgerEntry.create({
      data: {
        paymentEventId: paymentEvent.id,
        entryType: "CREDIT",
        account: "CUSTOMER_PAYMENT_ACCOUNT",
        amount: paymentEvent.amount,
        currency: paymentEvent.currency,
        description: `Payment received for ${paymentEvent.transactionRef}`,
      },
    });

    const debitEntry = await tx.ledgerEntry.create({
      data: {
        paymentEventId: paymentEvent.id,
        entryType: "DEBIT",
        account: "PROVIDER_CLEARING_ACCOUNT",
        amount: paymentEvent.amount,
        currency: paymentEvent.currency,
        description: `Provider clearing entry for ${paymentEvent.transactionRef}`,
      },
    });

    const updatedPaymentEvent = await tx.paymentEvent.update({
      where: {
        id: paymentEvent.id,
      },
      data: {
        status: "PROCESSED",
      },
    });

    return {
      creditEntry,
      debitEntry,
      paymentEvent: updatedPaymentEvent,
    };
  });

  await createAuditLog({
    action: "DOUBLE_ENTRY_LEDGER_CREATED",
    entityType: "PaymentEvent",
    entityId: paymentEvent.id,
    metadata: {
      transactionRef: paymentEvent.transactionRef,
      amount: paymentEvent.amount,
      currency: paymentEvent.currency,
      entriesCreated: 2,
    },
  });

  return result;
};

