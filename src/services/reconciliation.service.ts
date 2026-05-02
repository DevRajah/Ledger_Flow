import prisma from "../config/prisma";
import { createAuditLog } from "./audit.service";

export const reconcileSettlementRecord = async (settlementId: string) => {
  const settlement = await prisma.settlementRecord.findUnique({
    where: {
      id: settlementId,
    },
  });

  if (!settlement) {
    throw new Error("Settlement record not found");
  }

  const paymentEvent = await prisma.paymentEvent.findFirst({
    where: {
      provider: settlement.provider,
      transactionRef: settlement.transactionRef,
      status: "PROCESSED",
    },
    include: {
      ledgerEntries: true,
    },
  });

  if (!paymentEvent) {
    const updatedSettlement = await prisma.settlementRecord.update({
      where: {
        id: settlement.id,
      },
      data: {
        reconciliationStatus: "MISSING_IN_LEDGER",
        mismatchReason: "Provider settlement exists, but no processed ledger event was found.",
      },
    });

    await createAuditLog({
      action: "RECONCILIATION_MISSING_IN_LEDGER",
      entityType: "SettlementRecord",
      entityId: settlement.id,
      metadata: {
        transactionRef: settlement.transactionRef,
      },
    });

    return updatedSettlement;
  }

  if (paymentEvent.amount !== settlement.amount) {
    const updatedSettlement = await prisma.settlementRecord.update({
      where: {
        id: settlement.id,
      },
      data: {
        reconciliationStatus: "MISMATCHED",
        mismatchReason: `Amount mismatch. Ledger amount=${paymentEvent.amount}, settlement amount=${settlement.amount}`,
      },
    });

    await createAuditLog({
      action: "RECONCILIATION_AMOUNT_MISMATCH",
      entityType: "SettlementRecord",
      entityId: settlement.id,
      metadata: {
        transactionRef: settlement.transactionRef,
        ledgerAmount: paymentEvent.amount,
        settlementAmount: settlement.amount,
      },
    });

    return updatedSettlement;
  }

  const creditTotal = paymentEvent.ledgerEntries
    .filter((entry) => entry.entryType === "CREDIT")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const debitTotal = paymentEvent.ledgerEntries
    .filter((entry) => entry.entryType === "DEBIT")
    .reduce((sum, entry) => sum + entry.amount, 0);

  if (creditTotal !== debitTotal) {
    const updatedSettlement = await prisma.settlementRecord.update({
      where: {
        id: settlement.id,
      },
      data: {
        reconciliationStatus: "MISMATCHED",
        mismatchReason: "Ledger entries are not balanced.",
      },
    });

    await createAuditLog({
      action: "RECONCILIATION_LEDGER_NOT_BALANCED",
      entityType: "SettlementRecord",
      entityId: settlement.id,
      metadata: {
        transactionRef: settlement.transactionRef,
        creditTotal,
        debitTotal,
      },
    });

    return updatedSettlement;
  }

  const matchedSettlement = await prisma.settlementRecord.update({
    where: {
      id: settlement.id,
    },
    data: {
      reconciliationStatus: "MATCHED",
      mismatchReason: null,
    },
  });

  await createAuditLog({
    action: "RECONCILIATION_MATCHED",
    entityType: "SettlementRecord",
    entityId: settlement.id,
    metadata: {
      transactionRef: settlement.transactionRef,
      amount: settlement.amount,
    },
  });

  return matchedSettlement;
};