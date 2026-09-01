-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "renewedFromId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_renewedFromId_key" ON "Payment"("renewedFromId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_renewedFromId_fkey" FOREIGN KEY ("renewedFromId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
