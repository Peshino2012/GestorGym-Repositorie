-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memberId" TEXT NOT NULL,
    "planId" TEXT,
    "renewedFromId" TEXT,
    CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_renewedFromId_fkey" FOREIGN KEY ("renewedFromId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "dueDate", "id", "memberId", "paidAt", "planId", "status") SELECT "amount", "createdAt", "dueDate", "id", "memberId", "paidAt", "planId", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_renewedFromId_key" ON "Payment"("renewedFromId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
