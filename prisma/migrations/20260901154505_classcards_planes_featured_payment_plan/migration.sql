-- CreateTable
CREATE TABLE "ClassCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'dumbbell',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GymSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "name" TEXT NOT NULL DEFAULT 'PULSO Gym',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "checkinEnabled" BOOLEAN NOT NULL DEFAULT false,
    "classesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "horariosEnabled" BOOLEAN NOT NULL DEFAULT false,
    "planesEnabled" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_GymSettings" ("address", "checkinEnabled", "classesEnabled", "email", "horariosEnabled", "id", "logoUrl", "name", "phone") SELECT "address", "checkinEnabled", "classesEnabled", "email", "horariosEnabled", "id", "logoUrl", "name", "phone" FROM "GymSettings";
DROP TABLE "GymSettings";
ALTER TABLE "new_GymSettings" RENAME TO "GymSettings";
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    "planId" TEXT,
    CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "dueDate", "id", "memberId", "paidAt", "status") SELECT "amount", "createdAt", "dueDate", "id", "memberId", "paidAt", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT
);
INSERT INTO "new_Plan" ("active", "billingCycle", "features", "id", "name", "price") SELECT "active", "billingCycle", "features", "id", "name", "price" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
