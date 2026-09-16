-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "mpPreferenceId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "mpPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpPaymentId_key" ON "Payment"("mpPaymentId");
