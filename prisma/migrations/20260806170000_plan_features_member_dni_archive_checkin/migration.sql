-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_memberId_fkey";

-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MessageLog" DROP CONSTRAINT "MessageLog_memberId_fkey";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "features" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "dni" TEXT;

-- AlterTable
ALTER TABLE "GymSettings" ADD COLUMN     "checkinEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Member_dni_key" ON "Member"("dni");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

