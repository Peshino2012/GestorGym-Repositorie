-- AlterTable
ALTER TABLE "Member" ADD COLUMN "archivedAt" DATETIME;
ALTER TABLE "Member" ADD COLUMN "dni" TEXT;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "features" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "Booking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "GymClass" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("classId", "createdAt", "id", "memberId", "status") SELECT "classId", "createdAt", "id", "memberId", "status" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_classId_memberId_key" ON "Booking"("classId", "memberId");
CREATE TABLE "new_CheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "CheckIn_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CheckIn" ("id", "memberId", "timestamp") SELECT "id", "memberId", "timestamp" FROM "CheckIn";
DROP TABLE "CheckIn";
ALTER TABLE "new_CheckIn" RENAME TO "CheckIn";
CREATE TABLE "new_GymSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "name" TEXT NOT NULL DEFAULT 'PULSO Gym',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "checkinEnabled" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_GymSettings" ("address", "email", "id", "logoUrl", "name", "phone") SELECT "address", "email", "id", "logoUrl", "name", "phone" FROM "GymSettings";
DROP TABLE "GymSettings";
ALTER TABLE "new_GymSettings" RENAME TO "GymSettings";
CREATE TABLE "new_MessageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "MessageLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MessageLog" ("content", "id", "memberId", "sentAt", "type") SELECT "content", "id", "memberId", "sentAt", "type" FROM "MessageLog";
DROP TABLE "MessageLog";
ALTER TABLE "new_MessageLog" RENAME TO "MessageLog";
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "dueDate", "id", "memberId", "paidAt", "status") SELECT "amount", "createdAt", "dueDate", "id", "memberId", "paidAt", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Member_dni_key" ON "Member"("dni");
