/*
  Warnings:

  - The values [DUPLICATE] on the enum `PaymentEventStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentEventStatus_new" AS ENUM ('RECEIVED', 'QUEUED', 'PROCESSING', 'PROCESSED', 'FAILED');
ALTER TABLE "public"."PaymentEvent" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PaymentEvent" ALTER COLUMN "status" TYPE "PaymentEventStatus_new" USING ("status"::text::"PaymentEventStatus_new");
ALTER TYPE "PaymentEventStatus" RENAME TO "PaymentEventStatus_old";
ALTER TYPE "PaymentEventStatus_new" RENAME TO "PaymentEventStatus";
DROP TYPE "public"."PaymentEventStatus_old";
ALTER TABLE "PaymentEvent" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';
COMMIT;
