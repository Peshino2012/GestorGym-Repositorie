-- AlterTable
ALTER TABLE "GymSettings" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT;
