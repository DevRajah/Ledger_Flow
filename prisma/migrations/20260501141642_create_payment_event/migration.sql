/*
  Warnings:

  - You are about to drop the column `failureReason` on the `PaymentEvent` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LedgerEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SettlementRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_paymentEventId_fkey";

-- AlterTable
ALTER TABLE "PaymentEvent" DROP COLUMN "failureReason";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "LedgerEntry";

-- DropTable
DROP TABLE "SettlementRecord";

-- DropEnum
DROP TYPE "LedgerEntryType";

-- DropEnum
DROP TYPE "ReconciliationStatus";
