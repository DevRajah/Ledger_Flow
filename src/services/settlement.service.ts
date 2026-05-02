import prisma from "../config/prisma";
import { createAuditLog } from "./audit.service";

export const createSettlementRecord = async (data: {
  provider: "PAYSTACK" | "STRIPE" | "PAYPAL";
  providerTransactionId: string;
  transactionRef: string;
  amount: number;
  currency?: string;
  settledAt?: string;
}) => {
  const existingSettlement = await prisma.settlementRecord.findUnique({
    where: {
      provider_providerTransactionId: {
        provider: data.provider,
        providerTransactionId: data.providerTransactionId,
      },
    },
  });

  if (existingSettlement) {
    await createAuditLog({
      action: "DUPLICATE_SETTLEMENT_RECORD_DETECTED",
      entityType: "SettlementRecord",
      entityId: existingSettlement.id,
      metadata: data,
    });

    return {
      message: "Duplicate settlement record ignored",
      settlement: existingSettlement,
    };
  }

  const settlement = await prisma.settlementRecord.create({
    data: {
      provider: data.provider,
      providerTransactionId: data.providerTransactionId,
      transactionRef: data.transactionRef,
      amount: data.amount,
      currency: data.currency || "GBP",
      settledAt: data.settledAt ? new Date(data.settledAt) : new Date(),
    },
  });

  await createAuditLog({
    action: "SETTLEMENT_RECORD_CREATED",
    entityType: "SettlementRecord",
    entityId: settlement.id,
    metadata: {
      provider: data.provider,
      providerTransactionId: data.providerTransactionId,
      transactionRef: data.transactionRef,
      amount: data.amount,
    },
  });

  return {
    message: "Settlement record created",
    settlement,
  };
};